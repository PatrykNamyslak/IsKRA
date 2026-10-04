'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Tabs, Button } from '@heroui/react'
import {
  ArrowUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

type Mode = 'szukam-wsparcia' | 'zglaszam-pomysl'

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
  slug?: string
  category?: string | { name?: string }
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

export default function HomePageView() {
  const router = useRouter()
  const [activeMode, setActiveMode] = useState<Mode>('szukam-wsparcia')
  const [prompt, setPrompt] = useState('')
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!prompt.trim()) return

    if (activeMode === 'zglaszam-pomysl') {
      // Przekierowanie do formularza zgłoszenia z wpisanym tekstem
      router.push(`/form?problem=${encodeURIComponent(prompt.trim())}`)
      return
    }

    // Tryb 'szukam-wsparcia' -> wywołanie Middleman AI
    setIsLoading(true)
    setError(null)
    setResult(null)
    setFeedbackSuccess(false)

    try {
      const res = await fetch('/api/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: prompt.trim(),
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

  const getInnovationSlugOrId = (item?: MatchedInnovation) => {
    if (!item) return ''
    return item.slug || String(item.id)
  }

  const getCategoryName = (cat?: string | { name?: string }) => {
    if (!cat) return 'Innowacja Społeczna'
    if (typeof cat === 'object' && cat.name) return cat.name
    return String(cat)
  }

  return (
    <div className="bg-transparent text-gray-900 font-sans antialiased h-full flex flex-col justify-between relative selection:bg-brand selection:text-white overflow-hidden">
      {/* Main Content: Optically Centered Command Center */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 pt-6 pb-4 sm:py-6 relative z-10">
        <h1 className="text-xl sm:text-3xl font-medium tracking-tight text-gray-800 mb-5 sm:mb-6 text-center">
          Czego potrzebuje Twój projekt?
        </h1>

        {/* Liquid Glass Unified Panel */}
        <div
          className="w-full bg-white/40 border border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-4 sm:p-5 flex flex-col transition-all"
          style={{ backdropFilter: 'blur(40px) saturate(150%)', WebkitBackdropFilter: 'blur(40px) saturate(150%)' }}
        >
          {/* Segmented Control with HeroUI Tabs */}
          <Tabs
            selectedKey={activeMode}
            onSelectionChange={(key) => setActiveMode(key as Mode)}
            className="w-full mb-3.5 pt-0.5"
          >
            <Tabs.ListContainer className="w-full p-0.5">
              <Tabs.List
                aria-label="Wybór trybu projektu"
                className="w-full flex bg-black/[0.04] p-1.5 rounded-full border border-white/60 backdrop-blur-md relative"
              >
                <Tabs.Tab
                  id="szukam-wsparcia"
                  className={`flex-1 py-2 sm:py-2.5 px-3 text-xs sm:text-sm font-medium rounded-full transition-all focus:outline-none cursor-pointer text-center relative z-10 ${
                    activeMode === 'szukam-wsparcia'
                      ? 'bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Szukam wsparcia
                  <Tabs.Indicator className="rounded-full" />
                </Tabs.Tab>

                <Tabs.Tab
                  id="zglaszam-pomysl"
                  className={`flex-1 py-2 sm:py-2.5 px-3 text-xs sm:text-sm font-medium rounded-full transition-all focus:outline-none cursor-pointer text-center relative z-10 ${
                    activeMode === 'zglaszam-pomysl'
                      ? 'bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Zgłaszam pomysł dla ROPS
                  <Tabs.Indicator className="rounded-full" />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>

          {/* Input Area */}
          <div className="relative w-full">
            <form onSubmit={handleSubmit} className="relative group flex flex-col">
              <label htmlFor="ai-prompt" className="sr-only">
                Opisz swój pomysł
              </label>
              <textarea
                id="ai-prompt"
                name="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmit()
                  }
                }}
                disabled={isLoading}
                className="w-full bg-white/40 border border-white/50 focus:bg-white/70 focus:border-white rounded-[2rem] p-5 sm:p-6 pr-18 sm:pr-20 text-gray-900 placeholder:text-xs sm:placeholder:text-sm placeholder:text-gray-500/80 focus:outline-none focus:ring-0 resize-none min-h-[140px] sm:min-h-[160px] text-sm sm:text-base leading-relaxed shadow-inner transition-all duration-300 disabled:opacity-50"
                placeholder={
                  activeMode === 'szukam-wsparcia'
                    ? 'Opisz innowację. System skataloguje ją i znajdzie odpowiednią ścieżkę realizacji...'
                    : 'Opisz koncepcję dla ROPS do realizacji zewnętrznej...'
                }
              />

              <div className="mt-2.5 flex justify-end sm:mt-0 sm:absolute sm:bottom-3 sm:right-3">
                <Button
                  type="submit"
                  isDisabled={isLoading || !prompt.trim()}
                  className="w-full sm:w-auto bg-brand hover:bg-brand-hover text-white py-3 px-5 sm:p-3.5 rounded-full shadow-md transition-transform active:scale-95 disabled:bg-gray-400 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer sm:min-w-12 h-11 sm:h-12 text-xs sm:text-sm font-semibold"
                  aria-label="Przetwórz pomysł"
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <>
                      <span className="sm:hidden">
                        {activeMode === 'szukam-wsparcia' ? 'Szukaj wsparcia' : 'Przejdź do formularza'}
                      </span>
                      <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5px]" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>


          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/80 backdrop-blur-md p-3.5 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results section */}
          {result && activeMode === 'szukam-wsparcia' && (
            <div className="mt-5 pt-5 border-t border-black/[0.05] transition-all">
              {result.matchFound && result.innovation ? (
                /* Scenario A: Match Found */
                <div className="rounded-3xl bg-white/60 border border-white/80 backdrop-blur-xl p-5 sm:p-6 text-left shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.05] pb-3">
                    <div className="inline-flex items-center gap-2 text-emerald-800 font-semibold text-sm sm:text-base">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                      Znaleziono pasujące rozwiązanie w bazie ROPS!
                    </div>
                    {result.confidence && (
                      <span className="rounded-full bg-emerald-100/90 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        Dopasowanie: {result.confidence}%
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-3.5">
                    <div>
                      <span className="inline-block rounded-md bg-black/[0.04] px-2 py-0.5 text-[11px] font-semibold text-gray-600 mb-1">
                        {getCategoryName(result.innovation.category)}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        <Link
                          href={`/innovations/${encodeURIComponent(getInnovationSlugOrId(result.innovation))}`}
                          className="hover:text-brand transition-colors"
                        >
                          {result.innovation.title}
                        </Link>
                      </h3>
                    </div>

                    {result.aiExplanation && (
                      <div className="rounded-2xl bg-white/80 border border-black/[0.04] p-3.5 text-xs text-gray-800">
                        <p className="font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-brand" />
                          Analiza Middlemana AI:
                        </p>
                        <p className="leading-relaxed text-gray-600">{result.aiExplanation}</p>
                      </div>
                    )}

                    {result.actionAdvice && (
                      <div className="rounded-2xl bg-white/60 border border-black/[0.04] p-3.5 text-xs text-gray-800">
                        <p className="font-semibold text-gray-900 mb-1">💡 Rekomendacja:</p>
                        <p className="leading-relaxed text-gray-600">{result.actionAdvice}</p>
                      </div>
                    )}

                    <div>
                      <Link
                        href={`/innovations/${encodeURIComponent(getInnovationSlugOrId(result.innovation))}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-900 hover:text-brand transition-colors pt-1"
                      >
                        <span>Przejdź do pełnej karty innowacji</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Feedback Form */}
                    <div className="mt-6 border-t border-black/[0.05] pt-4">
                      <h4 className="text-xs font-bold text-gray-900 mb-3">
                        Opinie i oceny ({localFeedbacks.length})
                      </h4>

                      <form
                        onSubmit={handleFeedbackSubmit}
                        className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-2xs mb-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2.5">
                          <div>
                            <label className="block text-[10px] font-medium text-gray-600 mb-1">
                              Ocena
                            </label>
                            <select
                              value={feedbackRating}
                              onChange={(e) => setFeedbackRating(Number(e.target.value))}
                              className="w-full rounded-xl border border-gray-200 bg-white p-1.5 text-xs text-gray-800 outline-none"
                            >
                              <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                              <option value={4}>⭐⭐⭐⭐ (4)</option>
                              <option value={3}>⭐⭐⭐ (3)</option>
                              <option value={2}>⭐⭐ (2)</option>
                              <option value={1}>⭐ (1)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-medium text-gray-600 mb-1">
                              Imię / pseudonim
                            </label>
                            <input
                              type="text"
                              value={feedbackAuthor}
                              onChange={(e) => setFeedbackAuthor(e.target.value)}
                              placeholder="np. Anna"
                              className="w-full rounded-xl border border-gray-200 bg-white p-1.5 text-xs text-gray-800 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-medium text-gray-600 mb-1">
                              Rola
                            </label>
                            <select
                              value={feedbackRole}
                              onChange={(e) => setFeedbackRole(e.target.value)}
                              className="w-full rounded-xl border border-gray-200 bg-white p-1.5 text-xs text-gray-800 outline-none"
                            >
                              <option value="user">Użytkownik</option>
                              <option value="tester">Tester</option>
                              <option value="caregiver">Opiekun</option>
                              <option value="specialist">Specjalista</option>
                            </select>
                          </div>
                        </div>

                        <div className="mb-2.5">
                          <textarea
                            rows={2}
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            placeholder="Napisz jak to rozwiązanie sprawdziło się w Twoim przypadku..."
                            required
                            className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-800 outline-none"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          {feedbackSuccess && (
                            <span className="text-xs font-medium text-emerald-600">
                              ✓ Dziękujemy! Zapisano opinię.
                            </span>
                          )}
                          <button
                            type="submit"
                            disabled={isSubmittingFeedback || !feedbackComment.trim()}
                            className="ml-auto inline-flex items-center rounded-xl bg-gray-900 hover:bg-gray-800 px-3.5 py-1.5 text-xs font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {isSubmittingFeedback ? 'Zapisuję...' : 'Dodaj opinię'}
                          </button>
                        </div>
                      </form>

                      {localFeedbacks.length > 0 && (
                        <div className="space-y-2">
                          {localFeedbacks.slice(0, 3).map((fb, i) => (
                            <div
                              key={fb.id || i}
                              className="rounded-xl border border-white/80 bg-white/40 p-2.5 text-xs text-gray-700"
                            >
                              <div className="flex items-center justify-between font-semibold text-gray-900 mb-0.5">
                                <span>{fb.authorName || 'Użytkownik'}</span>
                                <span className="text-amber-500 font-mono text-[11px]">
                                  {'★'.repeat(fb.rating)}
                                </span>
                              </div>
                              <p className="text-gray-600 text-[11px] leading-relaxed">{fb.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Scenario B: No Match / Gap Identified */
                <div className="rounded-3xl bg-white/60 border border-white/80 backdrop-blur-xl p-5 sm:p-6 text-left shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.05] pb-3">
                    <div className="inline-flex items-center gap-2 text-amber-900 font-semibold text-sm sm:text-base">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white text-xs">
                        !
                      </span>
                      Brak gotowego rozwiązania w bazie innowacji
                    </div>
                    <span className="inline-flex items-center rounded-full bg-amber-100/90 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                      Potrzeba zarejestrowana w ROPS
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-3 text-xs text-gray-800">
                    <div className="rounded-2xl bg-white/80 border border-black/[0.04] p-3.5">
                      <p className="font-semibold text-gray-900 mb-1">
                        Podsumowanie Middlemana AI:
                      </p>
                      <p className="leading-relaxed text-gray-600">
                        {result.gapAnalysis ||
                          'W bazie ROPS nie ma obecnie zatwierdzonego rozwiązania odpowiadającego na to zapytanie.'}
                      </p>
                      <p className="mt-2 text-[11px] text-amber-800 font-medium">
                        ✓ Zapytanie zostało zapisane dla Administratorów ROPS.
                      </p>
                    </div>

                    <div className="pt-2">
                      <Link
                        href={`/form?tab=gap&problem=${encodeURIComponent(result.query || prompt)}`}
                        className="inline-flex items-center gap-2 rounded-2xl bg-brand hover:bg-brand-hover px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Przejdź do formularza, aby zgłosić tę potrzebę</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Perimeter Bottom: Balanced Footer Typography from landing-2 */}
      <footer className="w-full px-6 py-3 md:py-4 md:px-10 flex flex-col md:flex-row justify-between items-center relative z-50 gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="text-xs font-medium text-gray-400">System operacyjny gotowy</span>
        </div>

        <div className="flex items-center gap-5 text-xs font-medium text-gray-400">
          <Link href="/innovations" className="hover:text-gray-800 transition-colors">
            Baza pomysłów
          </Link>
          <Link href="/form" className="hover:text-gray-800 transition-colors">
            Zgłoś pomysł
          </Link>
          <span className="text-gray-300 h-3 w-[1px] bg-gray-300 rounded-full" />
          <span>© 2026 ROPS</span>
        </div>
      </footer>
    </div>
  )
}
