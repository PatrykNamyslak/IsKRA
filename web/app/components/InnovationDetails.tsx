'use client'

import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'

interface Category {
  id?: string | number
  name?: string
  description?: string
}

interface Innovation {
  id: string | number
  title: string
  slug?: string
  creatorType?: 'application' | 'matchmaking_gap' | 'idea_exchange'
  category?: string | Category
  patientProblem?: string
  proposedSolution?: string
  targetGroup?: string
  status?: string
  availableForTesting?: boolean
  wantsToImplement?: boolean
  supportNeeded?: string
  createdAt?: string
}

interface Feedback {
  id: string | number
  rating: number
  comment: string
  authorName?: string
  role?: string
  createdAt?: string
  isLocal?: boolean
}

interface Props {
  slug: string
}

const CREATOR_LABELS: Record<NonNullable<Innovation['creatorType']>, string> = {
  application: 'Wniosek o wdrożenie',
  matchmaking_gap: 'Niezaspokojona potrzeba',
  idea_exchange: 'Giełda pomysłów',
}

function getCategoryName(category?: string | Category) {
  if (!category) return null
  if (typeof category === 'object' && category.name) return category.name
  if (typeof category === 'string') return category
  return null
}

function getAverageRating(feedbacks: Feedback[]) {
  if (feedbacks.length === 0) return 0
  return feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length
}

