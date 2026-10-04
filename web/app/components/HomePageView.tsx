'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  ArrowUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lightbulb,
  HelpCircle,
  User,
  FlaskConical,
  ShieldCheck,
  Star,
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

const SAMPLE_PROMPTS = [
  'Pomoc i aktywizacja dla seniora z demencją lub chorobą Alzheimera',
  'Płaszcz przeciwdeszczowy i ochrona przed chłodem dla osób na wózkach',
  'Wsparcie i powrót na rynek pracy dla osób po kryzysie',
  'Opowiadania łatwe do czytania dla młodzieży z niepełnosprawnością',
  'Opieka wytchnieniowa dla opiekunów w godzinach nocnych',
]

export default function HomePageView() {
  const [activeMode, setActiveMode] = useState<Mode>('szukam-wsparcia')
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
    <div className="bg-[#f5f5f7] text-gray-900 font-sans antialiased min-h-screen flex flex-col relative selection:bg-[#e58500] selection:text-white overflow-x-hidden">
      {/* Atmospheric Mesh Background */}
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center items-center">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-slate-300/40 rounded-full blur-[100px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#e58500]/10 rounded-full blur-[120px] mix-blend-multiply" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center flex-1">
        {/* Hero Section */}
        <section className="w-full pt-10 pb-8 sm:pt-16 sm:pb-12 px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-4 py-1.5 text-xs font-semibold text-gray-800 shadow-2xs backdrop-blur-md mb-6">
            <span className="flex h-2 w-2 rounded-full bg-[#e58500] animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-[#e58500]" />
            Inteligentny Matchmaking & Kreator Innowacji ROPS
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 leading-[1.15] max-w-3xl">
            Czego potrzebuje Twój projekt?
          </h1>

          <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-2xl leading-relaxed">
            Wpisz problem lub potrzebę. Middleman AI sprawdzi bazę innowacji ROPS. Jeśli rozwiązanie istnieje – skorzystaj i oceń je. Jeśli nie – zgłoś brak bezpośrednio do ROPS.
          </p>

          {/* Liquid Glass Unified Command Center */}
          <div className="w-full mt-8 sm:mt-10">
            <div
              className="w-full bg-white/45 border border-white/70 shadow-[0_12px_44px_-12px_rgba(0,0,0,0.08)] rounded-[2.5rem] p-3 sm:p-5 flex flex-col transition-all"
              style={{
                backdropFilter: 'blur(40px) saturate(150%)',
                WebkitBackdropFilter: 'blur(40px) saturate(150%)',
              }}
            >
              {/* Segmented Control */}
              <div className="flex bg-black/[0.04] p-1 rounded-full mb-3" role="tablist">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('szukam-wsparcia')
                  }}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-medium rounded-full transition-all focus:outline-none cursor-pointer ${
                    activeMode === 'szukam-wsparcia'
                      ? 'bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  role="tab"
                  aria-selected={activeMode === 'szukam-wsparcia'}
                >
                  Szukam wsparcia (Matchmaking AI)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('zglaszam-pomysl')
                  }}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-medium rounded-full transition-all focus:outline-none cursor-pointer ${
                    activeMode === 'zglaszam-pomysl'
                      ? 'bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  role="tab"
                  aria-selected={activeMode === 'zglaszam-pomysl'}
                >
                  Zgłaszam pomysł dla ROPS (Kreator)
                </button>
              </div>

              {/* Mode 1: Search & Matchmaking */}
              {activeMode === 'szukam-wsparcia' && (
                <div className="relative w-full text-left">
                  <div className="relative group flex flex-col">
                    <label htmlFor="ai-prompt" className="sr-only">
                      Opisz swój problem
                    </label>
                    <textarea
                      id="ai-prompt"
                      name="prompt"
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          handleSearch()
                        }
                      }}
                      disabled={isLoading}
                      className="w-full bg-white/50 border border-white/70 focus:bg-white/80 focus:border-[#e58500]/50 rounded-[2rem] p-5 sm:p-6 pr-20 text-gray-900 placeholder-gray-400 focus:outline-none resize-none min-h-[140px] text-base leading-relaxed shadow-inner transition-all duration-300 disabled:opacity-50"
                      placeholder="Opisz problem (np. 'Szukam pomocy i aktywizacji dla seniora z demencją', 'Płaszcz przeciwdeszczowy dla osób na wózkach')..."
                    />

                    <div className="absolute bottom-4 right-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleSearch()}
                        disabled={isLoading || !problem.trim()}
                        className="bg-[#e58500] hover:bg-[#cc7700] disabled:bg-gray-300 text-white p-3.5 rounded-2xl shadow-md transition-all active:scale-95 focus:outline-none cursor-pointer disabled:cursor-not-allowed flex items-center justify-center"
                        aria-label="Wyszukaj z Middleman AI"
                        title="Uruchom Middleman AI"
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
                          <ArrowUp className="w-5 h-5 stroke-[2.5px]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Optional Email & Prompt Suggestions */}
                  <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-2">
                    <div className="flex-1 max-w-sm">
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="Twój e-mail (opcjonalny, do kontaktu z ROPS)"
                        className="w-full rounded-full bg-white/60 border border-white/80 px-4 py-1.5 text-xs text-gray-700 placeholder-gray-400 outline-none focus:bg-white focus:border-[#e58500]/50 transition-all shadow-2xs"
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 text-right sm:text-left">
                      Tip: Naciśnij <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-mono text-[10px]">Ctrl+Enter</kbd> aby wyszukać
                    </span>
                  </div>

                  {/* Sample prompt pills */}
                  <div className="mt-4 pt-3 border-t border-black/[0.04] flex flex-wrap items-center gap-1.5 px-2">
                    <span className="text-xs font-medium text-gray-400 mr-1">Przykłady:</span>
                    {SAMPLE_PROMPTS.map((promptText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setProblem(promptText)
                          handleSearch(promptText)
                        }}
                        className="rounded-full bg-white/60 hover:bg-white border border-white/80 px-3 py-1 text-xs text-gray-600 hover:text-gray-900 transition-all shadow-2xs hover:shadow-xs cursor-pointer text-left"
                      >
                        {promptText.length > 40 ? promptText.substring(0, 40) + '...' : promptText}
                      </button>
                    ))}
                  </div>

                  {/* Error Box */}
                  {error && (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/80 backdrop-blur-md p-4 text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* ================= RESULTS DISPLAY ================= */}
                  {result && (
                    <div className="mt-6 pt-6 border-t border-black/[0.06] transition-all">
                      {result.matchFound && result.innovation ? (
                        /* Scenario A: Match Found */
                        <div className="rounded-[2rem] bg-emerald-500/[0.06] border border-emerald-500/20 backdrop-blur-xl p-6 sm:p-8 text-left shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/15 pb-4">
                            <div className="inline-flex items-center gap-2 text-emerald-900 font-semibold text-base sm:text-lg">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">
                                <CheckCircle2 className="w-4 h-4" />
                              </span>
                              Znaleziono pasujące rozwiązanie w bazie ROPS!
                            </div>
                            {result.confidence && (
                              <span className="rounded-full bg-emerald-100/80 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
                                Dopasowanie: {result.confidence}%
                              </span>
                            )}
                          </div>

                          <div className="mt-5 space-y-4">
                            <div>
                              <span className="inline-block rounded-md bg-white/80 border border-emerald-200/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 mb-1.5">
                                {getCategoryName(result.innovation.category)}
                              </span>
                              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                <Link
                                  href={`/innovations/${encodeURIComponent(getInnovationSlugOrId(result.innovation))}`}
                                  className="hover:text-[#e58500] transition-colors"
                                >
                                  {result.innovation.title}
                                </Link>
                              </h3>
                            </div>

                            {result.aiExplanation && (
                              <div className="rounded-2xl bg-white/70 border border-emerald-200/50 p-4 text-sm text-gray-800">
                                <p className="font-semibold text-emerald-900 mb-1 flex items-center gap-1.5">
                                  <Sparkles className="w-4 h-4 text-emerald-700" />
                                  Analiza Middlemana AI:
                                </p>
                                <p className="leading-relaxed">{result.aiExplanation}</p>
                              </div>
                            )}

                            {result.actionAdvice && (
                              <div className="rounded-2xl bg-white/60 border border-black/5 p-4 text-sm text-gray-800">
                                <p className="font-semibold text-gray-900 mb-1">
                                  💡 Jak skorzystać z tego rozwiązania:
                                </p>
                                <p className="leading-relaxed text-gray-700">{result.actionAdvice}</p>
                              </div>
                            )}

                            {result.innovation.proposedSolution && (
                              <div className="text-sm text-gray-700 bg-white/50 rounded-2xl p-4 border border-black/5">
                                <p className="font-semibold text-gray-900 mb-1">Opis wdrożenia:</p>
                                <p className="whitespace-pre-line leading-relaxed text-gray-600">
                                  {result.innovation.proposedSolution}
                                </p>
                              </div>
                            )}

                            <div className="pt-2">
                              <Link
                                href={`/innovations/${encodeURIComponent(getInnovationSlugOrId(result.innovation))}`}
                                className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95"
                              >
                                <span>Przejdź do pełnej karty innowacji</span>
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </div>

                            {/* Feedback Section */}
                            <div className="mt-8 border-t border-emerald-500/15 pt-6">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-base sm:text-lg font-bold text-gray-900">
                                  Opinie i oceny ({localFeedbacks.length})
                                </h4>
                                <span className="text-xs text-gray-500">
                                  Dla użytkowników i testerów
                                </span>
                              </div>

                              {/* Form */}
                              <form
                                onSubmit={handleFeedbackSubmit}
                                className="rounded-2xl border border-white/80 bg-white/70 p-4 sm:p-5 shadow-2xs mb-5"
                              >
                                <h5 className="text-xs font-semibold text-gray-800 mb-3">
                                  Dodaj swoją opinię o tym rozwiązaniu:
                                </h5>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                                  <div>
                                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                      Ocena punktowa
                                    </label>
                                    <select
                                      value={feedbackRating}
                                      onChange={(e) => setFeedbackRating(Number(e.target.value))}
                                      className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-800 outline-none"
                                    >
                                      <option value={5}>⭐⭐⭐⭐⭐ (5) Doskonałe</option>
                                      <option value={4}>⭐⭐⭐⭐ (4) Bardzo dobre</option>
                                      <option value={3}>⭐⭐⭐ (3) Przeciętne</option>
                                      <option value={2}>⭐⭐ (2) Wymaga poprawek</option>
                                      <option value={1}>⭐ (1) Nieskuteczne</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                      Twoje imię / pseudonim
                                    </label>
                                    <input
                                      type="text"
                                      value={feedbackAuthor}
                                      onChange={(e) => setFeedbackAuthor(e.target.value)}
                                      placeholder="np. Anna Nowak"
                                      className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-800 outline-none"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-medium text-gray-600 mb-1">
                                      Twoja rola
                                    </label>
                                    <select
                                      value={feedbackRole}
                                      onChange={(e) => setFeedbackRole(e.target.value)}
                                      className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-800 outline-none"
                                    >
                                      <option value="user">👤 Użytkownik</option>
                                      <option value="tester">🔬 Tester</option>
                                      <option value="caregiver">🤝 Opiekun</option>
                                      <option value="specialist">🎓 Specjalista</option>
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
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-800 outline-none focus:border-[#e58500]/50"
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
                                    className="ml-auto inline-flex items-center rounded-xl bg-gray-900 hover:bg-gray-800 px-4 py-2 text-xs font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
                                  >
                                    {isSubmittingFeedback ? 'Zapisuję...' : 'Prześlij feedback'}
                                  </button>
                                </div>
                              </form>

                              {/* Feedback reviews list */}
                              {localFeedbacks.length > 0 ? (
                                <div className="space-y-2.5">
                                  {localFeedbacks.slice(0, 5).map((fb, i) => (
                                    <div
                                      key={fb.id || i}
                                      className="rounded-xl border border-white/80 bg-white/50 p-3 text-xs text-gray-700"
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
                                        <span className="text-amber-500 font-mono">
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
                        /* Scenario B: No Match / Gap Identified */
                        <div className="rounded-[2rem] bg-amber-500/[0.08] border border-amber-500/25 backdrop-blur-xl p-6 sm:p-8 text-left shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
                            <div className="inline-flex items-center gap-2 text-amber-950 font-semibold text-base sm:text-lg">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e58500] text-white text-xs">
                                !
                              </span>
                              Brak gotowego rozwiązania w obecnej bazie innowacji
                            </div>
                            <span className="inline-flex items-center rounded-full bg-amber-100/90 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-900">
                              Potrzeba zarejestrowana w ROPS
                            </span>
                          </div>

                          <div className="mt-4 space-y-4 text-sm text-gray-800">
                            <div className="rounded-2xl bg-white/75 border border-amber-200/60 p-4">
                              <p className="font-semibold text-amber-950 mb-1 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-[#e58500]" />
                                Podsumowanie Middlemana AI:
                              </p>
                              <p className="leading-relaxed text-gray-700">
                                {result.gapAnalysis ||
                                  'W bazie ROPS nie ma obecnie zatwierdzonego rozwiązania odpowiadającego bezpośrednio na Twoje zapytanie.'}
                              </p>
                              <p className="mt-2 text-xs text-amber-900 font-medium">
                                ✓ Twoje zapytanie zostało automatycznie przekazane do Administratorów (ROPS) jako zidentyfikowana luka (niezaspokojona potrzeba).
                              </p>
                            </div>

                            <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                              <div>
                                <h4 className="text-base sm:text-lg font-bold">
                                  Stwórzmy razem to rozwiązanie!
                                </h4>
                                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl">
                                  Przejdź do Kreatora Innowacji (Niezaspokojona potrzeba). Twój opis problemu zostanie automatycznie przeniesiony do formularza.
                                </p>
                              </div>
                              <Link
                                href={`/form?tab=gap&problem=${encodeURIComponent(result.query || problem)}`}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#e58500] hover:bg-[#cc7700] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
                              >
                                <span>Zgłoś potrzebę do Kreatora</span>
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: Quick Creator Dispatch */}
              {activeMode === 'zglaszam-pomysl' && (
                <div className="relative w-full text-left">
                  <div className="relative group flex flex-col">
                    <label htmlFor="creator-prompt" className="sr-only">
                      Opisz swój pomysł lub potrzebę
                    </label>
                    <textarea
                      id="creator-prompt"
                      name="creator-prompt"
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      className="w-full bg-white/50 border border-white/70 focus:bg-white/80 focus:border-[#e58500]/50 rounded-[2rem] p-5 sm:p-6 text-gray-900 placeholder-gray-400 focus:outline-none resize-none min-h-[120px] text-base leading-relaxed shadow-inner transition-all duration-300"
                      placeholder="Wpisz wstępny opis swojego pomysłu lub potrzeby, a następnie wybierz odpowiednią ścieżkę poniżej..."
                    />
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-600 mb-3 px-1">
                      Wybierz ścieżkę wdrożenia (przeniesiemy Twój tekst do formularza):
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Link
                        href={`/form?tab=application${problem ? `&problem=${encodeURIComponent(problem)}` : ''}`}
                        className="rounded-2xl border border-white/80 bg-white/60 p-4 transition-all hover:bg-white hover:border-[#e58500]/40 hover:shadow-md group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-gray-900 font-semibold text-xs sm:text-sm">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-900 text-white text-[11px] font-bold">
                              1
                            </span>
                            Wniosek o wdrożenie
                          </div>
                          <p className="mt-2 text-[11px] text-gray-500 leading-relaxed">
                            Chcesz osobiście zrealizować innowację przy wsparciu ROPS.
                          </p>
                        </div>
                        <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#e58500] group-hover:translate-x-0.5 transition-transform">
                          Otwórz formularz →
                        </span>
                      </Link>

                      <Link
                        href={`/form?tab=gap${problem ? `&problem=${encodeURIComponent(problem)}` : ''}`}
                        className="rounded-2xl border border-white/80 bg-white/60 p-4 transition-all hover:bg-white hover:border-[#e58500]/40 hover:shadow-md group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-gray-900 font-semibold text-xs sm:text-sm">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e58500] text-white text-[11px] font-bold">
                              2
                            </span>
                            Niezaspokojona potrzeba
                          </div>
                          <p className="mt-2 text-[11px] text-gray-500 leading-relaxed">
                            Baza nie ma rozwiązania – zgłoś problem do rozwiązania.
                          </p>
                        </div>
                        <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#e58500] group-hover:translate-x-0.5 transition-transform">
                          Otwórz formularz →
                        </span>
                      </Link>

                      <Link
                        href={`/form?tab=idea${problem ? `&problem=${encodeURIComponent(problem)}` : ''}`}
                        className="rounded-2xl border border-white/80 bg-white/60 p-4 transition-all hover:bg-white hover:border-[#e58500]/40 hover:shadow-md group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-gray-900 font-semibold text-xs sm:text-sm">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white text-[11px] font-bold">
                              3
                            </span>
                            Giełda pomysłów
                          </div>
                          <p className="mt-2 text-[11px] text-gray-500 leading-relaxed">
                            Dzielisz się pomysłem, by ROPS znalazł dla niego wykonawcę.
                          </p>
                        </div>
                        <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                          Otwórz formularz →
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3 Creator Paths Section */}
        <section className="w-full py-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#e58500]">
              Kreator Innowacji
            </span>
            <h2 className="mt-1 text-2xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              Trzy wejścia do tworzenia innowacji
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500">
              Niezależnie od tego, czy chcesz zrealizować pomysł osobiście, szukasz brakującego rozwiązania, czy chcesz zlecić pomysł innym – wybierz odpowiednią ścieżkę.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group relative rounded-[2rem] border border-white/70 bg-white/50 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_16px_40px_rgba(229,133,0,0.1)] hover:border-[#e58500]/30 hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white font-bold text-lg shadow-sm">
                  1
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900 group-hover:text-[#e58500] transition-colors">
                  Wnioski o wdrożenie
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  Dla osób i organizacji, które mają innowację i chcą ją samodzielnie zrealizować. Administratorzy ROPS pomagają w doborze narzędzi, dofinansowania i zespołu.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-black/[0.04]">
                <Link
                  href="/form?tab=application"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 group-hover:text-[#e58500] transition-colors"
                >
                  <span>Złóż wniosek</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative rounded-[2rem] border border-white/70 bg-white/50 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_16px_40px_rgba(229,133,0,0.1)] hover:border-[#e58500]/30 hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e58500] text-white font-bold text-lg shadow-sm shadow-[#e58500]/20">
                  2
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900 group-hover:text-[#e58500] transition-colors">
                  Niezaspokojona potrzeba
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  Szukałeś rozwiązania i baza go nie znalazła? Opisz zdiagnozowaną potrzebę, zaproponuj wstępny kierunek rozwiązania i zostaw dane kontaktowe dla ROPS.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-black/[0.04]">
                <Link
                  href="/form?tab=gap"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#e58500] group-hover:text-[#cc7700] transition-colors"
                >
                  <span>Zgłoś niezaspokojoną potrzebę</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative rounded-[2rem] border border-white/70 bg-white/50 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_16px_40px_rgba(229,133,0,0.1)] hover:border-[#e58500]/30 hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-lg shadow-sm">
                  3
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  Giełda pomysłów
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  Masz wartościowy pomysł, ale nie chcesz/nie możesz go sam wdrożyć? Opublikuj go na giełdzie, a ROPS poszuka chętnych naukowców i wykonawców do jego realizacji.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-black/[0.04]">
                <Link
                  href="/form?tab=idea"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 group-hover:text-emerald-700 transition-colors"
                >
                  <span>Zgłoś do realizacji</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Roles in System Section */}
        <section className="w-full py-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Role w Systemie
            </span>
            <h2 className="mt-1 text-2xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              Kto tworzy i testuje innowacje?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-[2rem] bg-white/40 border border-white/70 p-7 shadow-2xs backdrop-blur-xl">
              <div className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center text-xl mb-4 shadow-2xs">
                👤
              </div>
              <h3 className="font-semibold text-lg text-gray-900">Użytkownicy i Goście</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Zwykli obywatele, pacjenci, ich opiekunowie i pracownicy placówek. Szukają rozwiązań swoich trudności, korzystają z innowacji i zostawiają wartościowy feedback.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white/40 border border-white/70 p-7 shadow-2xs backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center text-xl mb-4 shadow-2xs">
                  🔬
                </div>
                <h3 className="font-semibold text-lg text-gray-900">Testerzy (Goście)</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  Zwykli ludzie i użytkownicy testujący innowacje w praktyce. Nie potrzebują konta ani panelu – korzystają z rozwiązań i przekazują bezpośredni feedback.
                </p>
              </div>
              <Link
                href="/innovations?tab=testing"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#e58500] hover:underline"
              >
                Innowacje do testowania →
              </Link>
            </div>

            <div className="rounded-[2rem] bg-white/40 border border-white/70 p-7 shadow-2xs backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center text-xl mb-4 shadow-2xs">
                  🛡️
                </div>
                <h3 className="font-semibold text-lg text-gray-900">Administratorzy (ROPS)</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  Mają pełny wgląd (widzą DOSŁOWNIE WSZYSTKO): taski, postęp wdrożeń, feedbacki, statystyki niezaspokojonych potrzeb i przypisują wykonawców w dedykowanym CMS.
                </p>
              </div>
              <Link
                href="/panel"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-gray-900 hover:text-[#e58500] transition-colors"
              >
                Przejdź do panelu ROPS →
              </Link>
            </div>
          </div>
        </section>

        {/* Perimeter Bottom: Status and Info */}
        <footer className="w-full px-6 py-8 md:px-10 flex flex-col md:flex-row justify-between items-center relative z-20 gap-4 mt-auto border-t border-black/[0.04]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-xs font-medium text-gray-400">
              System operacyjny ROPS gotowy • Middleman AI aktywny
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs font-medium text-gray-400">
            <Link href="/innovations" className="hover:text-gray-800 transition-colors">
              Baza innowacji
            </Link>
            <Link href="/form" className="hover:text-gray-800 transition-colors">
              Kreator
            </Link>
            <Link href="/panel" className="hover:text-gray-800 transition-colors">
              Panel ROPS
            </Link>
            <span className="text-gray-300 h-3 w-[1px] bg-gray-300 rounded-full" />
            <span>© 2026 ROPS</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
