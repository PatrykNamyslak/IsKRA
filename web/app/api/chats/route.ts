import { chatRequest, listChats, parsePositiveInteger } from '@/lib/chats'
import { chatFailure, chatJSON } from '@/lib/chat-http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const req = await chatRequest(request.headers)
    const page = parsePositiveInteger(new URL(request.url).searchParams.get('page'), 1)
    return chatJSON(await listChats(req, page))
  } catch (error) { return chatFailure(error) }
}
