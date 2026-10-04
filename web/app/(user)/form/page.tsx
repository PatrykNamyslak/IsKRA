import InnovationCreator from '@/app/components/InnovationCreator'

export const metadata = {
  title: 'Kreator innowacji',
  description: 'Zgłoś potrzebę, zaoferuj innowację lub opublikuj pomysł na giełdzie projektów.',
}

export default function PageForm() {
  return (
    <div className="min-h-screen bg-transparent pb-16">
      <InnovationCreator />
    </div>
  )
}
