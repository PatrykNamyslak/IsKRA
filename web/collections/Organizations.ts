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
      const role = (user as User | null)?.role
      return role === 'admin' || role === 'organization'
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
      name: 'description',
      type: 'textarea',
      label: 'Opis',
    },
  ],
}
