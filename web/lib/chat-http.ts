import 'server-only'
import { NextResponse } from 'next/server'
import { APIError } from 'payload'
import { ChatError } from '@/lib/chats'

export function chatJSON(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie, Authorization' } })
}

export function chatFailure(error: unknown) {
  if (error instanceof ChatError) return chatJSON({ error: error.message }, error.status)
  if (error instanceof APIError && [400, 401, 403, 404].includes(error.status)) {
    const messages: Record<number, string> = {
      400: 'Sprawdź dane wiadomości i spróbuj ponownie.',
      401: 'Sesja wygasła. Zaloguj się ponownie.',
      403: 'Nie masz uprawnień do tej operacji.',
      404: 'Nie znaleziono rozmowy lub wiadomości.',
    }
    return chatJSON({ error: messages[error.status] }, error.status)
  }
  console.error('Błąd obsługi czatów:', error)
  return chatJSON({ error: 'Nie udało się obsłużyć rozmów. Spróbuj ponownie.' }, 500)
}

export function requireSameOrigin(request: Request) {
  const origin = new URL(process.env.APP_URL || request.url).origin
  if (request.headers.get('origin') !== origin || request.headers.get('sec-fetch-site') === 'cross-site') {
    throw new ChatError(403, 'Niedozwolone źródło żądania.')
  }
}
