'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { ArrowLongRightIcon, ArrowPathIcon, DocumentCheckIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import type { ChatListResult } from '@/lib/chat-types'

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Warsaw',
})
const buttonClass = 'flex flex-row items-center gap-1 p-2 rounded-2xl hover:bg-mist-300/50 disabled:opacity-50 disabled:cursor-wait'

export default function ChatList({ data }: { data: ChatListResult }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const mutation = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  function refresh() {
    setError(null)
    setNotice('')
    startTransition(() => router.refresh())
  }

  function markRead(id?: number) {
    if (mutation.current) return
    mutation.current = true
    setError(null)
    setNotice('')
    startTransition(async () => {
      try {
        const response = await fetch(id === undefined ? '/api/chats/read-all' : `/api/chats/${id}/read`, {
          method: 'POST', credentials: 'same-origin', cache: 'no-store',
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Nie udało się oznaczyć rozmowy.')
        setNotice(id === undefined ? 'Rozmowy oznaczono jako przeczytane.' : 'Rozmowę oznaczono jako przeczytaną.')
        router.refresh()
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Nie udało się połączyć z serwerem.')
      } finally { mutation.current = false }
    })
  }

  return (
    <div className="w-full min-h-full p-4 flex flex-col gap-6 mt-4 container mx-auto" aria-busy={pending}>
      <div className="w-full p-4 rounded-4xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] flex flex-wrap gap-6">
        <button type="button" onClick={refresh} disabled={pending} className={buttonClass}>
          <ArrowPathIcon className={`size-5 ${pending ? 'animate-spin' : ''}`} /> Odśwież
        </button>
        <button type="button" onClick={() => markRead()} disabled={pending || data.totalDocs === 0} className={buttonClass}>
          <DocumentCheckIcon className="size-5" /> Oznacz wszystkie jako przeczytane
        </button>
      </div>
      {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}
      {notice && <p role="status" className="text-green-800">{notice}</p>}
      <div className="w-full p-6 rounded-4xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] flex flex-col gap-6">
        {data.docs.map((chat) => (
          <article key={chat.id} className="p-6 w-full border-b border-mist-300/50">
            <div className="flex flex-row gap-8 w-full items-center">
              <div className="flex flex-col gap-2 w-full min-w-0">
                <div className="flex flex-wrap justify-between items-center gap-2 w-full">
                  <h2 className="font-bold text-lg">{chat.to}</h2>
                  <div className="font-bold flex flex-row items-center gap-2">
                    {chat.last_message_date && <time dateTime={chat.last_message_date}>{dateFormatter.format(new Date(chat.last_message_date))}</time>}
                    {!chat.readed && <ExclamationCircleIcon className="size-6 text-red-500" title="Nieprzeczytane wiadomości" />}
                  </div>
                </div>
                <p className="whitespace-pre-wrap break-words">{chat.last_message || 'Brak wiadomości'}</p>
                {!chat.readed && <button type="button" onClick={() => markRead(chat.id)} disabled={pending} className={`${buttonClass} self-start text-sm`}>
                  <DocumentCheckIcon className="size-5" /> Oznacz jako przeczytaną
                </button>}
              </div>
              <Link href={`/chat/?id=${chat.id}`} aria-label={`Otwórz rozmowę: ${chat.to}`}>
                <ArrowLongRightIcon className="size-8 cursor-pointer" />
              </Link>
            </div>
          </article>
        ))}
        {!data.docs.length && <p className="font-light text-center text-mist-700">Brak rozmów.</p>}
        <nav aria-label="Strony rozmów" className="flex flex-wrap items-center justify-center gap-6">
          {data.hasPrevPage && <Link href={`/chat?page=${data.page - 1}`}>Poprzednia strona</Link>}
          {data.totalDocs > 0 && <span>Strona {data.page} z {data.totalPages}</span>}
          {data.hasNextPage ? <Link href={`/chat?page=${data.page + 1}`}>Następna strona</Link> :
            data.docs.length > 0 && <span className="font-light text-mist-700">I to już wszystko</span>}
        </nav>
      </div>
    </div>
  )
}
