import InnovationDetails from '@/app/components/InnovationDetails'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata() {
  return {
    title: 'Szczegóły innowacji',
    description: 'Szczegóły innowacji, oceny i komentarze społeczności.',
  }
}

export default async function InnovationDetailsPage({ params }: PageProps) {
  const { slug } = await params
  return <InnovationDetails slug={slug} />
}
