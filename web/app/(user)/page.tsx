import Link from 'next/link'
import MatchmakingSearch from '@/app/components/MatchmakingSearch'

export const metadata = {
  title: 'INNO-MOST | System Matchmakingu i Kreator Innowacji ROPS',
  description: 'Zgłaszaj potrzeby, weryfikuj istniejące rozwiązania z pomocą AI i twórz innowacje społeczne.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-12 pb-8 sm:pt-16 sm:pb-12 border-b border-gray-100">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-60" />
        
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-900 shadow-xs mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping"></span>
            Inteligentny Matchmaking & Kreator Innowacji Społecznych ROPS
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.15]">
            Masz problem lub potrzebę?{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 bg-clip-text text-transparent">
              Sprawdź gotowe innowacje
            </span>{' '}
            lub stwórz nowe.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Wpisz swój problem. Nasz Middleman AI natychmiast sprawdzi bazę innowacji. Jeśli rozwiązanie istnieje – skorzystaj i oceń je. Jeśli nie – zgłoś brak bezpośrednio do Administratorów ROPS.
          </p>
        </div>

        {/* Central Matchmaking Component */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 mt-8 sm:mt-10">
          <MatchmakingSearch />
        </div>
      </section>

      {/* 3 Creator Paths Showcase */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Kreator Innowacji
            </h2>
            <h3 className="mt-2 text-3xl font-extrabold text-gray-900">
              Trzy wejścia do tworzenia innowacji
            </h3>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Niezależnie od tego, czy chcesz zrealizować pomysł osobiście, szukasz brakującego rozwiązania, czy chcesz zlecić pomysł innym – wybierz odpowiednią ścieżkę.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group relative rounded-3xl border border-gray-200 bg-gray-50/50 p-8 transition-all duration-300 hover:border-indigo-300 hover:bg-white hover:shadow-xl hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-md shadow-indigo-600/30">
                1
              </div>
              <h4 className="mt-6 text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                Wnioski o wdrożenie
              </h4>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Dla osób i organizacji, które mają innowację i chcą ją samodzielnie zrealizować. Administratorzy ROPS pomagają w doborze narzędzi, dofinansowania i zespołu.
              </p>
              <div className="mt-6">
                <Link
                  href="/form?tab=application"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                >
                  <span>Złóż wniosek</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative rounded-3xl border border-gray-200 bg-gray-50/50 p-8 transition-all duration-300 hover:border-amber-300 hover:bg-white hover:shadow-xl hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white font-bold text-lg shadow-md shadow-amber-500/30">
                2
              </div>
              <h4 className="mt-6 text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                Niezaspokojona potrzeba
              </h4>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Szukałeś rozwiązania i baza go nie znalazła? Opisz zdiagnozowaną potrzebę, zaproponuj wstępny kierunek rozwiązania i zostaw dane kontaktowe dla ROPS.
              </p>
              <div className="mt-6">
                <Link
                  href="/form?tab=gap"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:text-amber-700"
                >
                  <span>Zgłoś niezaspokojoną potrzebę</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative rounded-3xl border border-gray-200 bg-gray-50/50 p-8 transition-all duration-300 hover:border-emerald-300 hover:bg-white hover:shadow-xl hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-lg shadow-md shadow-emerald-600/30">
                3
              </div>
              <h4 className="mt-6 text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                Giełda pomysłów
              </h4>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Masz wartościowy pomysł, ale nie chcesz/nie możesz go sam wdrożyć? Opublikuj go na giełdzie, a ROPS poszuka chętnych naukowców i wykonawców do jego realizacji.
              </p>
              <div className="mt-6">
                <Link
                  href="/form?tab=idea"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700"
                >
                  <span>Zgłoś do realizacji</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Architecture in System */}
      <section className="py-16 bg-gray-50/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Role w Systemie
            </h2>
            <h3 className="mt-1 text-3xl font-extrabold text-gray-900">
              Kto tworzy i testuje innowacje?
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white p-6 border border-gray-200 shadow-sm">
              <div className="text-2xl mb-2">👤</div>
              <h4 className="font-bold text-lg text-gray-900">Użytkownicy i Goście</h4>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Zwykli obywatele, pacjenci, ich opiekunowie i pracownicy placówek. Szukają rozwiązań swoich trudności, korzystają z innowacji i zostawiają wartościowy feedback.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-gray-200 shadow-sm">
              <div className="text-2xl mb-2">🔬</div>
              <h4 className="font-bold text-lg text-gray-900">Testerzy (Goście)</h4>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Zwykli ludzie i użytkownicy testujący innowacje w praktyce. Nie potrzebują konta ani panelu – korzystają z rozwiązań i przekazują bezpośredni feedback.
              </p>
              <Link
                href="/innovations?tab=testing"
                className="mt-3 inline-block text-xs font-bold text-indigo-600 hover:underline"
              >
                Innowacje do testowania →
              </Link>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-gray-200 shadow-sm">
              <div className="text-2xl mb-2">🛡️</div>
              <h4 className="font-bold text-lg text-gray-900">Administratorzy (ROPS)</h4>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Mają pełny wgląd (widzą DOSŁOWNIE WSZYSTKO): taski, postęp wdrożeń, feedbacki, statystyki niezaspokojonych potrzeb i przypisują wykonawców w dedykowanym CMS.
              </p>
              <Link
                href="/panel"
                className="mt-3 inline-block text-xs font-bold text-indigo-600 hover:underline"
              >
                Przejdź do panelu ROPS →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}