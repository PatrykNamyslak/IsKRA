'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeftIcon, ArrowPathIcon, ChatBubbleLeftRightIcon, CheckIcon, ChevronUpIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import type { ConversationMessage, ConversationResult } from '@/lib/chat-types'

const glass = 'rounded-4xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)]'
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-2xl p-3 text-sm font-medium transition hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-600 disabled:cursor-wait disabled:opacity-50'
const dayFormatter = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Warsaw' })
const timeFormatter = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' })

async function responseData<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error || (response.status === 401 ? 'Sesja wygasła. Zaloguj się ponownie.' : 'Nie udało się połączyć z serwerem. Spróbuj ponownie.'))
  if (!data) throw new Error('Nie udało się odczytać odpowiedzi serwera.')
  return data as T
}

function mergeMessages(previous: ConversationMessage[], incoming: ConversationMessage[]) {
  const byID = new Map(previous.map((message) => [message.id, message]))
  for (const message of incoming) byID.set(message.id, message)
  return [...byID.values()].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id - b.id)
}

export default function Conversation({ initial }: { initial: ConversationResult }) {
  const [messages, setMessages] = useState(initial.messages)
  const [olderCursor, setOlderCursor] = useState(initial.olderCursor)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const busyRef = useRef(false)
  const sendingRef = useRef(false)
  const endpoint = `/api/chats/${initial.id}`

  async function markDisplayed(docs: ConversationMessage[], signal: AbortSignal) {
    const messageIDs = docs.filter((message) => !message.isOwn).map((message) => message.id)
    if (!messageIDs.length || signal.aborted) return
    await responseData(await fetch(`${endpoint}/read`, {
      method: 'POST', credentials: 'same-origin', cache: 'no-store', signal,
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageIDs }),
    }))
  }

  useEffect(() => {
    const controller = new AbortController()
    controllerRef.current = controller
    const messageIDs = initial.messages.filter((message) => !message.isOwn).map((message) => message.id)
    if (messageIDs.length) {
      fetch(`/api/chats/${initial.id}/read`, {
        method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageIDs }),
      }).then(responseData).catch((error: unknown) => {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Nie udało się oznaczyć wiadomości jako przeczytanych.')
      })
    }
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    return () => controller.abort()
  }, [initial.id, initial.messages])

  async function loadMessages(older = false) {
    const signal = controllerRef.current?.signal
    if (!signal || signal.aborted || busyRef.current || sendingRef.current || (older && olderCursor === null)) return
    busyRef.current = true
    setLoading(true)
    setError(null)
    setNotice('')
    const previousHeight = scrollRef.current?.scrollHeight ?? 0
    const previousTop = scrollRef.current?.scrollTop ?? 0
    try {
      const result = await responseData<ConversationResult>(await fetch(
        `${endpoint}/messages${older ? `?before=${olderCursor}` : ''}`,
        { credentials: 'same-origin', cache: 'no-store', signal },
      ))
      if (signal.aborted) return
      setMessages((previous) => older ? mergeMessages(previous, result.messages) : result.messages)
      setOlderCursor(result.olderCursor)
      requestAnimationFrame(() => {
        if (signal.aborted || !scrollRef.current) return
        scrollRef.current.scrollTop = older ? previousTop + scrollRef.current.scrollHeight - previousHeight : scrollRef.current.scrollHeight
      })
      await markDisplayed(result.messages, signal)
      if (!older) setNotice('Rozmowa została odświeżona.')
    } catch (error) {
      if (!signal.aborted) setError(error instanceof Error ? error.message : 'Nie udało się pobrać wiadomości.')
    } finally {
      busyRef.current = false
      if (!signal.aborted) setLoading(false)
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = draft.trim()
    const signal = controllerRef.current?.signal
    if (!content || !signal || signal.aborted || sendingRef.current || busyRef.current) return
    sendingRef.current = true
    setSending(true)
    setError(null)
    setNotice('')
    try {
      const result = await responseData<{ message: ConversationMessage }>(await fetch(`${endpoint}/messages`, {
        method: 'POST', credentials: 'same-origin', cache: 'no-store', signal,
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }),
      }))
      if (signal.aborted) return
      setMessages((previous) => mergeMessages(previous, [result.message]))
      setDraft('')
      setNotice('Wiadomość została wysłana.')
      requestAnimationFrame(() => {
        if (signal.aborted) return
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        textareaRef.current?.focus()
      })
    } catch (error) {
      if (!signal.aborted) setError(error instanceof Error ? error.message : 'Nie udało się wysłać wiadomości.')
    } finally {
      sendingRef.current = false
      if (!signal.aborted) setSending(false)
    }
  }

  return (
    <div className="container mx-auto mt-4 flex w-full max-w-6xl flex-col gap-6 p-4 pb-8 text-stone-800">
      <header className={`${glass} flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6`}>
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Link href="/chat" aria-label="Wróć do listy rozmów" className={`${buttonClass} shrink-0`}><ArrowLeftIcon className="size-5" /></Link>
          <div aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/90 bg-stone-200/70 text-lg font-semibold">
            {initial.title.trim().slice(0, 1).toLocaleUpperCase('pl-PL')}
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-xs text-stone-500">Twoja rozmowa</p>
            <h1 className="break-words text-lg font-bold sm:text-xl">{initial.title}</h1>
          </div>
        </div>
        <button type="button" onClick={() => loadMessages()} disabled={loading || sending} className={buttonClass}>
          <ArrowPathIcon className={`size-5 ${loading ? 'animate-spin' : ''}`} /> Odśwież
        </button>
      </header>

      <section aria-label={`Rozmowa z ${initial.title}`} className={`${glass} flex min-h-[32rem] flex-col overflow-hidden`}>
        <div ref={scrollRef} aria-busy={loading} className="h-[50vh] min-h-80 overflow-y-auto overscroll-contain px-4 py-6 sm:h-[55vh] sm:px-8">
          {olderCursor !== null && <div className="mb-6 flex justify-center">
            <button type="button" onClick={() => loadMessages(true)} disabled={loading || sending} className={`${buttonClass} border border-white/80 bg-white/50 text-stone-600`}>
              <ChevronUpIcon className="size-4" /> {loading ? 'Ładowanie…' : 'Wczytaj starsze wiadomości'}
            </button>
          </div>}
          {messages.length === 0 ? <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-3xl border border-white/90 bg-white/50"><ChatBubbleLeftRightIcon className="size-7 text-stone-500" /></div>
            <div><p className="font-semibold">Tutaj zaczyna się rozmowa</p><p className="mt-1 text-sm text-stone-500">Napisz pierwszą wiadomość do {initial.title}.</p></div>
          </div> : <ol aria-label="Wiadomości" className="flex flex-col gap-4">
            {messages.map((message, index) => {
              const day = dayFormatter.format(new Date(message.createdAt))
              const previousDay = index > 0 ? dayFormatter.format(new Date(messages[index - 1].createdAt)) : null
              return <li key={message.id}>
                {day !== previousDay && <div className="my-5 flex items-center justify-center gap-3"><span className="h-px w-12 bg-stone-300/40" /><span className="text-xs text-stone-500">{day}</span><span className="h-px w-12 bg-stone-300/40" /></div>}
                <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[90%] sm:max-w-[75%]">
                    <p className={`mb-1.5 px-2 text-xs font-medium text-stone-500 ${message.isOwn ? 'text-right' : ''}`}>{message.senderName}</p>
                    <div className={`rounded-3xl px-4 py-3 shadow-sm sm:px-5 ${message.isOwn ? 'rounded-br-md bg-stone-800 text-white' : 'rounded-bl-md border border-white/90 bg-white/80 text-stone-800'}`}>
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed sm:text-base">{message.content}</p>
                      <div className={`mt-2 flex items-center justify-end gap-1.5 text-[11px] ${message.isOwn ? 'text-stone-300' : 'text-stone-500'}`}>
                        <time dateTime={message.createdAt} title={day}>{timeFormatter.format(new Date(message.createdAt))}</time>
                        {message.isOwn && <CheckIcon className={`size-3.5 ${message.readByOther ? 'text-emerald-300' : ''}`} title={message.readByOther ? 'Przeczytano' : 'Wysłano'} />}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            })}
          </ol>}
        </div>

        <footer className="border-t border-white/80 bg-white/30 p-4 sm:p-6">
          {error && <p role="alert" className="mb-4 rounded-2xl border border-red-200/70 bg-red-50/80 p-3 text-sm text-red-700">{error}</p>}
          <form onSubmit={sendMessage} className="flex flex-col gap-3">
            <div className="flex items-end gap-3 rounded-3xl border border-white/90 bg-white/75 p-3 focus-within:ring-2 focus-within:ring-stone-400/40 sm:p-4">
              <label htmlFor="chat-message" className="sr-only">Twoja wiadomość</label>
              <textarea ref={textareaRef} id="chat-message" value={draft} onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault()
                    event.currentTarget.form?.requestSubmit()
                  }
                }}
                rows={2} maxLength={10000} required disabled={sending} placeholder="Napisz wiadomość…"
                className="min-h-14 w-full resize-none bg-transparent p-1 text-sm leading-relaxed outline-none placeholder:text-stone-400 disabled:opacity-60 sm:text-base" />
              <button type="submit" disabled={!draft.trim() || sending || loading} aria-label={sending ? 'Wysyłanie wiadomości' : 'Wyślij wiadomość'}
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-stone-800 px-4 py-3 font-medium text-white transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-600 disabled:cursor-not-allowed disabled:opacity-40">
                {sending ? <ArrowPathIcon className="size-5 animate-spin" /> : <PaperAirplaneIcon className="size-5" />}
                <span className="hidden text-sm sm:inline">{sending ? 'Wysyłanie…' : 'Wyślij'}</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-stone-500">
              <p>Enter — wyślij · Shift + Enter — nowa linia</p>
              <span>{draft.length.toLocaleString('pl-PL')} / 10 000</span>
            </div>
          </form>
          <p role="status" className="sr-only">{notice}</p>
        </footer>
      </section>
    </div>
  )
}
