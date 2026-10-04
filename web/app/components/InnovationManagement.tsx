'use client'

import { useEffect, useState, type FormEvent } from 'react'

const PAGE_SIZE = 20

const STATUS_OPTIONS = [
  { label: 'Zgłoszona', value: 'submitted' },
  { label: 'W trakcie weryfikacji', value: 'under_review' },
  { label: 'Zatwierdzona', value: 'approved' },
  { label: 'W trakcie realizacji', value: 'in_progress' },
  { label: 'Odrzucona', value: 'rejected' },
  { label: 'W trakcie testów', value: 'testing' },
  { label: 'Zakończona', value: 'completed' },
] as const

type InnovationStatus = (typeof STATUS_OPTIONS)[number]['value']

function isInnovationStatus(value: string): value is InnovationStatus {
  return STATUS_OPTIONS.some((option) => option.value === value)
}

interface InnovationItem {
  id: string | number
  title: string
  slug: string
  status: InnovationStatus
  organizerNote?: string | null
  category?: string | { name?: string } | null
  updatedAt?: string
}

interface InnovationResponse {
  docs: InnovationItem[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
}

interface Draft {
  status: InnovationStatus
  organizerNote: string
}

function categoryName(category: InnovationItem['category']) {
  if (typeof category === 'string') return category
  return category?.name || 'Bez kategorii'
}

export default function InnovationManagement() {
  const [data, setData] = useState<InnovationResponse | null>(null)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState<string | number | null>(null)
  const [savedId, setSavedId] = useState<string | number | null>(null)

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      page: String(page),
      depth: '1',
      sort: '-updatedAt',
    })
    if (search) params.set('where[title][like]', search)

    fetch(`/api/innovations?${params}`, {
      credentials: 'same-origin',
      cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Nie udało się pobrać innowacji.')
        return (await response.json()) as InnovationResponse
      })
      .then((result) => {
        if (cancelled) return
        setData(result)
        setDrafts((current) => {
          const next = { ...current }
          for (const item of result.docs) {
            const key = String(item.id)
            if (!next[key]) {
              next[key] = {
                status: item.status,
                organizerNote: item.organizerNote || '',
              }
            }
          }
          return next
        })
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Wystąpił błąd podczas pobierania danych.')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page, search])

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')
    setPage(1)
    setSearch(searchInput.trim())
  }

  const changePage = (nextPage: number) => {
    setIsLoading(true)
    setError('')
    setPage(nextPage)
  }

  const updateDraft = (id: string | number, updates: Partial<Draft>) => {
    const key = String(id)
    setDrafts((current) => ({
      ...current,
      [key]: { ...current[key], ...updates },
    }))
    setSavedId(null)
  }

  const saveInnovation = async (item: InnovationItem) => {
    const draft = drafts[String(item.id)]
    if (!draft) return

    setSavingId(item.id)
    setSavedId(null)
    setError('')
    try {
      const response = await fetch(`/api/innovations/${encodeURIComponent(String(item.id))}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: draft.status,
          organizerNote: draft.organizerNote,
        }),
      })

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { errors?: { message?: string }[]; message?: string } | null
        throw new Error(result?.errors?.[0]?.message || result?.message || 'Nie udało się zapisać zmian.')
      }

      setData((current) =>
        current
          ? {
              ...current,
              docs: current.docs.map((entry) =>
                entry.id === item.id
                  ? { ...entry, status: draft.status, organizerNote: draft.organizerNote }
                  : entry,
              ),
            }
          : current,
      )
      setSavedId(item.id)
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Wystąpił błąd podczas zapisywania zmian.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="iskra-innovation-management" aria-labelledby="innovation-management-title">
      <header className="iskra-innovation-management__header">
        <div>
          <p className="iskra-admin-welcome__eyebrow">ZARZĄDZANIE INNOWACJAMI</p>
          <h1 id="innovation-management-title">Postępy i aktualizacje</h1>
          <p>Szybko zmieniaj status i dodawaj notatki widoczne na stronie innowacji.</p>
        </div>
        <span className="iskra-innovation-management__count">
          {data ? `${data.totalDocs} innowacji` : 'Katalog'}
        </span>
      </header>

      <form className="iskra-innovation-management__search" onSubmit={submitSearch}>
        <label htmlFor="innovation-management-search">Znajdź innowację</label>
        <div>
          <input
            id="innovation-management-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Wpisz nazwę innowacji…"
          />
          <button className="btn btn--style-primary" type="submit">Szukaj</button>
        </div>
      </form>

      {error && <p className="iskra-innovation-management__error" role="alert">{error}</p>}

      {isLoading ? (
        <p className="iskra-innovation-management__empty" role="status">Wczytywanie innowacji…</p>
      ) : data?.docs.length ? (
        <div className="iskra-innovation-management__list">
          {data.docs.map((item) => {
            const draft = drafts[String(item.id)]
            const isDirty = draft && (
              draft.status !== item.status ||
              draft.organizerNote !== (item.organizerNote || '')
            )

            return (
              <article className="iskra-innovation-card" key={item.id}>
                <div className="iskra-innovation-card__heading">
                  <div>
                    <span className="iskra-innovation-card__category">{categoryName(item.category)}</span>
                    <h2>{item.title}</h2>
                  </div>
                  <a href={`/innovations/${encodeURIComponent(item.slug)}`} target="_blank" rel="noreferrer">
                    Podgląd <span aria-hidden="true">↗</span>
                  </a>
                </div>

                <div className="iskra-innovation-card__fields">
                  <label>
                    Status
                    <select
                      value={draft?.status || item.status}
                      onChange={(event) => {
                        if (isInnovationStatus(event.target.value)) {
                          updateDraft(item.id, { status: event.target.value })
                        }
                      }}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Aktualizacja organizatora
                    <textarea
                      rows={3}
                      value={draft?.organizerNote ?? item.organizerNote ?? ''}
                      onChange={(event) => updateDraft(item.id, { organizerNote: event.target.value })}
                      placeholder="Opisz postępy, co udało się zrobić i ewentualne trudności…"
                    />
                  </label>
                </div>

                <footer className="iskra-innovation-card__footer">
                  <span aria-live="polite">
                    {savedId === item.id ? 'Zapisano zmiany' : isDirty ? 'Niezapisane zmiany' : ''}
                  </span>
                  <button
                    className="btn btn--style-primary"
                    type="button"
                    disabled={!isDirty || savingId !== null}
                    onClick={() => void saveInnovation(item)}
                  >
                    {savingId === item.id ? 'Zapisywanie…' : 'Zapisz zmiany'}
                  </button>
                </footer>
              </article>
            )
          })}
        </div>
      ) : (
        <p className="iskra-innovation-management__empty">
          {search ? 'Nie znaleziono innowacji dla tego wyszukiwania.' : 'Brak innowacji do wyświetlenia.'}
        </p>
      )}

      {data && data.totalPages > 1 && (
        <nav className="iskra-innovation-management__pagination" aria-label="Strony innowacji">
          <button type="button" disabled={!data.page || data.page <= 1 || isLoading} onClick={() => changePage(Math.max(1, page - 1))}>
            Poprzednia
          </button>
          <span>Strona {data.page} z {data.totalPages}</span>
          <button type="button" disabled={!data.hasNextPage || isLoading} onClick={() => changePage(page + 1)}>
            Następna
          </button>
        </nav>
      )}
    </section>
  )
}
