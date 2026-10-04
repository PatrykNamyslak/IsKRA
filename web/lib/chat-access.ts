import type { Access, PayloadRequest, Where } from 'payload'
import type { User } from '@/payload-types'

export function getID(value: unknown): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) return getID(value.id)
  return null
}

export function isAdmin(user: PayloadRequest['user']): boolean {
  return user?.collection === 'users' && user.role === 'admin'
}

export function ownChatsWhere(user: Pick<User, 'id'>): Where {
  return { or: [{ user: { equals: user.id } }, { organization: { equals: user.id } }] }
}

export function ownMessagesWhere(user: Pick<User, 'id'>): Where {
  return { or: [
    { 'conversation.user': { equals: user.id } },
    { 'conversation.organization': { equals: user.id } },
  ] }
}

export const chatsAccess: Access = ({ req }) => {
  if (req.user?.collection !== 'users') return false
  return isAdmin(req.user) ? true : ownChatsWhere(req.user)
}

export const messagesAccess: Access = ({ req }) => {
  if (req.user?.collection !== 'users') return false
  return isAdmin(req.user) ? true : ownMessagesWhere(req.user)
}

// Next builds separate RSC and route modules, while Payload caches collections.
// A process-wide symbol survives those copies and development hot reloads.
// JSON/GraphQL clients still cannot manufacture a symbol in request context.
const readCapability = Symbol.for('iskra.chat-read.v1')
export type ReadSide = 'readByUser' | 'readByOrganization'
export function readContext(side: ReadSide) {
  return { chatReadCapability: readCapability, chatReadSide: side }
}
export function isReadOperation(req: PayloadRequest, side?: ReadSide): boolean {
  return req.context.chatReadCapability === readCapability &&
    (side === undefined || req.context.chatReadSide === side)
}

export const markMessagesAccess: Access = ({ req }) => {
  if (req.user?.collection !== 'users' || !isReadOperation(req)) return false
  const participant = req.context.chatReadSide === 'readByOrganization'
    ? 'conversation.organization' : 'conversation.user'
  return { [participant]: { equals: req.user.id } }
}

export const createMessageAccess: Access = async ({ req, data }) => {
  if (req.user?.collection !== 'users') return false
  // Payload also evaluates access without data to generate Admin permissions.
  if (!data) return true
  const id = getID(data.conversation)
  if (id === null) return false
  const result = await req.payload.find({
    collection: 'tester_chats', req, overrideAccess: false,
    depth: 0, pagination: false, limit: 1, select: { user: true, organization: true },
    where: { id: { equals: id } },
  })
  const chat = result.docs[0]
  return !!chat && (isAdmin(req.user) ||
    getID(chat.user) === req.user.id || getID(chat.organization) === req.user.id)
}
