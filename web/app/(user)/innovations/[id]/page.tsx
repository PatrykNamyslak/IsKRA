import InnovationDetails from '@/app/components/InnovationDetails'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  return {
    title: `Szczegóły innowacji ${id} | ROPS`,
    description: 'Szczegóły innowacji, oceny i komentarze społeczności.',
  }
}

export default async function InnovationDetailsPage({ params }: PageProps) {
  const { id } = await params
  return <InnovationDetails innovationId={id} />
}
