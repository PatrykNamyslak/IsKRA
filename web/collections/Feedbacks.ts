import type { CollectionConfig } from 'payload'
import type { User } from '../payload-types'

export const Feedbacks: CollectionConfig = {
  slug: 'feedbacks',
  labels: {
    singular: 'Opinia',
    plural: 'Opinie',
  },
  admin: {
    useAsTitle: 'comment',
    defaultColumns: ['innovation', 'rating', 'authorName', 'role', 'createdAt'],
    group: 'Zarządzanie innowacjami',
  },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => (user as User | null)?.role === 'admin',
    delete: ({ req: { user } }) => (user as User | null)?.role === 'admin',
  },
  fields: [
    {
      name: 'innovation',
      type: 'relationship',
      relationTo: 'innovations',
      required: true,
      label: 'Dotyczy innowacji',
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      required: true,
      defaultValue: 5,
      label: 'Ocena punktowa',
    },
    {
      name: 'comment',
      type: 'textarea',
      required: true,
      label: 'Treść opinii',
    },
    {
      name: 'authorName',
      type: 'text',
      label: 'Autor opinii',
    },
    {
      name: 'authorEmail',
      type: 'text',
      label: 'Adres e-mail',
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'user',
      options: [
        { label: 'Użytkownik', value: 'user' },
        { label: 'Tester', value: 'tester' },
        { label: 'Opiekun', value: 'caregiver' },
        { label: 'Specjalista', value: 'specialist' },
      ],
      label: 'Rola zgłaszającego',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'approved',
      options: [
        { label: 'Widoczna', value: 'approved' },
        { label: 'Oczekująca', value: 'pending' },
        { label: 'Ukryta', value: 'hidden' },
      ],
      label: 'Status moderacji',
    },
  ],
}
