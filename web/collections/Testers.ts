import {CollectionConfig} from "payload";

export const WantToTest: CollectionConfig = {
    slug: 'want_to_test',
    labels: {
        singular: 'Kandydat na testera',
        plural: 'Kandydaci na testerów'
    },
    fields: [
        {
            name: 'name',
            label: 'Imię',
            type: 'text',
            required: true,
        },
        {
            name: 'surname',
            label: 'Nazwisko',
            type: 'text',
            required: true,
        },
        {
            name: 'email',
            label: 'Adres email',
            type: 'email',
            required: true,
        },
        {
            name: 'about',
            label: 'Biografia',
            type: 'textarea',
            required: true,
        },
        {
            name: 'why',
            label: 'Dlaczego ty',
            type: 'textarea',
            required: true,
        }
    ]
}