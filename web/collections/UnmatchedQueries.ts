import type { CollectionConfig } from 'payload'
import type { User } from '../payload-types'
import { ROPS_CATEGORY_OPTIONS } from '../lib/categories'

export const UnmatchedQueries: CollectionConfig = {
  slug: 'unmatched-queries',
  labels: {
    singular: 'Niezaspokojona potrzeba',
    plural: 'Niezaspokojone potrzeby',
  },
  admin: {
    useAsTitle: 'query',
    defaultColumns: ['query', 'category', 'status', 'createdAt'],
    group: 'Zarządzanie innowacjami',
  },
  access: {
    read: ({ req: { user } }) => (user as User | null)?.role === 'admin',
    create: () => true, // tworzone publicznie gdy matchmaking nie znajdzie rozwiązania
    update: ({ req: { user } }) => (user as User | null)?.role === 'admin',
    delete: ({ req: { user } }) => (user as User | null)?.role === 'admin',
  },
  fields: [
    {
      name: 'query',
      type: 'textarea',
      required: true,
      label: 'Wyszukiwany problem lub potrzeba pacjenta/użytkownika',
    },
    {
      name: 'category',
      type: 'select',
      options: [...ROPS_CATEGORY_OPTIONS],
      defaultValue: 'Dla seniorów',
      label: 'Sugerowana kategoria',
    },
    {
      name: 'aiAnalysis',
      type: 'textarea',
      label: 'Analiza potrzeb i rekomendacja AI dla ROPS',
    },
    {
      name: 'userContact',
      type: 'text',
      label: 'Kontakt zgłaszającego (opcjonalny e-mail lub telefon)',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'Nowa potrzeba', value: 'new' },
        { label: 'Weryfikacja przez ROPS', value: 'under_review' },
        { label: 'Uruchomiono nabór grantowy', value: 'call_opened' },
        { label: 'Wdrożona innowacja', value: 'closed' },
      ],
      label: 'Status zapotrzebowania',
    },
  ],
}
