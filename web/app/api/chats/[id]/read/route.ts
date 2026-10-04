import { ChatError, chatRequest, markChatsRead, parsePositiveInteger } from '@/lib/chats'
import { chatFailure, chatJSON, requireSameOrigin } from '@/lib/chat-http'

export const runtime = 'nodejs'
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request)
    const req = await chatRequest(request.headers)
    const id = parsePositiveInteger((await params).id)
    let messageIDs: number[] | undefined
    if (request.headers.get('content-type')?.split(';')[0].trim() === 'application/json') {
      let body: unknown
      // ChatView marks only the messages it fetched, so a newly arriving
      // message or unloaded older history never becomes read automatically.
      const text = await request.text()
      if (text.length > 4096) throw new ChatError(400, 'Żądanie jest zbyt duże.')
      try { body = JSON.parse(text) } catch { throw new ChatError(400, 'Nieprawidłowy JSON.') }
      if (!body || typeof body !== 'object' || !('messageIDs' in body) ||
        !Array.isArray(body.messageIDs) || body.messageIDs.length > 100 ||
        body.messageIDs.some((value: unknown) => typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0 || value > 2147483647)) {
        throw new ChatError(400, 'Nieprawidłowa lista wiadomości.')
      }
      messageIDs = body.messageIDs
    }
    return chatJSON({ marked: await markChatsRead(req, id, messageIDs) })
  } catch (error) { return chatFailure(error) }
}
