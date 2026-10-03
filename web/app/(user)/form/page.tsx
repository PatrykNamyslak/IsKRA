'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  innovationActions,
  innovationCategories,
  innovationLicenses,
} from '@/lib/innovation-options'

export default function CreateInnovationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const form = event.currentTarget
    const formData = new FormData(form)
    const actions = formData.getAll('actions')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/innovations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.get('title'),
          category: formData.get('category'),
          description: formData.get('description'),
          project: formData.get('project') || undefined,
          license: formData.get('license'),
          actions: actions.map((action) => ({ action })),
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof result.errors?.[0]?.message === 'string'
            ? result.errors[0].message
            : typeof result.message === 'string'
              ? result.message
              : 'Nie udało się zapisać innowacji. Spróbuj ponownie.',
        )
      }

      setIsSubmitted(true)
      form.reset()
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Wystąpił nieoczekiwany błąd podczas zapisywania innowacji.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-700">
          Zgłoszenie innowacji
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-950">
          Dodaj nową innowację
        </h1>
        <p className="mt-3 text-gray-600">
          Opisz rozwiązanie, wybierz kategorię i wskaż dostępne materiały lub działania.
          Zgłoszenie zostanie zapisane w bazie do dalszej weryfikacji.
        </p>
      </div>

      {isSubmitted && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900"
        >
          Dziękujemy. Innowacja została zgłoszona do weryfikacji.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
      >
        <label className="flex flex-col gap-2 text-sm font-medium text-gray-800">
          Tytuł innowacji
          <input
            name="title"
            required
            maxLength={200}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-gray-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="Np. Mobilny punkt wsparcia"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-gray-800">
          Kategoria
          <select
            name="category"
            required
            defaultValue=""
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="" disabled>
              Wybierz kategorię
            </option>
            {innovationCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-gray-800">
          Opis innowacji
          <textarea
            name="description"
            required
            maxLength={5000}
            rows={5}
            className="resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-gray-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="Opisz, jak działa rozwiązanie i komu pomaga."
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-gray-800">
          Powiązany projekt (opcjonalnie)
          <textarea
            name="project"
            maxLength={2000}
            rows={3}
            className="resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-gray-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="Podaj nazwę lub opis projektu."
          />
        </label>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-medium text-gray-800">
            Dostępne akcje lub materiały
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {innovationActions.map((action) => (
              <label
                key={action}
                className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  name="actions"
                  value={action}
                  className="size-4 accent-indigo-600"
                />
                {action}
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Możesz zaznaczyć kilka odpowiedzi albo pozostawić tę sekcję pustą.
          </p>
        </fieldset>

        <label className="flex flex-col gap-2 text-sm font-medium text-gray-800">
          Licencja
          <select
            name="license"
            required
            defaultValue=""
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="" disabled>
              Wybierz licencję
            </option>
            {innovationLicenses.map((license) => (
              <option key={license} value={license}>
                {license}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Wysyłanie…' : 'Zgłoś innowację'}
        </button>
      </form>
    </section>
  )
}
