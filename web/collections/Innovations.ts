import type { CollectionConfig } from "payload";

export const Innovations: CollectionConfig = {
    slug: "innovations",
    labels: {
        singular: "Innowacja",
        plural: "Innowacje",
    },
    admin: {
        useAsTitle: "title",
        defaultColumns: ["title", "organization", "status", "availableForTesting"],
        group: "Zarządzanie innowacjami",
    },
    fields: [
        {
            name: "title",
            type: "text",
            required: true,
            label: "Tytuł innowacji",
        },
        {
            name: "organization",
            type: "relationship",
            relationTo: "organizations",
            required: true,
            label: "Organizacja zgłaszająca",
        },
        {
            name: "patientProblem",
            type: "textarea",
            required: true,
            label: "Problem lub potrzeba pacjenta",
        },
        {
            name: "careRequirements",
            type: "textarea",
            label: "Wymagania medyczne i opiekuńcze",
        },
        {
            name: "proposedSolution",
            type: "textarea",
            label: "Proponowane rozwiązanie",
        },
        {
            name: "ropsReport",
            type: "textarea",
            label: "Raport zgodny ze standardem ROPS",
        },
        {
            name: "status",
            type: "select",
            required: true,
            defaultValue: "submitted",
            label: "Status",
            options: [
                { label: "Zgłoszona", value: "submitted" },
                { label: "W trakcie weryfikacji", value: "under_review" },
                { label: "Zatwierdzona", value: "approved" },
                { label: "Odrzucona", value: "rejected" },
                { label: "W trakcie testów", value: "testing" },
                { label: "Zakończona", value: "completed" },
            ],
        },
        {
            name: "feasibility",
            type: "group",
            label: "Ocena wykonalności ROPS",
            fields: [
                {
                    name: "technicalAssessment",
                    type: "textarea",
                    label: "Ocena wykonalności technologicznej",
                },
                {
                    name: "financialAssessment",
                    type: "textarea",
                    label: "Ocena możliwości finansowych",
                },
                {
                    name: "adminNotes",
                    type: "textarea",
                    label: "Uwagi administratora",
                },
            ],
        },
        {
            name: "availableForTesting",
            type: "checkbox",
            defaultValue: false,
            label: "Opublikuj na liście projektów do testowania",
        },
        {
            name: "assignedResearcher",
            type: "relationship",
            relationTo: "users",
            filterOptions: {
                role: {
                    equals: "researcher",
                },
            },
            label: "Przypisany badacz",
        },
        {
            name: "researchPlan",
            type: "textarea",
            label: "Metodyka i plan testów",
        },
        {
            name: "testReport",
            type: "textarea",
            label: "Raport końcowy z testów",
        },
        {
            name: "testOutcome",
            type: "select",
            label: "Wynik testów",
            options: [
                { label: "Sukces", value: "success" },
                { label: "Częściowy sukces", value: "partial_success" },
                { label: "Niepowodzenie", value: "failure" },
            ],
        },
        {
            name: "recommendations",
            type: "textarea",
            label: "Rekomendacje i dalsze kroki",
        },
    ],
};
