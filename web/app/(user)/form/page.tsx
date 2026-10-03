import InnovationCreator from '@/app/components/InnovationCreator'

export const metadata = {
  title: 'Kreator Innowacji | ROPS',
  description: 'Zgłoś potrzebę, zaoferuj innowację lub opublikuj pomysł na giełdzie projektów.',
}

export default function PageForm() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <InnovationCreator />
    </div>
  )
}
