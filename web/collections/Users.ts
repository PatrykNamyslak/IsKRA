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

  auth: true,
  fields: [
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
