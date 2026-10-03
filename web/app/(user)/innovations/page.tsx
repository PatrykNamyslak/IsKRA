import InnovationsExplorer from '@/app/components/InnovationsExplorer'

export const metadata = {
  title: 'Katalog Innowacji & Giełda Pomysłów | ROPS',
  description: 'Przeglądaj innowacje społeczne, giełdę pomysłów do zrealizowania oraz projekty do testowania.',
}

export default function PageInnovations() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <InnovationsExplorer />
    </div>
  )
}
