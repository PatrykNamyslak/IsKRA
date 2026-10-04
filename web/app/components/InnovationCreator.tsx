'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Tabs, Button } from '@heroui/react'
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lightbulb,
  Plus,
} from 'lucide-react'
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
        <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Zgłoś swoją <span className="text-brand">innowację</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Wybierz jedną z 3 ścieżek zgłoszenia. Każda innowacja zostaje zapisana w bazie i przekazana do analizy doradcom ROPS.
        </p>
      </div>

      {/* 3 Tabs Selection */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab('application')
            setSubmittedData(null)
          }}
          className={`relative flex flex-col items-start p-5 rounded-[1.75rem] text-left transition-all duration-300 backdrop-blur-2xl cursor-pointer ${
            activeTab === 'application'
              ? 'bg-white/80 border-2 border-brand text-gray-900 shadow-[0_12px_32px_-8px_rgba(229,133,0,0.18)] -translate-y-0.5'
              : 'bg-white/45 border border-white/75 text-gray-600 hover:text-gray-900 hover:bg-white/65 hover:border-white/90 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'application'
                  ? 'bg-brand text-white shadow-2xs'
                  : 'bg-black/[0.06] text-gray-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
            </span>
            <span className="font-bold text-sm">Wniosek o wdrożenie</span>
          </div>
          <span className="mt-2 text-xs text-gray-500 leading-relaxed">
            Mam innowację i chcę ją zrealizować ze wsparciem ROPS
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('matchmaking_gap')
            setSubmittedData(null)
          }}
          className={`relative flex flex-col items-start p-5 rounded-[1.75rem] text-left transition-all duration-300 backdrop-blur-2xl cursor-pointer ${
            activeTab === 'matchmaking_gap'
              ? 'bg-white/80 border-2 border-amber-500 text-gray-900 shadow-[0_12px_32px_-8px_rgba(245,158,11,0.18)] -translate-y-0.5'
              : 'bg-white/45 border border-white/75 text-gray-600 hover:text-gray-900 hover:bg-white/65 hover:border-white/90 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'matchmaking_gap'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-black/[0.06] text-gray-700'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
            <span className="font-bold text-sm">Brak w matchmakingu</span>
          </div>
          <span className="mt-2 text-xs text-gray-500 leading-relaxed">
            Nie znalazłem rozwiązania – zgłaszam nową potrzebę
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('idea_exchange')
            setSubmittedData(null)
          }}
          className={`relative flex flex-col items-start p-5 rounded-[1.75rem] text-left transition-all duration-300 backdrop-blur-2xl cursor-pointer ${
            activeTab === 'idea_exchange'
              ? 'bg-white/80 border-2 border-emerald-500 text-gray-900 shadow-[0_12px_32px_-8px_rgba(16,185,129,0.18)] -translate-y-0.5'
              : 'bg-white/45 border border-white/75 text-gray-600 hover:text-gray-900 hover:bg-white/65 hover:border-white/90 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'idea_exchange'
                  ? 'bg-emerald-500 text-white shadow-2xs'
                  : 'bg-black/[0.06] text-gray-700'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
            </span>
            <span className="font-bold text-sm">Giełda pomysłów</span>
          </div>
          <span className="mt-2 text-xs text-gray-500 leading-relaxed">
            Mam pomysł bez chęci realizacji – szukamy wykonawców
          </span>
        </button>
      </div>

      {/* Success State */}
      {submittedData ? (
        <div className="rounded-[2.5rem] bg-white/65 border border-white/85 p-8 sm:p-12 text-center shadow-[0_16px_50px_-12px_rgba(0,0,0,0.08)] backdrop-blur-2xl transition-all">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 shadow-2xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="mt-5 text-2xl sm:text-3xl font-extrabold text-gray-900">
            Innowacja została pomyślnie zgłoszona!
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Zgłoszenie trafiło do bazy danych. Zespół ROPS dokona weryfikacji i skontaktuje się z Tobą w sprawie kolejnych kroków.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/innovations"
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95"
            >
              <span>Zobacz bazę innowacji</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Button
              size="sm"
              onPress={resetForm}
              className="rounded-full bg-white/80 border border-black/[0.08] hover:bg-white text-gray-800 px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer h-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj kolejne zgłoszenie</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Form Container */
        <form
          onSubmit={handleSubmit}
          className="rounded-[2.5rem] bg-white/55 border border-white/80 p-6 sm:p-10 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.08)] backdrop-blur-2xl"
        >
          {/* Path Header Banner */}
          <div className="mb-8">
            {activeTab === 'application' && (
              <div className="rounded-2xl bg-brand/10 border border-brand/25 p-4 sm:p-5 text-gray-900">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-brand/20 px-2 py-0.5 text-[11px] font-bold text-brand uppercase tracking-wider">
                    Ścieżka 1
                  </span>
                  <strong className="text-sm sm:text-base font-bold text-gray-900">
                    Wniosek o realizację własnej innowacji
                  </strong>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Chcesz być liderem wdrożenia swojego rozwiązania. Wypełnij wniosek, a ROPS pomoże Ci w doborze narzędzi, dofinansowania i zespołu testerów.
                </p>
              </div>
            )}
            {activeTab === 'matchmaking_gap' && (
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/25 p-4 sm:p-5 text-gray-900">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                    Ścieżka 2
                  </span>
                  <strong className="text-sm sm:text-base font-bold text-gray-900">
                    Zgłoszenie niezaspokojonej potrzeby
                  </strong>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Szukałeś rozwiązania w wyszukiwarce i go nie było? Przedstaw zdiagnozowaną potrzebę oraz wstępną propozycję rozwiązania, a ROPS podejmie temat.
                </p>
              </div>
            )}
            {activeTab === 'idea_exchange' && (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-4 sm:p-5 text-gray-900">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Ścieżka 3
                  </span>
                  <strong className="text-sm sm:text-base font-bold text-gray-900">
                    Giełda pomysłów (Dla wykonawców i testerów)
                  </strong>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Masz świetny pomysł, ale nie chcesz/nie masz możliwości go wdrożyć? Opublikujemy go na giełdzie, a ROPS pomoże znaleźć realizatorów i ośrodki testowe!
                </p>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-rose-300/60 bg-rose-50/80 p-4 text-xs sm:text-sm text-rose-800 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span><strong>Błąd:</strong> {errorMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Tytuł */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5">
                Tytuł innowacji <span className="text-brand">*</span>
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
                className="w-full rounded-2xl border border-black/[0.08] bg-white/70 backdrop-blur-sm px-4 py-3 text-base text-gray-900 shadow-2xs placeholder:text-gray-400 focus:border-brand focus:ring-4 focus:ring-brand/15 focus:bg-white focus:outline-none transition-all"
              />
            </div>

            {/* Kategoria & Grupa docelowa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5">
                  {activeTab === 'matchmaking_gap' ? 'Sugerowana kategoria' : 'Kategoria innowacji'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-black/[0.08] bg-white/70 backdrop-blur-sm px-4 py-3 text-base text-gray-900 shadow-2xs focus:border-brand focus:ring-4 focus:ring-brand/15 focus:bg-white focus:outline-none transition-all cursor-pointer"
                >
                  {(categoriesList.length > 0 ? categoriesList.map((c) => c.name) : ROPS_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5">
                  Grupa docelowa (beneficjenci)
                </label>
                <input
                  type="text"
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  placeholder="np. Seniorzy 75+, osoby po udarach, dzieci z ASD"
                  className="w-full rounded-2xl border border-black/[0.08] bg-white/70 backdrop-blur-sm px-4 py-3 text-base text-gray-900 shadow-2xs placeholder:text-gray-400 focus:border-brand focus:ring-4 focus:ring-brand/15 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Problem pacjenta / użytkownika */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5">
                Problem lub niezaspokojona potrzeba <span className="text-brand">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={patientProblem}
                onChange={(e) => setPatientProblem(e.target.value)}
                placeholder="Dokładnie opisz problem pacjenta, z czym się mierzy i dlaczego dotychczasowe rozwiązania są niewystarczające..."
                className="w-full rounded-2xl border border-black/[0.08] bg-white/70 backdrop-blur-sm px-4 py-3 text-base text-gray-900 shadow-2xs placeholder:text-gray-400 focus:border-brand focus:ring-4 focus:ring-brand/15 focus:bg-white focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Proponowane rozwiązanie */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5">
                {activeTab === 'idea_exchange'
                  ? 'Wizja rozwiązania pomysłu'
                  : 'Proponowane rozwiązanie innowacji'}
              </label>
              <textarea
                rows={3}
                value={proposedSolution}
                onChange={(e) => setProposedSolution(e.target.value)}
                placeholder="Jak według Ciebie powinno wyglądać i funkcjonować to rozwiązanie..."
                className="w-full rounded-2xl border border-black/[0.08] bg-white/70 backdrop-blur-sm px-4 py-3 text-base text-gray-900 shadow-2xs placeholder:text-gray-400 focus:border-brand focus:ring-4 focus:ring-brand/15 focus:bg-white focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Pola specyficzne dla Tab 1 (Wniosek) */}
            {activeTab === 'application' && (
              <>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5">
                    Wymagania medyczne, opiekuńcze lub techniczne
                  </label>
                  <textarea
                    rows={2}
                    value={careRequirements}
                    onChange={(e) => setCareRequirements(e.target.value)}
                    placeholder="Wymogi bezpieczeństwa, higieny, ergonomii lub asysty medycznej..."
                    className="w-full rounded-2xl border border-black/[0.08] bg-white/70 backdrop-blur-sm px-4 py-3 text-base text-gray-900 shadow-2xs placeholder:text-gray-400 focus:border-brand focus:ring-4 focus:ring-brand/15 focus:bg-white focus:outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5">
                    Jakiego wsparcia oczekujesz od ROPS?
                  </label>
                  <textarea
                    rows={2}
                    value={supportNeeded}
                    onChange={(e) => setSupportNeeded(e.target.value)}
                    placeholder="np. Grant na prototyp, pomoc prawno-patentowa, dobór ośrodka do testów pilotażowych..."
                    className="w-full rounded-2xl border border-black/[0.08] bg-white/70 backdrop-blur-sm px-4 py-3 text-base text-gray-900 shadow-2xs placeholder:text-gray-400 focus:border-brand focus:ring-4 focus:ring-brand/15 focus:bg-white focus:outline-none transition-all resize-none"
                  />
                </div>
              </>
            )}

            {/* Pola specyficzne dla Tab 3 (Giełda pomysłów) */}
            {activeTab === 'idea_exchange' && (
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5">
                  Kto byłby idealnym wykonawcą?
                </label>
                <textarea
                  rows={2}
                  value={supportNeeded}
                  onChange={(e) => setSupportNeeded(e.target.value)}
                  placeholder="np. Szukamy koła naukowego robotyki, fundacji opiekującej się osobami niewidomymi lub programistów..."
                  className="w-full rounded-2xl border border-black/[0.08] bg-white/70 backdrop-blur-sm px-4 py-3 text-base text-gray-900 shadow-2xs placeholder:text-gray-400 focus:border-brand focus:ring-4 focus:ring-brand/15 focus:bg-white focus:outline-none transition-all resize-none"
                />
              </div>
            )}

            {/* Sekcja danych kontaktowych */}
            <div className="border-t border-black/[0.06] pt-6">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                Dane kontaktowe zgłaszającego
              </h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Dane posłużą administratorom ROPS do kontaktu w sprawie ewaluacji i wdrożenia.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Imię i nazwisko
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Jan Kowalski"
                    className="w-full rounded-2xl border border-black/[0.08] bg-white/70 backdrop-blur-sm px-4 py-2.5 text-base text-gray-900 shadow-2xs placeholder:text-gray-400 focus:border-brand focus:ring-4 focus:ring-brand/15 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Adres e-mail <span className="text-brand">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="jan.kowalski@example.com"
                    className="w-full rounded-2xl border border-black/[0.08] bg-white/70 backdrop-blur-sm px-4 py-2.5 text-base text-gray-900 shadow-2xs placeholder:text-gray-400 focus:border-brand focus:ring-4 focus:ring-brand/15 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Numer telefonu
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+48 123 456 789"
                    className="w-full rounded-2xl border border-black/[0.08] bg-white/70 backdrop-blur-sm px-4 py-2.5 text-base text-gray-900 shadow-2xs placeholder:text-gray-400 focus:border-brand focus:ring-4 focus:ring-brand/15 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-black/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-gray-500 text-center sm:text-left">
                Po wysłaniu zgłoszenie natychmiast trafi do bazy wiedzy i panelu doradców ROPS.
              </span>
              <Button
                type="submit"
                isDisabled={isSubmitting}
                className="w-full sm:w-auto rounded-full bg-brand hover:bg-brand-hover text-white px-8 py-3 text-sm font-semibold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Zapisuję w bazie...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {activeTab === 'application' && 'Złóż wniosek o realizację'}
                      {activeTab === 'matchmaking_gap' && 'Prześlij zgłoszenie potrzeby'}
                      {activeTab === 'idea_exchange' && 'Opublikuj na giełdzie pomysłów'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

export default function InnovationCreator() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-gray-400"><div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-brand border-t-transparent" /><p className="mt-3 text-xs sm:text-sm font-medium text-gray-500">Ładowanie kreatora...</p></div>}>
      <InnovationCreatorInner />
    </Suspense>
  )
}
