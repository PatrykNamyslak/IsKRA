'use client'

import { DefaultEditView, useAuth, useConfig, useDocumentInfo } from '@payloadcms/ui'
import type { DocumentViewClientProps, PaginatedDocs } from 'payload'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import type { ChatMessage, TesterChat, User } from '@/payload-types'
import './ChatView.css'

type Participant = TesterChat['user'] | undefined | null

function getID(value: Participant): number | undefined {
  return typeof value === 'number' ? value : value?.id
}

function participantName(value: Participant, fallback: string): string {
  if (typeof value === 'object' && value !== null) {
    return value.name?.trim() || value.email || fallback
  }
  return value == null ? fallback : `${fallback} #${value}`
}

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric', month: 'long', year: 'numeric',
})
const timeFormatter = new Intl.DateTimeFormat('pl-PL', {
  hour: '2-digit', minute: '2-digit',
})

function formatDate(value: string, time = false): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Nieznana data' : (time ? timeFormatter : dateFormatter).format(date)
}

async function readResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const message = body?.errors?.[0]?.message
    throw new Error(typeof message === 'string' ? message : (
      response.status === 403 || response.status === 401
        ? 'Nie masz uprawnień do tej operacji.'
        : 'Nie udało się połączyć z serwerem. Spróbuj ponownie.'
    ))
  }
  if (!body) throw new Error('Serwer zwrócił nieprawidłową odpowiedź.')
  return body as T
}

async function fetchMessages(api: string, id: number, page: number, signal: AbortSignal) {
  const query = new URLSearchParams({
    'where[conversation][equals]': String(id),
    sort: '-createdAt,-id', depth: '1', limit: '50', page: String(page),
  })
  const response = await fetch(`${api}/chat_messages?${query}`, {
    credentials: 'include', cache: 'no-store', signal,
  })
  return readResponse<PaginatedDocs<ChatMessage>>(response)
}

const secondaryButton = 'chat:cursor-pointer chat:rounded-xl chat:border chat:border-solid chat:border-[var(--theme-elevation-150)] chat:bg-[var(--theme-elevation-0)] chat:px-4 chat:py-2.5 chat:text-sm chat:font-medium chat:text-[var(--theme-text)] chat:transition chat:hover:bg-[var(--theme-elevation-100)] chat:focus-visible:outline-2 chat:focus-visible:outline-offset-2 chat:focus-visible:outline-emerald-500 chat:disabled:cursor-wait chat:disabled:opacity-50'

function ParticipantCard({ value, label, organization = false }: {
  value: Participant; label: string; organization?: boolean
}) {
  const name = participantName(value, label)
  return (
    <div className="chat:flex chat:min-w-0 chat:items-center chat:gap-3">
      <div aria-hidden="true" className={`chat:flex chat:size-11 chat:shrink-0 chat:items-center chat:justify-center chat:rounded-2xl chat:text-base chat:font-semibold ${organization ? 'chat:bg-emerald-500/15 chat:text-emerald-600' : 'chat:bg-sky-500/15 chat:text-sky-600'}`}>
        {name.slice(0, 1).toLocaleUpperCase('pl-PL')}
      </div>
      <div className="chat:min-w-0">
        <p className="chat:m-0 chat:text-xs chat:text-[var(--theme-elevation-500)]">{label}</p>
        <p className="chat:m-0 chat:truncate chat:text-sm chat:font-semibold" title={name}>{name}</p>
      </div>
    </div>
  )
}

