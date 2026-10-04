import { APIError, type CollectionConfig } from 'payload'
import { createMessageAccess, getID, isReadOperation, markMessagesAccess, messagesAccess } from '@/lib/chat-access'

export const ChatMessages: CollectionConfig = {
  slug: 'chat_messages',
  labels: { singular: 'Wiadomość', plural: 'Wiadomości' },
  timestamps: true,
  admin: { hidden: true },
  access: {
    create: createMessageAccess,
    read: messagesAccess,
    update: markMessagesAccess,
    delete: () => false,
  },
  hooks: {
    beforeValidate: [({ data, req, operation }) => {
      if (operation === 'create' && data) {
        if (req.user?.collection !== 'users') throw new APIError('Zaloguj się, aby wysłać wiadomość.', 401)
        delete data.id
        data.sender = req.user.id
        data.createdAt = new Date().toISOString()
        data.readByUser = false
        data.readByOrganization = false
        if (typeof data.content === 'string') data.content = data.content.trim()
      }
      return data
    }],
    beforeChange: [({ data, originalDoc, operation, req }) => {
      if (operation === 'update') {
        if (!isReadOperation(req)) throw new APIError('Niedozwolona zmiana wiadomości.', 403)
        for (const key of ['conversation', 'sender', 'content', 'createdAt']) data[key] = originalDoc[key]
        const side = req.context.chatReadSide
        // Payload's beforeValidate restores unspecified fields from originalDoc.
        // Drop the other receipt so concurrent readers update separate columns
        // instead of overwriting a stale value belonging to the other side.
        delete data.readByUser
        delete data.readByOrganization
        if (side === 'readByUser' || side === 'readByOrganization') data[side] = true
      }
      return data
    }],
  },
  fields: [
    {
      name: 'conversation', label: 'Rozmowa', type: 'relationship', relationTo: 'tester_chats',
      required: true, hasMany: false, index: true, access: { update: () => false },
    },
    {
      name: 'sender', label: 'Nadawca', type: 'relationship', relationTo: 'users',
      required: true, hasMany: false, access: { update: () => false },
      // The session sets the author. Users' self-only ACL must not prevent
      // validating a message sent by the other participant during read marking.
      validate: (value, { req, operation }) => {
        if (operation === 'update') return true
        return getID(value) === req.user?.id
          ? true : 'Nadawca musi być zalogowanym użytkownikiem.'
      },
    },
    {
      name: 'content', label: 'Treść wiadomości', type: 'textarea', required: true,
      maxLength: 10000, access: { update: () => false },
    },
    ...(['readByUser', 'readByOrganization'] as const).map((side) => ({
      name: side, label: side === 'readByUser' ? 'Przeczytana przez użytkownika' : 'Przeczytana przez organizację',
      type: 'checkbox' as const, defaultValue: false, index: true,
      admin: { readOnly: true },
      access: { create: () => false, update: ({ req }: { req: import('payload').PayloadRequest }) => isReadOperation(req, side) },
    })),
  ],
}
