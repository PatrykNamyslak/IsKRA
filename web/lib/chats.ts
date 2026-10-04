import 'server-only'
import { createLocalReq, getPayload, type PayloadRequest, type Where } from 'payload'
import config from '@payload-config'
import { getID, ownChatsWhere, ownMessagesWhere, readContext, type ReadSide } from '@/lib/chat-access'
import type { ChatListResult } from '@/lib/chat-types'

export class ChatError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

export async function chatRequest(headers: Headers): Promise<PayloadRequest> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })
  if (!user || user.collection !== 'users') throw new ChatError(401, 'Zaloguj się, aby wyświetlić rozmowy.')
  return createLocalReq({ user, req: { headers } }, payload)
}

export function parsePositiveInteger(value: string | null, fallback?: number): number {
  if (value === null && fallback !== undefined) return fallback
  if (!value || !/^[1-9]\d*$/.test(value)) throw new ChatError(400, 'Nieprawidłowy identyfikator lub numer strony.')
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number > 2147483647) throw new ChatError(400, 'Wartość poza dozwolonym zakresem.')
  return number
}

export async function listChats(req: PayloadRequest, page = 1): Promise<ChatListResult> {
  if (!req.user) throw new ChatError(401, 'Zaloguj się.')
  const user = req.user
  const chats = await req.payload.find({
    collection: 'tester_chats', req, overrideAccess: false, depth: 0,
    select: { user: true, organization: true, createdAt: true },
    where: ownChatsWhere(user), sort: ['-createdAt', '-id'], page, limit: 20,
  })
  const counterpartIDs = [...new Set(chats.docs.map((chat) =>
    getID(getID(chat.user) === user.id ? chat.organization : chat.user),
  ).filter((id): id is number => typeof id === 'number'))]

  // Narrow exception to Users' self-only ACL: IDs come exclusively from chats
  // already authorized above. Only public names are read, never emails or roles.
  const names = new Map<number, string>()
  if (counterpartIDs.length) {
    const users = await req.payload.find({
      collection: 'users', req, overrideAccess: true, depth: 0,
      select: { name: true }, where: { id: { in: counterpartIDs } },
      pagination: false, limit: counterpartIDs.length,
    })
    for (const participant of users.docs) if (participant.name?.trim()) names.set(participant.id, participant.name.trim())
  }

  const docs = []
  // At most 20 chats per page; never populate the entire message join/history.
  for (const chat of chats.docs) {
    const userSide = getID(chat.user) === user.id
    const counterpart = getID(userSide ? chat.organization : chat.user)
    const readSide: ReadSide = userSide ? 'readByUser' : 'readByOrganization'
    const latest = await req.payload.find({
      collection: 'chat_messages', req, overrideAccess: false, depth: 0,
      where: { conversation: { equals: chat.id } },
      select: { content: true, createdAt: true },
      sort: ['-createdAt', '-id'], pagination: false, limit: 1,
    })
    // An outgoing last message must not hide older unread incoming messages.
    const unread = await req.payload.find({
      collection: 'chat_messages', req, overrideAccess: false, depth: 0,
      where: { and: [
        { conversation: { equals: chat.id } },
        { sender: { not_equals: user.id } },
        { [readSide]: { not_equals: true } },
      ] }, select: { createdAt: true }, pagination: false, limit: 1,
    })
    docs.push({
      id: chat.id,
      to: (typeof counterpart === 'number' && names.get(counterpart)) ||
        `${userSide ? 'Instytucja' : 'Użytkownik'} #${counterpart ?? '?'}`,
      last_message: latest.docs[0]?.content ?? '',
      last_message_date: latest.docs[0]?.createdAt ?? null,
      readed: unread.docs.length === 0,
    })
  }
  return { docs, page: chats.page ?? page, totalPages: chats.totalPages, totalDocs: chats.totalDocs,
    hasNextPage: chats.hasNextPage, hasPrevPage: chats.hasPrevPage }
}

export async function markChatsRead(req: PayloadRequest, conversationID?: number, messageIDs?: number[]): Promise<number> {
  if (!req.user) throw new ChatError(401, 'Zaloguj się.')
  const user = req.user
  if (conversationID !== undefined) {
    const chat = await req.payload.find({
      collection: 'tester_chats', req, overrideAccess: false, depth: 0,
      select: { createdAt: true }, pagination: false, limit: 1,
      where: { and: [ownChatsWhere(user), { id: { equals: conversationID } }] },
    })
    if (!chat.docs.length) throw new ChatError(404, 'Nie znaleziono rozmowy.')
  }
  const scope: Where = { and: [ownMessagesWhere(user), ...(conversationID === undefined ? [] : [
    { conversation: { equals: conversationID } },
  ]), ...(messageIDs === undefined ? [] : [{ id: { in: messageIDs } }])] }
  const last = await req.payload.find({
    collection: 'chat_messages', req, overrideAccess: false, depth: 0,
    where: scope, sort: '-id', select: { createdAt: true }, limit: 1, pagination: false,
  })
  const maxID = last.docs[0]?.id
  if (maxID === undefined) return 0
  let marked = 0
  for (const side of ['readByUser', 'readByOrganization'] as const) {
    const participant = side === 'readByUser' ? 'conversation.user' : 'conversation.organization'
    const where: Where = { and: [scope,
      { [participant]: { equals: user.id } },
      { sender: { not_equals: user.id } },
      { [side]: { not_equals: true } },
      // This project's PostgreSQL IDs are generated integers. Messages with
      // IDs allocated after this snapshot must remain unread.
      { id: { less_than_equal: maxID } },
    ] }
    while (true) {
      const pending = await req.payload.find({
        collection: 'chat_messages', req, overrideAccess: false, depth: 0,
        where, select: { createdAt: true }, sort: 'id', pagination: false, limit: 100,
      })
      if (!pending.docs.length) break
      const result = await req.payload.update({
        collection: 'chat_messages', req, overrideAccess: false, depth: 0,
        context: readContext(side), data: { [side]: true },
        where: { and: [where, { id: { in: pending.docs.map(({ id }) => id) } }] },
        limit: 100, select: { createdAt: true },
      })
      if (result.errors.length) throw new ChatError(500, 'Nie udało się oznaczyć wszystkich wiadomości. Spróbuj ponownie.')
      marked += result.docs.length
    }
  }
  return marked
}
