import 'server-only'
import type { PayloadRequest, Where } from 'payload'
import type { ChatMessage, TesterChat } from '@/payload-types'
import type { ConversationMessage, ConversationResult } from '@/lib/chat-types'
import { getID, ownChatsWhere } from '@/lib/chat-access'
import { ChatError } from '@/lib/chats'

async function authorizedConversation(req: PayloadRequest, id: number) {
  if (!req.user) throw new ChatError(401, 'Zaloguj się, aby wyświetlić rozmowę.')
  const result = await req.payload.find({
    collection: 'tester_chats', req, overrideAccess: false, depth: 0,
    pagination: false, limit: 1, select: { user: true, organization: true },
    where: { and: [ownChatsWhere(req.user), { id: { equals: id } }] },
  })
  const conversation = result.docs[0]
  if (!conversation) throw new ChatError(404, 'Nie znaleziono rozmowy.')
  return conversation
}

async function conversationTitle(req: PayloadRequest, chat: Pick<TesterChat, 'user' | 'organization'>) {
  const userSide = getID(chat.user) === req.user!.id
  const participant = getID(userSide ? chat.organization : chat.user)
  // Only the name of the participant in an already-authorized conversation.
  const result = await req.payload.find({
    collection: 'users', req, overrideAccess: true, depth: 0,
    pagination: false, limit: 1, select: { name: true },
    where: { id: { equals: participant } },
  })
  return result.docs[0]?.name?.trim() || `${userSide ? 'Instytucja' : 'Użytkownik'} #${participant}`
}

function messageForClient(message: Pick<ChatMessage, 'id' | 'content' | 'sender' | 'createdAt' | 'readByUser' | 'readByOrganization'>,
  req: PayloadRequest, chat: Pick<TesterChat, 'user' | 'organization'>, title: string): ConversationMessage {
  const sender = getID(message.sender)
  const isOwn = sender === req.user!.id
  const userSide = getID(chat.user) === req.user!.id
  return {
    id: message.id, content: message.content, createdAt: message.createdAt, isOwn,
    senderName: isOwn ? 'Ty' : sender === getID(userSide ? chat.organization : chat.user) ? title : 'Administrator',
    readByOther: isOwn && (userSide ? message.readByOrganization : message.readByUser) === true,
  }
}

export async function getConversation(req: PayloadRequest, id: number, before?: number): Promise<ConversationResult> {
  const chat = await authorizedConversation(req, id)
  const where: Where = { conversation: { equals: id } }
  if (before !== undefined) {
    const anchor = await req.payload.find({
      collection: 'chat_messages', req, overrideAccess: false, depth: 0,
      pagination: false, limit: 1, select: { createdAt: true },
      where: { and: [where, { id: { equals: before } }] },
    })
    if (!anchor.docs[0]) throw new ChatError(404, 'Nie znaleziono wiadomości.')
    where.and = [{ or: [
      { createdAt: { less_than: anchor.docs[0].createdAt } },
      { and: [{ createdAt: { equals: anchor.docs[0].createdAt } }, { id: { less_than: before } }] },
    ] }]
  }
  const result = await req.payload.find({
    collection: 'chat_messages', req, overrideAccess: false, depth: 0,
    where, pagination: false, limit: 51, sort: ['-createdAt', '-id'],
    select: { content: true, sender: true, createdAt: true, readByUser: true, readByOrganization: true },
  })
  const title = await conversationTitle(req, chat)
  const messages = result.docs.slice(0, 50).reverse()
  return { id, title, messages: messages.map((message) => messageForClient(message, req, chat, title)),
    olderCursor: result.docs.length > 50 ? messages[0].id : null }
}

export async function sendConversationMessage(req: PayloadRequest, id: number, content: unknown): Promise<ConversationMessage> {
  const chat = await authorizedConversation(req, id)
  if (typeof content !== 'string' || !content.trim() || content.trim().length > 10000) {
    throw new ChatError(400, 'Wpisz wiadomość o długości od 1 do 10 000 znaków.')
  }
  const message = await req.payload.create({
    collection: 'chat_messages', req, overrideAccess: false, depth: 0,
    data: { conversation: id, sender: req.user!.id, content: content.trim() },
  })
  return messageForClient(message, req, chat, '')
}
