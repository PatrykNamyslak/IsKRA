import type { CollectionConfig } from 'payload'
import type { User } from '../payload-types'

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  labels: {
    singular: 'Organizacja',
    plural: 'Organizacje',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'user', 'createdAt'],
    // Widoczne tylko dla roli organization oraz admin
    hidden: ({ user }) => {
      const role = (user as User | null)?.role
      return role !== 'admin' && role !== 'organization'
    },
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      const role = (user as User | null)?.role
      return role === 'admin' || role === 'organization'
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if ((user as User).role === 'admin') return true
      return {
        user: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => (user as User | null)?.role === 'admin',
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nazwa organizacji',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      filterOptions: {
        role: {
          equals: 'organization',
        },
      },
      label: 'Konto organizatora',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Opis',
    },
  ],
}
