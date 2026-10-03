'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ROPS_CATEGORIES } from '@/lib/categories'

type TabType = 'application' | 'matchmaking_gap' | 'idea_exchange'

function InnovationCreatorInner() {
  const searchParams = useSearchParams()

  const initialTabParam = searchParams.get('tab')
  const initialProblemParam = searchParams.get('problem') || ''

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (initialTabParam === 'gap' || initialTabParam === 'matchmaking_gap') return 'matchmaking_gap'
    if (initialTabParam === 'idea' || initialTabParam === 'idea_exchange') return 'idea_exchange'
    return 'application'
  })

  // Form states
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Dla seniorów')
  const [patientProblem, setPatientProblem] = useState(initialProblemParam)
  const [proposedSolution, setProposedSolution] = useState('')
  const [targetGroup, setTargetGroup] = useState('')
  const [careRequirements, setCareRequirements] = useState('')
  const [supportNeeded, setSupportNeeded] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedData, setSubmittedData] = useState<any | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [categoriesList, setCategoriesList] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    fetch('/api/categories?limit=100')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.docs && data.docs.length > 0) {
          setCategoriesList(data.docs.map((d: any) => ({ id: d.id, name: d.name })))
          if (!category && data.docs[0]?.name) {
            setCategory(data.docs[0].name)
          }
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (initialProblemParam && !patientProblem) {
      setPatientProblem(initialProblemParam)
    }
  }, [initialProblemParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    // Automatyczny tytuł dla Tab 2, jeśli użytkownik nie podał
    const finalTitle =
      title.trim() ||
      (activeTab === 'matchmaking_gap'
        ? `Zgłoszenie potrzeby: ${patientProblem.slice(0, 45)}...`
        : 'Innowacja Społeczna')

    const matchedCategory = categoriesList.find(
      (c) => c.name === category || String(c.id) === String(category)
    )
    const categoryVal = matchedCategory ? matchedCategory.id : undefined

    const payload: any = {
      title: finalTitle,
      creatorType: activeTab,
      patientProblem: patientProblem.trim(),
      proposedSolution: proposedSolution.trim(),
      targetGroup: targetGroup.trim(),
      careRequirements: careRequirements.trim(),
      supportNeeded: supportNeeded.trim(),
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      wantsToImplement: activeTab === 'application',
      availableForTesting: activeTab === 'idea_exchange',
    }

    if (categoryVal) {
      payload.category = categoryVal
    }

    try {
      const res = await fetch('/api/innovations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Wystąpił błąd podczas zapisywania innowacji w bazie.')
      }

      const resJson = await res.json()
      setSubmittedData(resJson.data)
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Błąd zapisu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setPatientProblem('')
    setProposedSolution('')
    setTargetGroup('')
    setCareRequirements('')
    setSupportNeeded('')
    setContactName('')
    setContactEmail('')
    setContactPhone('')
    setSubmittedData(null)
    setErrorMessage(null)
  }

  return (
    <div className="mx-auto w-full max-w-4xl py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3.5 py-1 text-xs font-semibold text-indigo-800">
          Kreator Innowacji Społecznych & Opiekuńczych
        </span>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
          Miejsce Tworzenia Nowych Innowacji
        </h1>
        <p className="mt-2 text-base text-gray-600 max-w-2xl mx-auto">
          Wybierz jedną z 3 ścieżek zgłoszenia. Każda innowacja zostaje zapisana w bazie PostgreSQL i przekazana do analizy Administratorom ROPS.
        </p>
      </div>

      {/* 3 Tabs Selection */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-3 p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200">
        <button
          type="button"
          onClick={() => {
            setActiveTab('application')
            setSubmittedData(null)
          }}
          className={`relative flex flex-col items-start p-4 rounded-xl text-left transition-all duration-200 ${
            activeTab === 'application'
              ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-950/5'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
                activeTab === 'application'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              1
            </span>
            <span className="font-bold text-sm">Wnioski o wdrożenie</span>
          </div>
          <span className="mt-1 text-xs text-gray-500 leading-snug">
            Mam innowację i chcę ją zrealizować ze wsparciem ROPS
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('matchmaking_gap')
            setSubmittedData(null)
          }}
          className={`relative flex flex-col items-start p-4 rounded-xl text-left transition-all duration-200 ${
            activeTab === 'matchmaking_gap'
              ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-950/5'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
                activeTab === 'matchmaking_gap'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              2
            </span>
            <span className="font-bold text-sm">Brak w matchmakingu</span>
          </div>
          <span className="mt-1 text-xs text-gray-500 leading-snug">
            Nie znalazłem rozwiązania – zgłaszam nową potrzebę
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('idea_exchange')
            setSubmittedData(null)
          }}
          className={`relative flex flex-col items-start p-4 rounded-xl text-left transition-all duration-200 ${
            activeTab === 'idea_exchange'
              ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-950/5'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
                activeTab === 'idea_exchange'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              3
            </span>
            <span className="font-bold text-sm">Giełda pomysłów</span>
          </div>
          <span className="mt-1 text-xs text-gray-500 leading-snug">
            Mam pomysł bez chęci realizacji – szukamy wykonawców
          </span>
        </button>
      </div>

      {/* Success State */}
      {submittedData ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-8 text-center shadow-lg animate-fadeIn">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white text-3xl">
            ✓
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-emerald-950">
            Innowacja została pomyślnie zgłoszona!
          </h2>
          <p className="mt-2 text-sm text-emerald-800 max-w-xl mx-auto">
            Obiekt został utworzony w bazie danych PostgreSQL. Administratorzy ROPS otrzymali powiadomienie i dokonają weryfikacji wykonalności.
          </p>

          <div className="mt-6 inline-flex flex-col sm:flex-row gap-3">
            <Link
              href="/innovations"
              className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-gray-800 transition"
            >
              Zobacz listę innowacji
            </Link>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-xs hover:bg-gray-50 transition"
            >
              Dodaj kolejne zgłoszenie
            </button>
          </div>
        </div>
      ) : (
        /* Form Container */
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-xl shadow-gray-200/50"
        >
          {/* Path Header Banner */}
          <div className="mb-6 rounded-2xl p-4 sm:p-5 border text-sm">
            {activeTab === 'application' && (
              <div className="bg-indigo-50/70 border-indigo-200 text-indigo-950 rounded-xl p-4">
                <strong className="block text-indigo-900 text-base mb-1">
                  Ścieżka 1: Wniosek o realizację własnej innowacji
                </strong>
                Chcesz być liderem wdrożenia swojego rozwiązania. Wypełnij wniosek, a ROPS pomoże Ci w doborze narzędzi, dofinansowania i zespołu testerów.
              </div>
            )}
            {activeTab === 'matchmaking_gap' && (
              <div className="bg-amber-50/80 border-amber-200 text-amber-950 rounded-xl p-4">
                <strong className="block text-amber-900 text-base mb-1">
                  Ścieżka 2: Zgłoszenie niezaspokojonej potrzeby
                </strong>
                Szukałeś rozwiązania w wyszukiwarce i go nie było? Przedstaw zdiagnozowaną potrzebę oraz wstępną propozycję rozwiązania, a ROPS podejmie temat.
              </div>
            )}
            {activeTab === 'idea_exchange' && (
              <div className="bg-emerald-50/70 border-emerald-200 text-emerald-950 rounded-xl p-4">
                <strong className="block text-emerald-900 text-base mb-1">
                  Ścieżka 3: Giełda pomysłów (Dla wykonawców i testerów)
                </strong>
                Masz świetny pomysł, ale nie chcesz/nie masz możliwości go wdrożyć? Opublikujemy go na giełdzie, a ROPS znajdzie naukowców i realizatorów!
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <strong>Błąd:</strong> {errorMessage}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Tytuł */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Tytuł innowacji <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  activeTab === 'application'
                    ? 'np. Inteligentny system monitorowania snu seniora'
                    : activeTab === 'matchmaking_gap'
                    ? 'np. Mobilna pomoc psychologiczna dla opiekunów'
                    : 'np. Urządzenie ułatwiające otwieranie słoików osobom ze stwardnieniem'
                }
                className="w-full rounded-xl border border-gray-300 p-3.5 text-sm text-gray-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
              />
            </div>

            {/* Kategoria & Grupa docelowa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  {activeTab === 'matchmaking_gap' ? 'Sugerowana kategoria' : 'Kategoria innowacji'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3.5 text-sm bg-white text-gray-900 outline-none focus:border-indigo-600"
                >
                  {(categoriesList.length > 0 ? categoriesList.map(c => c.name) : ROPS_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  Grupa docelowa (beneficjenci)
                </label>
                <input
                  type="text"
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  placeholder="np. Seniorzy 75+, osoby po udarach, dzieci z ASD"
                  className="w-full rounded-xl border border-gray-300 p-3.5 text-sm text-gray-900 outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Problem pacjenta / użytkownika */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Problem lub niezaspokojona potrzeba <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={patientProblem}
                onChange={(e) => setPatientProblem(e.target.value)}
                placeholder="Dokładnie opisz problem pacjenta, z czym się mierzy i dlaczego dotychczasowe rozwiązania są niewystarczające..."
                className="w-full rounded-xl border border-gray-300 p-3.5 text-sm text-gray-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
              />
            </div>

            {/* Proponowane rozwiązanie */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">
                {activeTab === 'idea_exchange'
                  ? 'Wizja rozwiązania pomysłu'
                  : 'Proponowane rozwiązanie innowacji'}
              </label>
              <textarea
                rows={3}
                value={proposedSolution}
                onChange={(e) => setProposedSolution(e.target.value)}
                placeholder="Jak według Ciebie powinno wyglądać i funkcjonować to rozwiązanie..."
                className="w-full rounded-xl border border-gray-300 p-3.5 text-sm text-gray-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
              />
            </div>

            {/* Pola specyficzne dla Tab 1 (Wniosek) */}
            {activeTab === 'application' && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Wymagania medyczne, opiekuńcze lub techniczne
                  </label>
                  <textarea
                    rows={2}
                    value={careRequirements}
                    onChange={(e) => setCareRequirements(e.target.value)}
                    placeholder="Wymogi bezpieczeństwa, higieny, ergonomii lub asysty medycznej..."
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">
                    Jakiego wsparcia oczekujesz od ROPS?
                  </label>
                  <textarea
                    rows={2}
                    value={supportNeeded}
                    onChange={(e) => setSupportNeeded(e.target.value)}
                    placeholder="np. Grant na prototyp, pomoc prawno-patentowa, dobór ośrodka do testów pilotażowych..."
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:border-indigo-600"
                  />
                </div>
              </>
            )}

            {/* Pola specyficzne dla Tab 3 (Giełda pomysłów) */}
            {activeTab === 'idea_exchange' && (
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">
                  Kto byłby idealnym wykonawcą?
                </label>
                <textarea
                  rows={2}
                  value={supportNeeded}
                  onChange={(e) => setSupportNeeded(e.target.value)}
                  placeholder="np. Szukamy koła naukowego robotyki, fundacji opiekującej się osobami niewidomymi lub programistów..."
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:border-indigo-600"
                />
              </div>
            )}

            {/* Sekcja danych kontaktowych */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                Dane kontaktowe zgłaszającego
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Dane posłużą administratorom ROPS do kontaktu w sprawie ewaluacji i wdrożenia.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Imię i nazwisko
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Jan Kowalski"
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Adres e-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="jan.kowalski@example.com"
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Numer telefonu
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+48 123 456 789"
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Po wysłaniu zgłoszenie natychmiast trafi do bazy PostgreSQL i panelu ROPS.
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Zapisuję w bazie...</span>
                  </>
                ) : (
                  <span>
                    {activeTab === 'application' && 'Złóż wniosek o realizację'}
                    {activeTab === 'matchmaking_gap' && 'Prześlij zgłoszenie potrzeby'}
                    {activeTab === 'idea_exchange' && 'Opublikuj na giełdzie pomysłów'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

export default function InnovationCreator() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Ładowanie kreatora...</div>}>
      <InnovationCreatorInner />
    </Suspense>
  )
}
