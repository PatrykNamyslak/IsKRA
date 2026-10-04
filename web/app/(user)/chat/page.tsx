import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getConversation } from '@/lib/chat-conversation'
import { ChatError, chatRequest, listChats, parsePositiveInteger } from '@/lib/chats'
import ChatList from './ChatList'
import Conversation from './Conversation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function Home({ searchParams }: {
  searchParams: Promise<{ page?: string; id?: string }>
}) {
  let req
  try {
    req = await chatRequest(await headers())
  } catch (error) {
    if (error instanceof ChatError && error.status === 401) redirect('/panel')
    throw error
  }
  const params = await searchParams
  if (params.id !== undefined) {
    let conversation
    try {
      const id = parsePositiveInteger(params.id)
      conversation = await getConversation(req, id)
    } catch (error) {
      if (error instanceof ChatError && [400, 404].includes(error.status)) notFound()
      throw error
    }
    return <Conversation key={conversation.id} initial={conversation} />
  }
  const page = parsePositiveInteger(params.page ?? null, 1)
  return <ChatList data={await listChats(req, page)} />
}
