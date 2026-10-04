import {CollectionConfig} from "payload";

export const TesterChats: CollectionConfig = {
    slug: 'tester_chats',
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