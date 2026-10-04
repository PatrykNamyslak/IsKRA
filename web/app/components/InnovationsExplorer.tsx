'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
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
  category?: string
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
  }, [activeTab, selectedCategory, searchQuery])

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
        console.warn('Błąd pobierania feedbacków:', err)
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

  return (
    <div className="mx-auto w-full max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Baza Wiedzy & Innowacji Społecznych
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
            Katalog Innowacji i Giełda Pomysłów
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Przeglądaj zatwierdzone innowacje, zgłaszaj się jako tester lub dołącz do realizacji pomysłów z giełdy.
          </p>
        </div>

        <Link
          href="/form"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
        >
          <span>+ Dodaj nową innowację</span>
        </Link>
      </div>

      {/* Tabs & Filters */}
      <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="inline-flex flex-wrap p-1 bg-gray-100 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Wszystkie innowacje
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('idea_exchange')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
              activeTab === 'idea_exchange'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Giełda pomysłów (Dla wykonawców)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('testing')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
              activeTab === 'testing'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Do testowania (Dla Testerów)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('application')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
              activeTab === 'application'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Zgłoszone wnioski
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj po tytule, problemie..."
            className="rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-gray-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-gray-900 outline-none focus:border-indigo-600"
          >
            <option value="all">Wszystkie kategorie</option>
            {(categoriesList.length > 0 ? categoriesList.map(c => c.name) : ROPS_CATEGORIES).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Innovation Cards Grid */}
      <div className="mt-8">
        {isLoading ? (
          <div className="py-20 text-center text-gray-400">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            <p className="mt-3 text-sm">Wczytuję innowacje z bazy danych...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
            <p className="font-semibold">{error}</p>
          </div>
        ) : innovations.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center">
            <h3 className="text-lg font-bold text-gray-900">Brak innowacji dla wybranych filtrów</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Nie znaleziono pozycji pasujących do kryteriów. Możesz zresetować filtry lub dodać nową innowację w kreatorze.
            </p>
            <div className="mt-5">
              <Link
                href="/form"
                className="inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-500"
              >
                Dodaj innowację w Kreatorze
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {innovations.map((item) => {
              const isExpanded = expandedId === item.id
              const feedbacks = feedbacksMap[item.id] || []
              const isFeedbacksLoading = loadingFeedbacks[item.id]

              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-3xl border border-gray-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100/80">
                        {typeof item.category === 'object' && (item.category as any)?.name
                          ? (item.category as any).name
                          : (item.category || 'Innowacja Społeczna')}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {item.creatorType === 'idea_exchange' ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                            Giełda pomysłów
                          </span>
                        ) : item.creatorType === 'matchmaking_gap' ? (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                            Niezaspokojona potrzeba
                          </span>
                        ) : (
                          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">
                            Wniosek o wdrożenie
                          </span>
                        )}

                        {item.availableForTesting && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                            Do testów
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 leading-snug">
                      {item.title}
                    </h3>

                    {/* Problem */}
                    <div className="mt-3">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                        Zgłoszony problem:
                      </span>
                      <p className="mt-1 text-sm text-gray-700 line-clamp-3 leading-relaxed">
                        {item.patientProblem}
                      </p>
                    </div>

                    {/* Solution */}
                    {item.proposedSolution && (
                      <div className="mt-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                          Rozwiązanie:
                        </span>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-3 leading-relaxed">
                          {item.proposedSolution}
                        </p>
                      </div>
                    )}

                    {/* Support needed (for idea exchange or applications) */}
                    {item.supportNeeded && (
                      <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700">
                        <span className="font-semibold text-gray-900 block mb-0.5">
                          {item.creatorType === 'idea_exchange'
                            ? 'Poszukiwany zespół:'
                            : 'Wymagane wsparcie od ROPS:'}
                        </span>
                        {item.supportNeeded}
                      </div>
                    )}
                  </div>

                  {/* Actions & Expand Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
<<<<<<< Updated upstream
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
=======
                    <Link
                      href={`/innovations/${encodeURIComponent(item.slug || String(item.id))}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100"
>>>>>>> Stashed changes
                    >
                      <span>{isExpanded ? 'Zwiń szczegóły' : 'Opinie & Feedback'}</span>
                      <span className="transition-transform">{isExpanded ? '▲' : '▼'}</span>
                    </button>

                    {item.availableForTesting && (
                      <Link
                        href={`/form?tab=idea&problem=${encodeURIComponent(
                          `Zgłoszenie do testowania innowacji: ${item.title}`
                        )}`}
                        className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 transition"
                      >
                        Aplikuj do testów
                      </Link>
                    )}
                  </div>

                  {/* Expanded Content: Feedbacks & Feedback Form */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
                      <h4 className="text-sm font-bold text-gray-900 mb-3">
                        Opinie społeczności i testerów:
                      </h4>

                      {isFeedbacksLoading ? (
                        <p className="text-xs text-gray-400">Wczytywanie opinii...</p>
                      ) : feedbacks.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {feedbacks.map((fb, idx) => (
                            <div
                              key={fb.id || idx}
                              className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-gray-800">
                                  {fb.authorName || 'Anonim'} (
                                  {fb.role === 'tester' ? '🔬 Tester' : 'Użytkownik'})
                                </span>
                                <span className="text-amber-500">
                                  {'★'.repeat(fb.rating)}
                                  {'☆'.repeat(5 - fb.rating)}
                                </span>
                              </div>
                              <p className="text-gray-600">{fb.comment}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic mb-4">
                          Brak opinii dla tej innowacji. Dodaj pierwszą ocenę poniżej.
                        </p>
                      )}

                      {/* Add Feedback Mini-Form */}
                      <form
                        onSubmit={(e) => handleAddFeedback(e, item.id)}
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs"
                      >
                        <h5 className="text-xs font-bold text-gray-900 mb-2">
                          Dodaj swoją opinię:
                        </h5>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <select
                            value={feedbackRating}
                            onChange={(e) => setFeedbackRating(Number(e.target.value))}
                            className="rounded-lg border border-gray-300 p-1.5 text-xs bg-white"
                          >
                            <option value={5}>⭐⭐⭐⭐⭐ (5 na 5)</option>
                            <option value={4}>⭐⭐⭐⭐ (4 na 5)</option>
                            <option value={3}>⭐⭐⭐ (3 na 5)</option>
                            <option value={2}>⭐⭐ (2 na 5)</option>
                            <option value={1}>⭐ (1 na 5)</option>
                          </select>

                          <select
                            value={feedbackRole}
                            onChange={(e) => setFeedbackRole(e.target.value)}
                            className="rounded-lg border border-gray-300 p-1.5 text-xs bg-white"
                          >
                            <option value="user">Użytkownik</option>
                            <option value="tester">Tester</option>
                            <option value="caregiver">Opiekun</option>
                          </select>
                        </div>

                        <div className="mb-2">
                          <input
                            type="text"
                            value={feedbackAuthor}
                            onChange={(e) => setFeedbackAuthor(e.target.value)}
                            placeholder="Twoje imię"
                            className="w-full rounded-lg border border-gray-300 p-1.5 text-xs"
                          />
                        </div>

                        <div className="mb-2">
                          <textarea
                            rows={2}
                            required
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            placeholder="Twoje uwagi, wynik testu lub feedback..."
                            className="w-full rounded-lg border border-gray-300 p-2 text-xs"
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
                            className="ml-auto rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
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
    <Suspense fallback={<div className="p-12 text-center text-gray-500">Ładowanie katalogu...</div>}>
      <InnovationsExplorerInner />
    </Suspense>
  )
}
