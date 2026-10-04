import { chatRequest, markChatsRead } from '@/lib/chats'
import { chatFailure, chatJSON, requireSameOrigin } from '@/lib/chat-http'

export const runtime = 'nodejs'
export async function POST(request: Request) {
  try {
    requireSameOrigin(request)
    const req = await chatRequest(request.headers)
    return chatJSON({ marked: await markChatsRead(req) })
  } catch (error) { return chatFailure(error) }
}
