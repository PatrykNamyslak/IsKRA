import InnovationsExplorer from '@/app/components/InnovationsExplorer'

export const metadata = {
  title: 'Baza pomysłów i innowacji',
  description: 'Przeglądaj innowacje społeczne, giełdę pomysłów do zrealizowania oraz projekty do testowania.',
}

export default function PageInnovations() {
  return (
    <div className="min-h-screen bg-transparent pb-16">
      <InnovationsExplorer /> 
    </div>
  )
}
