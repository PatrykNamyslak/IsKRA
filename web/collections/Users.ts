import type { CollectionConfig } from 'payload'
import type { User } from '../payload-types'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'createdAt'],
    // Widoczne tylko dla roli admin (ukryte dla user, organization, researcher)
    hidden: ({ user }) => (user as User | null)?.role !== 'admin',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if ((user as User).role === 'admin') return true
      return { id: { equals: user.id } }
    },
    create: () => true, // pozwala na rejestrację
    update: ({ req: { user } }) => {
      if (!user) return false
      if ((user as User).role === 'admin') return true
      return { id: { equals: user.id } }
    },
    delete: ({ req: { user } }) => (user as User | null)?.role === 'admin',
  },

  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nazwa / Imię i nazwisko',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Organization', value: 'organization' },
        { label: 'Researcher', value: 'researcher' },
        { label: 'User', value: 'user' },
      ],
    },
  ],

}
