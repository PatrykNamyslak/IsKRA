import { APIError, type CollectionConfig } from "payload";
import { chatsAccess, getID, isAdmin } from '@/lib/chat-access'

export const TesterChats: CollectionConfig = {
    slug: 'tester_chats',
    timestamps: true,
    access: {
        read: chatsAccess,
        create: ({ req }) => isAdmin(req.user),
        update: () => false,
        delete: () => false,
    },
    hooks: {
        beforeValidate: [({ data, operation }) => {
            if (operation === 'create' && data && getID(data.user) === getID(data.organization)) {
                throw new APIError('Rozmowa wymaga dwóch różnych uczestników.', 400)
            }
            return data
        }],
    },
    labels: {
        singular: 'Chat Testerów',
        plural: 'Chaty Testerów'
    },
    admin: {
        components: {
            views: {
                edit: {
                    default: {
                        Component: '/app/components/ChatView',
                    },
                },
            },
        },
    },
    fields: [
        {
            name: 'user',
            label: 'Użytkownik',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            hasMany: false,
            index: true,
            filterOptions: {
                role: {
                    equals: 'user',
                },
            },
        },
        {
            name: 'organization',
            label: 'Organizacja',
            type: 'relationship',
            relationTo: 'users',
            required: true,
            hasMany: false,
            index: true,
            filterOptions: {
                role: {
                    equals: 'organization',
                },
            },
        },
        {
            name: 'messages',
            label: 'Wiadomości',
            type: 'join',
            collection: 'chat_messages',
            on: 'conversation',
            defaultSort: 'createdAt',
            admin: {
                hidden: true,
                disableListColumn: true,
            },
        }
    ],

}
