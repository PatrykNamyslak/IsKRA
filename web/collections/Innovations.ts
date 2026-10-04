import { slugField, type CollectionConfig } from 'payload'
import type { User } from '../payload-types'
import { ROPS_CATEGORY_OPTIONS } from '../lib/categories'
import { slugify } from '../lib/slugify'
import { sendAdminInnovationNotification } from '../lib/email'

export const Innovations: CollectionConfig = {
  slug: 'innovations',
  labels: {
    singular: 'Innowacja',
    plural: 'Innowacje',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'creatorType', 'category', 'status', 'availableForTesting', 'createdAt'],
    group: 'Zarządzanie innowacjami',
  },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => Boolean((user as User | null)),
    delete: ({ req: { user } }) => (user as User | null)?.role === 'admin',
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        if (!data) return data
        const title = data.title || originalDoc?.title
        let candidate = data.slug ? slugify(String(data.slug)) : (title ? slugify(String(title)) : '')
        if (!candidate) {
          candidate = `innowacja-${Date.now()}`
        }

        if (req?.payload) {
          let finalSlug = candidate
          let count = 1
          const docId = data.id || originalDoc?.id

          while (true) {
            try {
              const existing = await req.payload.find({
                collection: 'innovations',
                where: {
                  and: [
                    { slug: { equals: finalSlug } },
                    ...(docId ? [{ id: { not_equals: docId } }] : []),
                  ],
                },
                limit: 1,
                overrideAccess: true,
              })

              if (existing.docs.length > 0) {
                count++
                finalSlug = `${candidate}-${count}`
              } else {
                break
              }
            } catch {
              break
            }
          }
          candidate = finalSlug
        }

        data.slug = candidate
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation, context }) => {
        // Powiadamiaj administratorów e-mailem przy dodaniu nowej innowacji
        if (operation === 'create' && req?.payload && !context?.disableEmailNotifications) {
          try {
            const adminUsers = await req.payload.find({
              collection: 'users',
              where: {
                role: {
                  equals: 'admin',
                },
              },
              limit: 100,
              overrideAccess: true,
            })

            const adminRecipients = adminUsers.docs
              .filter((admin): admin is typeof admin & { email: string } => Boolean(admin.email && admin.email.trim()))
              .map((admin) => ({
                email: admin.email,
                name: admin.name || null,
              }))

            if (adminRecipients.length > 0) {
              await sendAdminInnovationNotification({
                adminRecipients,
                innovation: doc,
              })
            }
          } catch (error) {
            console.error('[Innovations] Błąd podczas wysyłania powiadomień e-mail:', error)
          }
        }
      },
    ],
  },
  fields: [
    slugField({
      useAsSlug: 'title',
      slugify: ({ valueToSlugify }) => slugify(valueToSlugify || ''),
    }),
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tytuł innowacji',
    },
    {
      name: 'creatorType',
      type: 'select',
      required: true,
      defaultValue: 'application',
      options: [
        { label: 'Wniosek o realizację', value: 'application' },
        { label: 'Zgłoszenie nowej potrzeby', value: 'matchmaking_gap' },
        { label: 'Giełda pomysłów', value: 'idea_exchange' },
      ],
      label: 'Ścieżka pochodzenia',
    },
    {
      name: 'wantsToImplement',
      type: 'checkbox',
      defaultValue: true,
      label: 'Zgłaszający deklaruje chęć samodzielnego wdrożenia',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Kategoria innowacji',
    },
    {
      name: 'patientProblem',
      type: 'textarea',
      required: true,
      label: 'Zgłoszony problem',
    },
    {
      name: 'proposedSolution',
      type: 'textarea',
      label: 'Proponowane rozwiązanie',
    },
    {
      name: 'targetGroup',
      type: 'text',
      label: 'Grupa docelowa',
    },
    {
      name: 'careRequirements',
      type: 'textarea',
      label: 'Wymagania opiekuńcze lub medyczne',
    },
    {
      name: 'supportNeeded',
      type: 'textarea',
      label: 'Wymagane wsparcie',
    },
    {
      name: 'contactName',
      type: 'text',
      label: 'Dane zgłaszającego',
    },
    {
      name: 'contactEmail',
      type: 'text',
      label: 'E-mail kontaktowy',
    },
    {
      name: 'contactPhone',
      type: 'text',
      label: 'Telefon kontaktowy',
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: false,
      label: 'Organizacja zgłaszająca',
    },
    {
      name: 'ropsReport',
      type: 'textarea',
      label: 'Raport ROPS',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'submitted',
      label: 'Status innowacji',
      options: [
        { label: 'Zgłoszona', value: 'submitted' },
        { label: 'W trakcie weryfikacji', value: 'under_review' },
        { label: 'Zatwierdzona', value: 'approved' },
        { label: 'Odrzucona', value: 'rejected' },
        { label: 'W trakcie testów', value: 'testing' },
        { label: 'Zakończona', value: 'completed' },
      ],
    },
    {
      name: 'feasibility',
      type: 'group',
      label: 'Ocena wykonalności ROPS',
      fields: [
        {
          name: 'technicalAssessment',
          type: 'textarea',
          label: 'Ocena wykonalności technologicznej',
        },
        {
          name: 'financialAssessment',
          type: 'textarea',
          label: 'Ocena możliwości finansowych',
        },
        {
          name: 'adminNotes',
          type: 'textarea',
          label: 'Uwagi administratora ROPS',
        },
      ],
    },
    {
      name: 'availableForTesting',
      type: 'checkbox',
      defaultValue: false,
      label: 'Opublikuj na giełdzie projektów',
    },
    {
      name: 'assignedTester',
      type: 'text',
      label: 'Przypisany tester',
    },
    {
      name: 'researchPlan',
      type: 'textarea',
      label: 'Metodyka i plan testów',
    },
    {
      name: 'testReport',
      type: 'textarea',
      label: 'Raport końcowy z testów',
    },
    {
      name: 'testOutcome',
      type: 'select',
      label: 'Wynik testów',
      options: [
        { label: 'Sukces', value: 'success' },
        { label: 'Częściowy sukces', value: 'partial_success' },
        { label: 'Niepowodzenie', value: 'failure' },
      ],
    },
    {
      name: 'recommendations',
      type: 'textarea',
      label: 'Rekomendacje i dalsze kroki',
    },
  ],
}
