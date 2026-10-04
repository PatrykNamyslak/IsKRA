// src/collections/Messages.ts
import type { CollectionConfig } from 'payload'

function getID(value: unknown): string | number | null {
    if (typeof value === 'string' || typeof value === 'number') {
        return value
    }

    if (typeof value === 'object' && value !== null && 'id' in value) {
        const id = value.id

        if (typeof id === 'string' || typeof id === 'number') {
            return id
        }
    }

    return null
}

export const ChatMessages: CollectionConfig = {
    slug: 'chat_messages',
    labels: {
        singular: 'Wiadomość',
        plural: 'Wiadomości',
    },
    timestamps: true,
    admin: {
        hidden: true,
    },
    fields: [
        {
            name: 'conversation',
            label: 'Rozmowa',
            type: 'relationship',
            relationTo: 'tester_chats',
            required: true,
            hasMany: false,
            index: true,
        },
        {
            name: 'sender',
            label: 'Nadawca',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            hasMany: false,

            filterOptions: async ({ siblingData, req }) => {
                const conversationValue =
                    typeof siblingData === 'object' &&
                    siblingData !== null &&
                    'conversation' in siblingData
                        ? siblingData.conversation
                        : undefined

                const conversationID = getID(conversationValue)

                if (conversationID === null) return false

                const conversation = await req.payload.findByID({
                    collection: 'tester_chats',
                    id: conversationID,
                    depth: 0,
                    select: {
                        user: true,
                        organization: true,
                    },
                    overrideAccess: false,
                    req,
                })

                const userID = getID(conversation.user)
                const organizationID = getID(conversation.organization)

                if (userID === null || organizationID === null) return false

                const senderIDs = [userID, organizationID]

                // An administrator may join the conversation as their own account.
                if (req.user?.role === 'admin') {
                    senderIDs.push(req.user.id)
                }

                return {
                    id: {
                        in: senderIDs,
                    },
                }
            },
        },
        {
            name: 'content',
            label: 'Treść wiadomości',
            type: 'textarea',
            required: true,
        },
    ],
}