function ConversationChat({ conversation }: { conversation: TesterChat }) {
  const { config } = useConfig()
  const { user, permissions } = useAuth<User>()
  const api = `${config.serverURL || ''}${config.routes.api}`.replace(/\/$/, '')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [total, setTotal] = useState(0)
  const [nextPage, setNextPage] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [sending, setSending] = useState(false)
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const controllerRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sendingRef = useRef(false)
  const participantIDs = [getID(conversation.user), getID(conversation.organization)]
  const isParticipant = user != null && participantIDs.some((id) => id != null && id === user.id)
  const isAdmin = user?.role === 'admin'
  const canSend = (isParticipant || isAdmin) && permissions?.collections?.chat_messages?.create === true
  const lastMessageID = messages.at(-1)?.id

  useEffect(() => {
    const controller = new AbortController()
    controllerRef.current = controller
    fetchMessages(api, conversation.id, 1, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setMessages([...result.docs].reverse())
        setTotal(result.totalDocs)
        setNextPage(result.nextPage ?? null)
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Nie udało się pobrać wiadomości.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [api, conversation.id])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [lastMessageID])

  async function loadHistory(older = false) {
    const signal = controllerRef.current?.signal
    if (!signal || signal.aborted || loading || loadingOlder || sending) return
    setError(null)
    if (older) setLoadingOlder(true)
    else setLoading(true)
    const previousHeight = scrollRef.current?.scrollHeight ?? 0
    const previousTop = scrollRef.current?.scrollTop ?? 0
    try {
      const result = await fetchMessages(api, conversation.id, older ? nextPage ?? 1 : 1, signal)
      if (signal.aborted) return
      const incoming = [...result.docs].reverse()
      setMessages((previous) => older
        ? [...incoming.filter((message) => !previous.some((existing) => existing.id === message.id)), ...previous]
        : incoming)
      setTotal(result.totalDocs)
      setNextPage(result.nextPage ?? null)
      if (older) requestAnimationFrame(() => {
        if (!signal.aborted && scrollRef.current) {
          scrollRef.current.scrollTop = previousTop + scrollRef.current.scrollHeight - previousHeight
        }
      })
    } catch (err) {
      if (!signal.aborted) setError(err instanceof Error ? err.message : 'Nie udało się pobrać wiadomości.')
    } finally {
      if (!signal.aborted) {
        setLoading(false)
        setLoadingOlder(false)
      }
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = content.trim()
    const signal = controllerRef.current?.signal
    if (!text || !canSend || !user || sendingRef.current || !signal || signal.aborted) return
    sendingRef.current = true
    setSending(true)
    setError(null)
    setNotice('')
    try {
      const response = await fetch(`${api}/chat_messages?depth=1`, {
        method: 'POST', credentials: 'include', signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation: conversation.id, sender: user.id, content: text }),
      })
      const result = await readResponse<{ doc: ChatMessage }>(response)
      if (signal.aborted) return
      setMessages((previous) => [...previous, result.doc])
      setTotal((previous) => previous + 1)
      setContent('')
      setNotice('Wiadomość została wysłana.')
    } catch (err) {
      if (!signal.aborted) setError(err instanceof Error ? err.message : 'Nie udało się wysłać wiadomości.')
    } finally {
      sendingRef.current = false
      if (!signal.aborted) setSending(false)
    }
  }

  return (
    <section aria-labelledby="chat-heading" className="chat-view chat:mx-auto chat:w-full chat:max-w-6xl chat:px-4 chat:py-6 chat:font-sans chat:text-[var(--theme-text)] chat:md:px-8">
      <header className="chat:mb-6 chat:flex chat:flex-wrap chat:items-center chat:justify-between chat:gap-4">
        <div>
          <p className="chat:m-0 chat:mb-1 chat:text-xs chat:font-semibold chat:tracking-widest chat:text-emerald-600 chat:uppercase">Chat testerów</p>
          <h1 id="chat-heading" className="chat:m-0 chat:text-2xl chat:font-semibold chat:tracking-tight">Rozmowa #{conversation.id}</h1>
          <p className="chat:m-0 chat:mt-2 chat:text-sm chat:text-[var(--theme-elevation-500)]">Historia kontaktu użytkownika z organizacją</p>
        </div>
        <button type="button" onClick={() => void loadHistory()} disabled={loading || loadingOlder || sending} className={secondaryButton}>
          {loading ? 'Ładowanie…' : 'Odśwież rozmowę'}
        </button>
      </header>

      <div className="chat:overflow-hidden chat:rounded-2xl chat:border chat:border-solid chat:border-[var(--theme-elevation-150)] chat:bg-[var(--theme-elevation-0)] chat:shadow-sm">
        <div className="chat:grid chat:gap-5 chat:border-0 chat:border-b chat:border-solid chat:border-[var(--theme-elevation-150)] chat:p-5 chat:sm:grid-cols-2 chat:md:p-6">
          <ParticipantCard value={conversation.user} label="Użytkownik" />
          <ParticipantCard value={conversation.organization} label="Organizacja" organization />
        </div>
        <div className="chat:flex chat:items-center chat:justify-between chat:gap-3 chat:px-5 chat:py-3 chat:text-xs chat:text-[var(--theme-elevation-500)] chat:md:px-6">
          <span>{loading ? 'Pobieranie historii…' : `Wyświetlono ${messages.length} z ${total} wiadomości`}</span>
          <span className="chat:rounded-full chat:bg-[var(--theme-elevation-100)] chat:px-3 chat:py-1">{canSend ? 'Możesz odpowiedzieć' : 'Podgląd rozmowy'}</span>
        </div>
        {error && <div role="alert" className="chat:mx-5 chat:mb-3 chat:rounded-xl chat:border chat:border-solid chat:border-red-500/25 chat:bg-red-500/10 chat:p-3 chat:text-sm chat:text-red-600">{error}</div>}

        <div ref={scrollRef} aria-label="Historia wiadomości" aria-busy={loading || loadingOlder} className="chat:h-[min(58vh,640px)] chat:min-h-72 chat:overflow-y-auto chat:overscroll-contain chat:bg-[var(--theme-elevation-50)] chat:px-4 chat:py-6 chat:md:px-6">
          {nextPage && !loading && <div className="chat:mb-6 chat:text-center">
            <button type="button" onClick={() => void loadHistory(true)} disabled={loadingOlder || sending} className={secondaryButton}>
              {loadingOlder ? 'Ładowanie…' : 'Pokaż starsze wiadomości'}
            </button>
          </div>}
          {loading && messages.length === 0 ? <div role="status" className="chat:flex chat:h-full chat:items-center chat:justify-center chat:text-sm chat:text-[var(--theme-elevation-500)]">Ładowanie wiadomości…</div>
            : messages.length === 0 ? <div className="chat:flex chat:h-full chat:flex-col chat:items-center chat:justify-center chat:gap-2 chat:text-center">
              <span aria-hidden="true" className="chat:mb-2 chat:flex chat:size-14 chat:items-center chat:justify-center chat:rounded-2xl chat:bg-emerald-500/10 chat:text-2xl chat:text-emerald-600">↔</span>
              <p className="chat:m-0 chat:font-semibold">{error ? 'Historia jest niedostępna' : 'Tutaj zaczyna się rozmowa'}</p>
              <p className="chat:m-0 chat:max-w-xs chat:text-sm chat:text-[var(--theme-elevation-500)]">{error ? 'Użyj przycisku odświeżania, aby spróbować ponownie.' : 'Wiadomości użytkownika i organizacji pojawią się w tym miejscu.'}</p>
            </div> : <ol aria-label="Wiadomości" className="chat:m-0 chat:list-none chat:space-y-5 chat:p-0">
              {messages.map((message, index) => {
                const senderID = getID(message.sender)
                const organization = senderID != null && senderID === getID(conversation.organization)
                const administrator = (typeof message.sender === 'object' && message.sender?.role === 'admin')
                  || (isAdmin && senderID === user?.id)
                const senderRole = administrator ? 'Administrator' : organization ? 'Organizacja'
                  : senderID === getID(conversation.user) ? 'Użytkownik' : 'Nadawca'
                const sender = participantName(message.sender, senderRole)
                const alignRight = organization || administrator
                const day = formatDate(message.createdAt)
                const showDate = index === 0 || day !== formatDate(messages[index - 1].createdAt)
                return <li key={message.id}>
                  {showDate && <div className="chat:mb-5 chat:text-center chat:text-xs chat:text-[var(--theme-elevation-500)]">{day}</div>}
                  <div className={`chat:flex ${alignRight ? 'chat:justify-end' : 'chat:justify-start'}`}>
                    <div className="chat:max-w-[88%] chat:sm:max-w-[75%] chat:lg:max-w-[65%]">
                      <p className={`chat:m-0 chat:mb-1.5 chat:text-xs chat:font-medium chat:text-[var(--theme-elevation-500)] ${alignRight ? 'chat:text-right' : ''}`}>{sender} · {senderRole}</p>
                      <div className={`chat:rounded-2xl chat:px-4 chat:py-3 chat:text-sm chat:leading-relaxed chat:shadow-sm ${administrator ? 'chat:rounded-tr-sm chat:bg-violet-600 chat:text-white' : organization ? 'chat:rounded-tr-sm chat:bg-emerald-600 chat:text-white' : 'chat:rounded-tl-sm chat:border chat:border-solid chat:border-[var(--theme-elevation-150)] chat:bg-[var(--theme-elevation-0)]'}`}>
                        <p className="chat:m-0 chat:whitespace-pre-wrap chat:wrap-anywhere">{message.content}</p>
                        <time dateTime={message.createdAt} title={`${day}, ${formatDate(message.createdAt, true)}`} className={`chat:mt-2 chat:block chat:text-right chat:text-[11px] ${administrator ? 'chat:text-violet-100' : organization ? 'chat:text-emerald-100' : 'chat:text-[var(--theme-elevation-500)]'}`}>{formatDate(message.createdAt, true)}</time>
                      </div>
                    </div>
                  </div>
                </li>
              })}
            </ol>}
        </div>

        <footer className="chat:border-0 chat:border-t chat:border-solid chat:border-[var(--theme-elevation-150)] chat:p-5 chat:md:p-6">
          {canSend ? <form onSubmit={sendMessage} className="chat:flex chat:flex-col chat:gap-3">
            <label htmlFor={`chat-message-${conversation.id}`} className="chat:text-sm chat:font-medium">Twoja wiadomość</label>
            <textarea id={`chat-message-${conversation.id}`} value={content} onChange={(event) => setContent(event.target.value)} disabled={sending || loading} rows={3} placeholder="Napisz wiadomość…" required className="chat:box-border chat:w-full chat:resize-y chat:rounded-xl chat:border chat:border-solid chat:border-[var(--theme-elevation-150)] chat:bg-[var(--theme-elevation-50)] chat:p-3 chat:text-sm chat:text-[var(--theme-text)] chat:focus:border-emerald-500 chat:focus:outline-2 chat:focus:outline-emerald-500/20 chat:disabled:opacity-50" />
            <div className="chat:flex chat:flex-wrap chat:items-center chat:justify-between chat:gap-3">
              <p className="chat:m-0 chat:text-xs chat:text-[var(--theme-elevation-500)]">Wysyłasz jako {participantName(user, 'Uczestnik')}{isAdmin ? ' (administrator)' : ''}.</p>
              <button type="submit" disabled={!content.trim() || sending || loading || loadingOlder} className="chat:cursor-pointer chat:rounded-xl chat:border-0 chat:bg-emerald-600 chat:px-5 chat:py-2.5 chat:text-sm chat:font-semibold chat:text-white chat:transition chat:hover:bg-emerald-700 chat:focus-visible:outline-2 chat:focus-visible:outline-offset-2 chat:focus-visible:outline-emerald-500 chat:disabled:cursor-not-allowed chat:disabled:opacity-50">{sending ? 'Wysyłanie…' : 'Wyślij wiadomość'}</button>
            </div>
          </form> : <p className="chat:m-0 chat:text-sm chat:text-[var(--theme-elevation-500)]">{isParticipant || isAdmin ? 'Nie masz uprawnień do wysyłania wiadomości.' : 'Podgląd historii. Wiadomości mogą wysyłać uczestnicy rozmowy i administratorzy.'}</p>}
          <p role="status" className="chat:m-0 chat:mt-2 chat:text-xs chat:text-emerald-600">{notice}</p>
        </footer>
      </div>
    </section>
  )
}

export default function ChatView(props: DocumentViewClientProps) {
  const { id, data, isInitializing } = useDocumentInfo()
  if (id == null) return <DefaultEditView {...props} />
  if (isInitializing || !data) return <p role="status">Ładowanie rozmowy…</p>
  return <ConversationChat key={String(id)} conversation={data as TesterChat} />
}
