import type { CollectionConfig } from 'payload'
import type { User } from '../payload-types'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Kategoria innowacji',
    plural: 'Kategorie innowacji',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'description', 'createdAt'],
    group: 'Zarządzanie innowacjami',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => (user as User | null)?.role === 'admin',
    update: ({ req: { user } }) => (user as User | null)?.role === 'admin',
    delete: ({ req: { user } }) => (user as User | null)?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      label: 'Nazwa kategorii',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Opis kategorii i obszaru wsparcia ROPS',
    },
  ],
}
