import HomePageView from '@/app/components/HomePageView'

export const metadata = {
  title: 'IsKRA / INNO-MOST | System Matchmakingu i Kreator Innowacji ROPS',
  description: 'Zgłaszaj potrzeby, weryfikuj istniejące rozwiązania z pomocą AI i twórz innowacje społeczne.',
}

export default function Home() {
  return (
    <div className="h-[calc(100dvh-65px)] max-h-[100dvh] overflow-hidden">
      <HomePageView />
    </div>
  )
}