import type { CollectionConfig } from 'payload'
import type { User } from '../payload-types'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'name', 'createdAt'],
    // Widoczne tylko dla roli admin w panelu
    hidden: ({ user }) => (user as User | null)?.role !== 'admin',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if ((user as User).role === 'admin') return true
      return { id: { equals: user.id } }
    },
    create: () => true, // pozwala na rejestrację organizacji
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
      label: 'Imię i nazwisko',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'organization',
      options: [
        { label: 'Administrator ROPS', value: 'admin' },
        { label: 'Organizacja', value: 'organization' },
        { label: 'Użytkownik', value: 'user' },
        { label: 'Tester (badacz / użytkownik)', value: 'tester' },
        { label: 'Badacz (archiwalna)', value: 'researcher' },
      ],
      label: 'Rola w systemie',
    },
  ],
}
