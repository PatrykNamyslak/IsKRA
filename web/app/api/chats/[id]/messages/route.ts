import { ChatError, chatRequest, parsePositiveInteger } from '@/lib/chats'
import { getConversation, sendConversationMessage } from '@/lib/chat-conversation'
import { chatFailure, chatJSON, requireSameOrigin } from '@/lib/chat-http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Context) {
  try {
    const req = await chatRequest(request.headers)
    const id = parsePositiveInteger((await params).id)
    const before = new URL(request.url).searchParams.get('before')
    return chatJSON(await getConversation(req, id, before === null ? undefined : parsePositiveInteger(before)))
  } catch (error) { return chatFailure(error) }
}

export async function POST(request: Request, { params }: Context) {
  try {
    requireSameOrigin(request)
    const req = await chatRequest(request.headers)
    const id = parsePositiveInteger((await params).id)
    const text = await request.text()
    if (text.length > 65536) throw new ChatError(400, 'Wiadomość jest zbyt długa.')
    let body: unknown
    try { body = JSON.parse(text) } catch { throw new ChatError(400, 'Nieprawidłowa treść żądania.') }
    if (!body || typeof body !== 'object' || !('content' in body)) throw new ChatError(400, 'Wpisz treść wiadomości.')
    return chatJSON({ message: await sendConversationMessage(req, id, body.content) }, 201)
  } catch (error) { return chatFailure(error) }
}