export default function InnovationDetails({ slug }: Props) {
  const [innovation, setInnovation] = useState<Innovation | null>(null)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guestName, setGuestName] = useState('')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(0)
  const [role, setRole] = useState('user')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadDetails = async () => {
      setIsLoading(true)
      setError(null)
      try {
        let foundInnovation: Innovation | undefined

        // Najpierw szukamy po polu slug
        const innovationsResponse = await fetch(
          `/api/innovations?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`
        )
        if (innovationsResponse.ok) {
          const innovationsData = await innovationsResponse.json()
          if (innovationsData.docs && innovationsData.docs.length > 0) {
            foundInnovation = innovationsData.docs[0]
          }
        }

        // Fallback: jeśli nie znaleziono i parametr jest liczbą, sprawdzamy po id
        if (!foundInnovation && !isNaN(Number(slug))) {
          const fallbackRes = await fetch(
            `/api/innovations?where[id][equals]=${encodeURIComponent(slug)}&limit=1`
          )
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json()
            if (fallbackData.docs && fallbackData.docs.length > 0) {
              foundInnovation = fallbackData.docs[0]
            }
          }
        }

        if (!foundInnovation) throw new Error('Nie znaleziono tej innowacji.')
        setInnovation(foundInnovation)

        const feedbackResponse = await fetch(
          `/api/feedbacks?where[innovation][equals]=${encodeURIComponent(foundInnovation.id)}&sort=-createdAt&limit=100`
        )
        if (!feedbackResponse.ok) throw new Error('Nie udało się wczytać ocen i opinii.')
        const feedbackData = await feedbackResponse.json()
        setFeedbacks(feedbackData.docs || [])
      } catch (loadError: unknown) {
        setError(loadError instanceof Error ? loadError.message : 'Wystąpił nieoczekiwany błąd.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadDetails()
  }, [slug])

  const average = getAverageRating(feedbacks)

  const handleSubmitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!comment.trim() || rating === 0 || !innovation) return

    setIsSubmitting(true)
    setNotice('')

    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          innovation: innovation.id,
          rating,
          comment: comment.trim(),
          authorName: guestName.trim() || 'Gość',
          role,
        }),
      })

      if (!res.ok) throw new Error('Nie udało się zapisać opinii.')

      const resJson = await res.json()
      const created: Feedback | undefined = resJson.doc || resJson.data

      if (created) {
        setFeedbacks((prev) => [created, ...prev])
      } else {
        // fallback jeśli API nie zwróciło doc
        setFeedbacks((prev) => [
          {
            id: `local-${Date.now()}`,
            rating,
            comment: comment.trim(),
            authorName: guestName.trim() || 'Gość',
            role,
            createdAt: new Date().toISOString(),
            isLocal: true,
          },
          ...prev,
        ])
      }

      setGuestName('')
      setComment('')
      setRating(0)
      setRole('user')
      setNotice('✓ Opinia została zapisana!')
    } catch (err: unknown) {
      setNotice(err instanceof Error ? err.message : 'Błąd zapisu opinii.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center text-gray-500">
        Wczytywanie szczegółów innowacji...
      </div>
    )
  }

  if (error || !innovation) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <Link href="/innovations" className="text-sm font-semibold text-indigo-700 hover:underline">
          ← Wróć do katalogu
        </Link>
        <div role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          {error || 'Nie znaleziono tej innowacji.'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/innovations" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 transition hover:text-indigo-900">
          <span aria-hidden="true">←</span> Wróć do katalogu
        </Link>

        <div className="mt-6">
          <main className="space-y-6">
            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9">
              <div className="flex flex-wrap gap-2">
                {getCategoryName(innovation.category) && (
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800">
                    {getCategoryName(innovation.category)}
                  </span>
                )}
                {innovation.creatorType && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {CREATOR_LABELS[innovation.creatorType]}
                  </span>
                )}
                {innovation.availableForTesting && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                    Dostępna do testów
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                {innovation.title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                {innovation.status ? `Status: ${innovation.status}` : 'Szczegóły innowacji'}
                {innovation.createdAt && ` · Dodano ${new Date(innovation.createdAt).toLocaleDateString('pl-PL')}`}
              </p>

              <div className="mt-8 grid gap-5">
                {innovation.patientProblem && (
                  <DetailSection title="Problem, na który odpowiada">
                    {innovation.patientProblem}
                  </DetailSection>
                )}
                {innovation.proposedSolution && (
                  <DetailSection title="Proponowane rozwiązanie">
                    {innovation.proposedSolution}
                  </DetailSection>
                )}
                {innovation.targetGroup && (
                  <DetailSection title="Grupa docelowa">
                    {innovation.targetGroup}
                  </DetailSection>
                )}
                {innovation.supportNeeded && (
                  <DetailSection title={innovation.creatorType === 'idea_exchange' ? 'Poszukiwane wsparcie' : 'Potrzebne wsparcie'}>
                    {innovation.supportNeeded}
                  </DetailSection>
                )}
              </div>
            </section>

            <section id="opinie" className="scroll-mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9">
              <div className="border-b border-gray-100 pb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Głos społeczności</p>
                <h2 className="mt-1 text-2xl font-extrabold text-gray-950">Oceny i komentarze</h2>
              </div>

              <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/70 p-5 sm:p-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="min-w-48">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Średnia ocena</p>
                    <div className="mt-1 flex items-end gap-2">
                      <span className="text-5xl font-black tracking-tight text-gray-950">{average ? average.toFixed(1) : '—'}</span>
                      <span className="pb-1 text-sm text-gray-500">/ 5</span>
                    </div>
                    <div className="mt-1 text-xl tracking-widest text-amber-500" aria-label={`${average.toFixed(1)} na 5 gwiazdek`}>
                      {'★'.repeat(Math.round(average))}{'☆'.repeat(5 - Math.round(average))}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {feedbacks.length ? `Na podstawie ${feedbacks.length} ocen` : 'Brak ocen społeczności'}
                    </p>
                  </div>
                  <div className="w-full space-y-2 sm:max-w-md">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = feedbacks.filter((item) => item.rating === stars).length
                      const percent = feedbacks.length ? (count / feedbacks.length) * 100 : 0
                      return (
                        <div key={stars} className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="w-7">{stars} ★</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="w-5 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900">Komentarze</h3>
                  {feedbacks.length > 0 ? (
                    <div className="mt-4 max-h-[680px] space-y-4 overflow-y-auto pr-2">
                      {feedbacks.map((entry) => (
                        <article key={entry.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-bold text-gray-900">{entry.authorName || 'Gość'}</p>
                            <span className="text-sm tracking-wide text-amber-500" aria-label={`${entry.rating} na 5 gwiazdek`}>
                              {'★'.repeat(entry.rating)}{'☆'.repeat(5 - entry.rating)}
                            </span>
                          </div>
                          {entry.createdAt && (
                            <p className="mt-0.5 text-xs text-gray-400">
                              {new Date(entry.createdAt).toLocaleDateString('pl-PL')}
                              {entry.isLocal ? ' · oczekuje na zatwierdzenie' : ''}
                            </p>
                          )}
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">{entry.comment}</p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-gray-300 p-6 text-center">
                      <p className="font-semibold text-gray-700">Jeszcze nie ma komentarzy</p>
                      <p className="mt-1 text-sm text-gray-500">Dodaj pierwszą opinię o tej innowacji.</p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmitComment} className="h-fit rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
                  <h3 className="font-bold text-gray-900">Dodaj swoją opinię</h3>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Opinia zostanie zapisana w bazie danych ROPS.
                  </p>

                  <fieldset className="mt-5">
                    <legend className="text-sm font-semibold text-gray-800">Twoja ocena</legend>
                    <div className="mt-2 flex gap-1" role="group" aria-label="Wybierz ocenę">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          aria-label={`${value} ${value === 1 ? 'gwiazdka' : 'gwiazdki'}`}
                          aria-pressed={rating === value}
                          className={`text-3xl transition hover:scale-110 ${value <= rating ? 'text-amber-500' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <label className="mt-4 block text-sm font-semibold text-gray-800" htmlFor="guest-name">
                    Nick
                  </label>
                  <input
                    id="guest-name"
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    maxLength={40}
                    placeholder="np. Gość 123"
                    className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                  <label className="mt-4 block text-sm font-semibold text-gray-800" htmlFor="guest-role">
                    Rola
                  </label>
                  <select
                    id="guest-role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="user">Użytkownik</option>
                    <option value="tester">Tester</option>
                    <option value="caregiver">Opiekun</option>
                    <option value="specialist">Specjalista</option>
                  </select>

                  <label className="mt-4 block text-sm font-semibold text-gray-800" htmlFor="guest-comment">
                    Komentarz
                  </label>
                  <textarea
                    id="guest-comment"
                    required
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    maxLength={1000}
                    rows={5}
                    placeholder="Podziel się wrażeniami lub wskazówkami..."
                    className="mt-1.5 w-full resize-y rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">{comment.length}/1000</p>

                  {notice && (
                    <p role="status" className={`mt-3 text-xs font-semibold ${notice.startsWith('✓') ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {notice}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting || !comment.trim() || rating === 0}
                    className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? 'Zapisuję...' : 'Dodaj komentarz'}
                  </button>
                </form>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: string }) {
  return (
    <section className="rounded-2xl bg-gray-50 p-5">
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-800">{children}</p>
    </section>
  )
}
