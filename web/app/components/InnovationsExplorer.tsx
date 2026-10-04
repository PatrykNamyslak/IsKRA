'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles,
  Search,
  ArrowRight,
  Plus,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Lightbulb,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { ROPS_CATEGORIES } from '@/lib/categories'

interface Feedback {
  id: string | number
  rating: number
  comment: string
  authorName?: string
  role?: string
  createdAt?: string
}

interface Innovation {
  id: string | number
  title: string
  slug?: string
  creatorType?: 'application' | 'matchmaking_gap' | 'idea_exchange'
  category?: string | { name?: string }
  patientProblem: string
  proposedSolution?: string
  targetGroup?: string
  status?: string
  availableForTesting?: boolean
  wantsToImplement?: boolean
  contactName?: string
  contactEmail?: string
  supportNeeded?: string
  createdAt?: string
}

function InnovationsExplorerInner() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab')

  const [innovations, setInnovations] = useState<Innovation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (initialTab === 'testing') return 'testing'
    if (initialTab === 'ideas') return 'idea_exchange'
    return 'all'
  })
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoriesList, setCategoriesList] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    fetch('/api/categories?limit=100')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.docs && data.docs.length > 0) {
          setCategoriesList(data.docs.map((d: any) => ({ id: d.id, name: d.name })))
        }
      })
      .catch(() => {})
  }, [])

  // Expanded card state & feedbacks cache
  const [expandedId, setExpandedId] = useState<string | number | null>(null)
  const [feedbacksMap, setFeedbacksMap] = useState<Record<string, Feedback[]>>({})
  const [loadingFeedbacks, setLoadingFeedbacks] = useState<Record<string, boolean>>({})

  // Feedback form per expanded innovation
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [feedbackAuthor, setFeedbackAuthor] = useState('')
  const [feedbackRole, setFeedbackRole] = useState('user')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)

  // Fetch innovations
  useEffect(() => {
    const fetchInnovations = async () => {
      setIsLoading(true)
      try {
        let url = '/api/innovations?limit=100&sort=-createdAt'
        if (selectedCategory !== 'all') {
          const matchedCat = categoriesList.find((c) => c.name === selectedCategory)
          if (matchedCat) {
            url += `&where[category][equals]=${matchedCat.id}`
          } else {
            url += `&where[category.name][equals]=${encodeURIComponent(selectedCategory)}`
          }
        }
        if (activeTab === 'idea_exchange') {
          url += `&where[creatorType][equals]=idea_exchange`
        } else if (activeTab === 'testing') {
          url += `&where[availableForTesting][equals]=true`
        } else if (activeTab === 'application') {
          url += `&where[creatorType][equals]=application`
        }
        if (searchQuery.trim()) {
          url += `&where[title][like]=${encodeURIComponent(searchQuery.trim())}`
        }

        const res = await fetch(url)
        if (!res.ok) throw new Error('Błąd pobierania danych')
        const data = await res.json()
        setInnovations(data.docs || [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Błąd połączenia')
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchInnovations()
    }, 200)

    return () => clearTimeout(timer)
  }, [activeTab, selectedCategory, searchQuery, categoriesList])

  // Load feedbacks for an innovation
  const toggleExpand = async (id: string | number) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }

    setExpandedId(id)
    setFeedbackSuccess(false)
    setFeedbackComment('')

    if (!feedbacksMap[id]) {
      setLoadingFeedbacks((prev) => ({ ...prev, [id]: true }))
      try {
        const res = await fetch(`/api/feedbacks?where[innovation][equals]=${id}&sort=-createdAt`)
        if (res.ok) {
          const data = await res.json()
          setFeedbacksMap((prev) => ({ ...prev, [id]: data.docs || [] }))
        }
      } catch (err) {
        console.warn('Błąd pobierania opinii:', err)
      } finally {
        setLoadingFeedbacks((prev) => ({ ...prev, [id]: false }))
      }
    }
  }

  const handleAddFeedback = async (e: React.FormEvent, innovationId: string | number) => {
    e.preventDefault()
    if (!feedbackComment.trim()) return

    setSubmittingFeedback(true)
    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          innovation: innovationId,
          rating: feedbackRating,
          comment: feedbackComment.trim(),
          authorName: feedbackAuthor.trim() || 'Użytkownik',
          role: feedbackRole,
        }),
      })

      if (!res.ok) throw new Error('Nie udało się zapisać opinii.')
      const resJson = await res.json()

      setFeedbackSuccess(true)
      setFeedbackComment('')
      const createdItem = resJson.doc || resJson.data
      if (createdItem) {
        setFeedbacksMap((prev) => ({
          ...prev,
          [innovationId]: [createdItem, ...(prev[innovationId] || [])],
        }))
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Błąd')
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const getCategoryName = (cat?: string | { name?: string }) => {
    if (!cat) return 'Innowacja Społeczna'
    if (typeof cat === 'object' && cat.name) return cat.name
    return String(cat)
  }

  return (
    <div className="mx-auto w-full max-w-6xl py-8 sm:py-12 px-4 sm:px-6 relative z-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-black/[0.05]">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/60 px-3.5 py-1 text-xs font-semibold text-gray-700 shadow-2xs backdrop-blur-md mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#e58500]" />
            Baza Pomysłów & Innowacji ROPS
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-gray-900">
            Baza Pomysłów i Katalog Innowacji
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-2xl leading-relaxed">
            Przeglądaj innowacje społeczne, giełdę pomysłów do zrealizowania oraz projekty do testowania przez społeczność.
          </p>
        </div>

        <Link
          href="/form"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e58500] hover:bg-[#cc7700] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#e58500]/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Zgłoś pomysł</span>
        </Link>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="mt-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Segmented Control Tabs */}
        <div className="inline-flex flex-wrap p-1 bg-black/[0.04] rounded-full border border-white/60 backdrop-blur-md gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Wszystkie innowacje
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('idea_exchange')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer ${
              activeTab === 'idea_exchange'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            💡 Giełda pomysłów
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('testing')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer ${
              activeTab === 'testing'
                ? 'bg-white text-[#e58500] shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            🔬 Do testowania
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('application')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer ${
              activeTab === 'application'
                ? 'bg-white text-purple-800 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            📝 Wnioski o wdrożenie
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj po tytule, problemie..."
              className="w-full sm:w-64 rounded-full bg-white/50 border border-white/70 pl-9.5 pr-4 py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:bg-white/80 focus:border-[#e58500]/50 outline-none shadow-2xs backdrop-blur-md transition-all"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-full bg-white/50 border border-white/70 px-4 py-2 text-xs sm:text-sm text-gray-800 focus:bg-white/80 focus:border-[#e58500]/50 outline-none shadow-2xs backdrop-blur-md cursor-pointer transition-all"
          >
            <option value="all">Wszystkie kategorie</option>
            {(categoriesList.length > 0 ? categoriesList.map((c) => c.name) : ROPS_CATEGORIES).map(
              (cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Innovation Cards Grid */}
      <div className="mt-8">
        {isLoading ? (
          <div className="py-24 text-center text-gray-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[#e58500] border-t-transparent" />
            <p className="mt-3 text-xs sm:text-sm font-medium text-gray-500">
              Wczytuję innowacje z bazy danych...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-rose-200 bg-rose-50/80 backdrop-blur-md p-6 text-center text-rose-700">
            <p className="font-semibold text-sm">{error}</p>
          </div>
        ) : innovations.length === 0 ? (
          <div className="rounded-[2.5rem] border border-white/70 bg-white/40 backdrop-blur-xl p-12 text-center shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Brak innowacji dla wybranych filtrów
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
              Nie znaleziono pozycji pasujących do kryteriów. Możesz zresetować filtry lub dodać nowy pomysł w kreatorze.
            </p>
            <div className="mt-5">
              <Link
                href="/form"
                className="inline-flex items-center gap-2 rounded-full bg-[#e58500] hover:bg-[#cc7700] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all"
              >
                <span>Dodaj innowację w Kreatorze</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {innovations.map((item) => {
              const isExpanded = expandedId === item.id
              const feedbacks = feedbacksMap[item.id] || []
              const isFeedbacksLoading = loadingFeedbacks[item.id]
              const slugOrId = item.slug || String(item.id)

              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-[2rem] bg-white/45 border border-white/75 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)] backdrop-blur-2xl p-6 sm:p-7 transition-all duration-300 hover:shadow-[0_16px_40px_rgba(229,133,0,0.1)] hover:border-[#e58500]/30 hover:-translate-y-0.5 group"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                      <span className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-medium text-gray-600">
                        {getCategoryName(item.category)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {item.creatorType === 'idea_exchange' ? (
                          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                            Giełda pomysłów
                          </span>
                        ) : item.creatorType === 'matchmaking_gap' ? (
                          <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                            Niezaspokojona potrzeba
                          </span>
                        ) : (
                          <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
                            Wniosek o wdrożenie
                          </span>
                        )}

                        {item.availableForTesting && (
                          <span className="rounded-full bg-[#e58500]/10 border border-[#e58500]/25 px-2.5 py-0.5 text-xs font-semibold text-[#e58500]">
                            Do testów
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-[#e58500] transition-colors leading-snug">
                      <Link href={`/innovations/${encodeURIComponent(slugOrId)}`}>
                        {item.title}
                      </Link>
                    </h3>

                    {/* Problem */}
                    <div className="mt-3.5">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                        Zgłoszony problem:
                      </span>
                      <p className="mt-1 text-xs sm:text-sm text-gray-700 line-clamp-3 leading-relaxed">
                        {item.patientProblem}
                      </p>
                    </div>

                    {/* Solution */}
                    {item.proposedSolution && (
                      <div className="mt-3.5">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                          Rozwiązanie:
                        </span>
                        <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed">
                          {item.proposedSolution}
                        </p>
                      </div>
                    )}

                    {/* Support needed */}
                    {item.supportNeeded && (
                      <div className="mt-3.5 p-3 rounded-2xl bg-white/50 border border-black/[0.04] text-xs text-gray-700">
                        <span className="font-semibold text-gray-900 block mb-0.5">
                          {item.creatorType === 'idea_exchange'
                            ? 'Poszukiwany zespół:'
                            : 'Wymagane wsparcie od ROPS:'}
                        </span>
                        <span className="text-gray-600">{item.supportNeeded}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Expand Footer */}
                  <div className="mt-6 pt-4 border-t border-black/[0.05] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#e58500]" />
                      <span>{isExpanded ? 'Zwiń opinie' : 'Opinie & Feedback'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/innovations/${encodeURIComponent(slugOrId)}`}
                        className="inline-flex items-center gap-1 rounded-full bg-gray-900 hover:bg-gray-800 text-white px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-all active:scale-95"
                      >
                        <span>Szczegóły</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      {item.availableForTesting && (
                        <Link
                          href={`/form?tab=idea&problem=${encodeURIComponent(
                            `Zgłoszenie do testowania innowacji: ${item.title}`
                          )}`}
                          className="rounded-full bg-[#e58500] hover:bg-[#cc7700] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all active:scale-95"
                        >
                          Aplikuj do testów
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content: Feedbacks & Feedback Form */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-black/[0.05] transition-all">
                      <h4 className="text-xs font-bold text-gray-900 mb-3">
                        Opinie społeczności i testerów:
                      </h4>

                      {isFeedbacksLoading ? (
                        <p className="text-xs text-gray-400">Wczytywanie opinii...</p>
                      ) : feedbacks.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {feedbacks.map((fb, idx) => (
                            <div
                              key={fb.id || idx}
                              className="rounded-2xl border border-white/80 bg-white/50 p-3 text-xs"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-gray-800">
                                  {fb.authorName || 'Anonim'} (
                                  {fb.role === 'tester' ? '🔬 Tester' : '👤 Użytkownik'})
                                </span>
                                <span className="text-amber-500 font-mono text-[11px]">
                                  {'★'.repeat(fb.rating)}
                                  {'☆'.repeat(5 - fb.rating)}
                                </span>
                              </div>
                              <p className="text-gray-600 leading-relaxed">{fb.comment}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic mb-4">
                          Brak wcześniejszych opinii. Dodaj pierwszą ocenę poniżej.
                        </p>
                      )}

                      {/* Add Feedback Mini-Form */}
                      <form
                        onSubmit={(e) => handleAddFeedback(e, item.id)}
                        className="rounded-2xl border border-white/80 bg-white/70 p-3.5 sm:p-4 shadow-2xs"
                      >
                        <h5 className="text-[11px] font-bold text-gray-800 mb-2">
                          Dodaj opinię o tym rozwiązaniu:
                        </h5>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <select
                            value={feedbackRating}
                            onChange={(e) => setFeedbackRating(Number(e.target.value))}
                            className="rounded-xl border border-gray-200 bg-white p-1.5 text-xs text-gray-800 outline-none"
                          >
                            <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                            <option value={4}>⭐⭐⭐⭐ (4)</option>
                            <option value={3}>⭐⭐⭐ (3)</option>
                            <option value={2}>⭐⭐ (2)</option>
                            <option value={1}>⭐ (1)</option>
                          </select>

                          <select
                            value={feedbackRole}
                            onChange={(e) => setFeedbackRole(e.target.value)}
                            className="rounded-xl border border-gray-200 bg-white p-1.5 text-xs text-gray-800 outline-none"
                          >
                            <option value="user">👤 Użytkownik</option>
                            <option value="tester">🔬 Tester</option>
                            <option value="caregiver">🤝 Opiekun</option>
                          </select>
                        </div>

                        <div className="mb-2">
                          <input
                            type="text"
                            value={feedbackAuthor}
                            onChange={(e) => setFeedbackAuthor(e.target.value)}
                            placeholder="Twoje imię / pseudonim"
                            className="w-full rounded-xl border border-gray-200 bg-white p-1.5 text-xs text-gray-800 outline-none"
                          />
                        </div>

                        <div className="mb-2">
                          <textarea
                            rows={2}
                            required
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            placeholder="Twoje uwagi, wynik testu lub feedback..."
                            className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs text-gray-800 outline-none focus:border-[#e58500]/50"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          {feedbackSuccess && (
                            <span className="text-[11px] font-semibold text-emerald-600">
                              ✓ Opinia dodana!
                            </span>
                          )}
                          <button
                            type="submit"
                            disabled={submittingFeedback || !feedbackComment.trim()}
                            className="ml-auto rounded-full bg-gray-900 hover:bg-gray-800 px-3.5 py-1.5 text-xs font-semibold text-white transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {submittingFeedback ? 'Zapisuję...' : 'Wyślij opinię'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function InnovationsExplorer() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-gray-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[#e58500] border-t-transparent" />
          <p className="mt-3 text-xs sm:text-sm font-medium text-gray-500">
            Ładowanie bazy pomysłów...
          </p>
        </div>
      }
    >
      <InnovationsExplorerInner />
    </Suspense>
  )
}
