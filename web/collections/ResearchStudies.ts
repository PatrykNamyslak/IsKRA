import type { CollectionConfig } from 'payload'
import type { User } from '../payload-types'

export const ResearchStudies: CollectionConfig = {
  slug: 'research-studies',
  labels: {
    singular: 'Projekt badawczy',
    plural: 'Projekty badawcze',
  },
  admin: {
    useAsTitle: 'title',
    // Widoczne tylko dla roli researcher oraz admin
    hidden: ({ user }) => {
      const role = (user as User | null)?.role
      return role !== 'admin' && role !== 'researcher'
    },
  },
  access: {
    read: ({ req: { user } }) => {
      const role = (user as User | null)?.role
      return role === 'admin' || role === 'researcher'
    },
    create: ({ req: { user } }) => {
      const role = (user as User | null)?.role
      return role === 'admin' || role === 'researcher'
    },
    update: ({ req: { user } }) => {
      const role = (user as User | null)?.role
      return role === 'admin' || role === 'researcher'
    },
    delete: ({ req: { user } }) => (user as User | null)?.role === 'admin',
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tytuł projektu / badania',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Opis badania',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Wersja robocza', value: 'draft' },
        { label: 'W trakcie', value: 'in_progress' },
        { label: 'Zakończone', value: 'completed' },
      ],
      label: 'Status',
    },
  ],
}
