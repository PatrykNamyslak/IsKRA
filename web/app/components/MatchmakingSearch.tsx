'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'

interface FeedbackItem {
  id: string | number
  rating: number
  comment: string
  authorName?: string
  role?: string
  createdAt?: string
}

interface MatchedInnovation {
  id: string | number
  title: string
  category?: string | { name?: string } | null
  patientProblem?: string
  proposedSolution?: string
  status?: string
}

interface MatchResult {
  matchFound: boolean
  confidence?: number
  aiExplanation?: string
  actionAdvice?: string
  gapAnalysis?: string
  innovation?: MatchedInnovation
  feedbacks?: FeedbackItem[]
  query?: string
}

const SAMPLE_PROMPTS = [
  'Szukam pomocy i aktywizacji dla seniora z chorobą Alzheimera lub demencją',
  'Płaszcz przeciwdeszczowy i ochrona przed chłodem dla osób na wózkach inwalidzkich',
  'Wsparcie i powrót na rynek pracy dla osób w głębokim kryzysie',
  'Opowiadania łatwe do czytania dla młodzieży z niepełnosprawnością intelektualną',
  'Nowy problem: opieka wytchnieniowa dla opiekunów osób niesamodzielnych w godzinach nocnych',
]

export default function MatchmakingSearch() {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const [problem, setProblem] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<MatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [feedbackAuthor, setFeedbackAuthor] = useState('')
  const [feedbackRole, setFeedbackRole] = useState('user')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)
  const [localFeedbacks, setLocalFeedbacks] = useState<FeedbackItem[]>([])

  const handleSearch = async (queryText?: string) => {
    const textToSearch = queryText || problem
    if (!textToSearch.trim()) return

    setIsLoading(true)
    setError(null)
    setResult(null)
    setFeedbackSuccess(false)

    try {
      const res = await fetch('/api/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: textToSearch.trim(),
          contactEmail: contactEmail.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Wystąpił problem z połączeniem z systemem matchmakingu.')
      }

      const data: MatchResult = await res.json()
      setResult(data)
      setLocalFeedbacks(data.feedbacks || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!result?.innovation?.id || !feedbackComment.trim()) return

    setIsSubmittingFeedback(true)
    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          innovation: result.innovation.id,
          rating: feedbackRating,
          comment: feedbackComment.trim(),
          authorName: feedbackAuthor.trim() || 'Użytkownik portalu',
          role: feedbackRole,
        }),
      })

      if (!res.ok) {
        throw new Error('Nie udało się dodać opinii.')
      }

      const resData = await res.json()
      setFeedbackSuccess(true)
      setFeedbackComment('')
      const createdItem = resData.doc || resData.data
      if (createdItem) {
        setLocalFeedbacks([createdItem, ...localFeedbacks])
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Błąd zapisu opinii')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  return (
    <div className="w-full rounded-3xl border border-gray-200/80 bg-white/90 p-6 sm:p-10 shadow-xl shadow-indigo-950/5 backdrop-blur-md">
      {/* Header */}
      <div className="mb-6 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
          <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
          Matchmaking & Wyszukiwarka Potrzeb
        </span>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Sprawdź, czy rozwiązanie Twojego problemu już istnieje
        </h2>
        <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
          Wpisz swoją potrzebę, dolegliwość lub wyzwanie społeczne. Middleman AI przeszuka oficjalną bazę innowacji ROPS i podpowie odpowiednie rozwiązanie lub skieruje sprawę do kreatora.
        </p>
      </div>

      {/* Input box */}
      <div className="relative">
        <textarea
          rows={3}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Opisz swój problem (np. 'Szukam sposobu na bezpieczną terapię dla seniora z zanikami pamięci', 'Potrzebuję odzieży dla osoby leżącej')..."
          className="w-full resize-none rounded-2xl border border-gray-300 bg-gray-50/50 p-4 sm:p-5 text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 text-base"
        />

        <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1">
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Twój e-mail (opcjonalny, do powiadomień ROPS)"
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs text-gray-700 placeholder-gray-400 outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={isHydrated && (isLoading || !problem.trim())}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Analizuję przez AI...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <span>Sprawdź w bazie</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-400">Przykładowe zapytania:</span>
        {SAMPLE_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setProblem(prompt)
              handleSearch(prompt)
            }}
            className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-gray-600 transition hover:bg-indigo-50 hover:text-indigo-700"
          >
            {prompt.length > 45 ? prompt.substring(0, 45) + '...' : prompt}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <strong>Błąd:</strong> {error}
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="mt-8 transition-all animate-fadeIn">
          {result.matchFound && result.innovation ? (
            /* ================= SCENARIUSZ A: ROZWIĄZANIE ISTNIEJE ================= */
            <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-50/50 to-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-4">
                <div className="inline-flex items-center gap-2 text-emerald-800 font-bold text-base sm:text-lg">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white text-sm">
                    ✓
                  </span>
                  Znaleziono pasujące rozwiązanie w bazie ROPS!
                </div>
                {result.confidence && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    Dopasowanie: {result.confidence}%
                  </span>
                )}
              </div>

              {/* Innovation Details */}
              <div className="mt-5 space-y-4">
                <div>
                  <span className="inline-block rounded bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 mb-1">
                    {typeof result.innovation.category === 'object' && result.innovation.category !== null
                      ? result.innovation.category.name || 'Innowacja Społeczna'
                      : result.innovation.category || 'Innowacja Społeczna'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {result.innovation.title}
                  </h3>
                </div>

                {result.aiExplanation && (
                  <div className="rounded-xl bg-white border border-emerald-200/80 p-4 text-sm text-emerald-950 shadow-xs">
                    <p className="font-semibold text-emerald-800 mb-1">
                      🤖 Analiza Middlemana AI:
                    </p>
                    <p className="leading-relaxed">{result.aiExplanation}</p>
                  </div>
                )}

                {result.actionAdvice && (
                  <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-4 text-sm text-indigo-950">
                    <p className="font-semibold text-indigo-900 mb-1">
                      💡 Jak skorzystać z tego rozwiązania:
                    </p>
                    <p className="leading-relaxed">{result.actionAdvice}</p>
                  </div>
                )}

                {result.innovation.proposedSolution && (
                  <div className="text-sm text-gray-700 bg-gray-50/70 rounded-xl p-4 border border-gray-100">
                    <p className="font-semibold text-gray-900 mb-1">Opis wdrożenia:</p>
                    <p className="whitespace-pre-line leading-relaxed">
                      {result.innovation.proposedSolution}
                    </p>
                  </div>
                )}

                {/* Feedback / Review Section */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-900">
                      Opinie i Feedback ({localFeedbacks.length})
                    </h4>
                    <span className="text-xs text-gray-500">
                      Testowałeś to rozwiązanie? Podziel się opinią
                    </span>
                  </div>

                  {/* Feedback Form */}
                  <form
                    onSubmit={handleFeedbackSubmit}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs mb-6"
                  >
                    <h5 className="text-sm font-semibold text-gray-900 mb-3">
                      Oceń przydatność innowacji:
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Ocena punktowa
                        </label>
                        <select
                          value={feedbackRating}
                          onChange={(e) => setFeedbackRating(Number(e.target.value))}
                          className="w-full rounded-lg border border-gray-300 p-2 text-sm bg-white"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 na 5) Doskonałe</option>
                          <option value={4}>⭐⭐⭐⭐ (4 na 5) Bardzo dobre</option>
                          <option value={3}>⭐⭐⭐ (3 na 5) Przeciętne</option>
                          <option value={2}>⭐⭐ (2 na 5) Wymaga poprawek</option>
                          <option value={1}>⭐ (1 na 5) Nieskuteczne</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Twoje imię
                        </label>
                        <input
                          type="text"
                          value={feedbackAuthor}
                          onChange={(e) => setFeedbackAuthor(e.target.value)}
                          placeholder="np. Anna Nowak"
                          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Twoja rola
                        </label>
                        <select
                          value={feedbackRole}
                          onChange={(e) => setFeedbackRole(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 p-2 text-sm bg-white"
                        >
                          <option value="user">Użytkownik</option>
                          <option value="tester">Tester</option>
                          <option value="caregiver">Opiekun</option>
                          <option value="specialist">Specjalista</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <textarea
                        rows={2}
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="Napisz jak to rozwiązanie sprawdziło się w Twoim przypadku..."
                        required
                        className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      {feedbackSuccess && (
                        <span className="text-xs font-medium text-emerald-600">
                          ✓ Dziękujemy! Opinia została zapisana w bazie.
                        </span>
                      )}
                      <button
                        type="submit"
                        disabled={isSubmittingFeedback || !feedbackComment.trim()}
                        className="ml-auto inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
                      >
                        {isSubmittingFeedback ? 'Zapisuję...' : 'Prześlij feedback'}
                      </button>
                    </div>
                  </form>

                  {/* List of existing feedbacks */}
                  {localFeedbacks.length > 0 ? (
                    <div className="space-y-3">
                      {localFeedbacks.map((fb, i) => (
                        <div
                          key={fb.id || i}
                          className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 text-xs text-gray-700"
                        >
                          <div className="flex items-center justify-between font-semibold text-gray-900 mb-1">
                            <span>
                              {fb.authorName || 'Użytkownik'} (
                              {fb.role === 'tester'
                                ? '🔬 Tester'
                                : fb.role === 'caregiver'
                                ? '🤝 Opiekun'
                                : '👤 Użytkownik'}
                              )
                            </span>
                            <span className="text-amber-500">
                              {'★'.repeat(fb.rating)}
                              {'☆'.repeat(5 - fb.rating)}
                            </span>
                          </div>
                          <p className="text-gray-600 leading-relaxed">{fb.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">
                      Brak wcześniejszych opinii. Bądź pierwszą osobą, która oceni to rozwiązanie!
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ================= SCENARIUSZ B: ROZWIĄZANIE NIE ISTNIEJE ================= */
            <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-amber-50/60 to-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-4">
                <div className="inline-flex items-center gap-2 text-amber-900 font-bold text-base sm:text-lg">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white text-sm">
                    !
                  </span>
                  Brak gotowego rozwiązania w obecnej bazie innowacji
                </div>
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  Potrzeba zarejestrowana w ROPS
                </span>
              </div>

              <div className="mt-4 space-y-4 text-sm text-gray-700">
                <div className="rounded-xl bg-white border border-amber-200/80 p-4">
                  <p className="font-semibold text-amber-950 mb-1">
                    🔍 Podsumowanie Middlemana AI:
                  </p>
                  <p className="leading-relaxed text-gray-700">
                    {result.gapAnalysis ||
                      'W bazie ROPS nie ma obecnie zatwierdzonego rozwiązania odpowiadającego bezpośrednio na Twoje zapytanie.'}
                  </p>
                  <p className="mt-2 text-xs text-amber-800 font-medium">
                    ✓ Twoje zapytanie zostało automatycznie przekazane do Administratorów (ROPS) jako zidentyfikowana niezaspokojona potrzeba.
                  </p>
                </div>

                <div className="rounded-2xl bg-indigo-900 p-6 text-white text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold">
                      Stwórzmy razem to rozwiązanie!
                    </h4>
                    <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-xl">
                      Przejdź do Kreatora Innowacji (Tab 2: Niezaspokojona potrzeba). Twój opis problemu zostanie automatycznie przeniesiony do formularza, a ROPS podejmie kroki w celu znalezienia rozwiązania.
                    </p>
                  </div>
                  <Link
                    href={`/form?tab=gap&problem=${encodeURIComponent(result.query || problem)}`}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-gray-900 shadow-md transition hover:bg-amber-300 hover:shadow-lg active:scale-95"
                  >
                    <span>Przejdź do Kreatora (Tab 2)</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
