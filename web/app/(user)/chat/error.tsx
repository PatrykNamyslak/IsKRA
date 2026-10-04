'use client'

export default function ChatListError({ reset }: { reset: () => void }) {
  return <div className="container mx-auto p-6" role="alert">
    <p>Nie udało się pobrać rozmów. Spróbuj ponownie.</p>
    <button type="button" onClick={reset} className="mt-4 rounded-2xl bg-white/60 p-3">Spróbuj ponownie</button>
  </div>
}
