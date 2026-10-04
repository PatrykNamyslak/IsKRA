'use client'

import { useRef, useState, type FormEvent } from 'react'
import { Button } from '@heroui/react'
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Loader2,
    Plus,
} from 'lucide-react'

const inputClassName =
    'w-full rounded-2xl border border-black/[0.08] bg-white/70 ' +
    'backdrop-blur-sm px-4 py-3 text-base text-gray-900 shadow-2xs ' +
    'placeholder:text-gray-400 focus:border-brand focus:ring-4 ' +
    'focus:ring-brand/15 focus:bg-white focus:outline-none transition-all'

const labelClassName =
    'mb-1.5 block text-xs sm:text-sm font-bold text-gray-900'

const contactFields = [
    {
        name: 'name',
        label: 'Imię',
        type: 'text',
        placeholder: 'Jan',
        autoComplete: 'given-name',
    },
    {
        name: 'surname',
        label: 'Nazwisko',
        type: 'text',
        placeholder: 'Kowalski',
        autoComplete: 'family-name',
    },
    {
        name: 'email',
        label: 'Adres e-mail',
        type: 'email',
        placeholder: 'jan.kowalski@example.com',
        autoComplete: 'email',
    },
] as const

const descriptionFields = [
    {
        name: 'about',
        label: 'Opowiedz o sobie',
        placeholder:
            'Napisz kilka słów o sobie, swoim doświadczeniu i zainteresowaniach...',
    },
    {
        name: 'why',
        label: 'Dlaczego chcesz zostać testerem?',
        placeholder:
            'Co motywuje Cię do testowania innowacji i jakie doświadczenie możesz wnieść?',
    },
] as const

export default function WantToTestForm() {
    const submittingRef = useRef(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (submittingRef.current) return

        setErrorMessage(null)

        const formData = new FormData(event.currentTarget)
        const getText = (key: string) => {
            const value = formData.get(key)
            return typeof value === 'string' ? value.trim() : ''
        }

        const data = {
            name: getText('name'),
            surname: getText('surname'),
            email: getText('email'),
            about: getText('about'),
            why: getText('why'),
        }

        if (Object.values(data).some((value) => !value)) {
            setErrorMessage('Uzupełnij wszystkie wymagane pola.')
            return
        }

        submittingRef.current = true
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/want_to_test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error(
                    response.status === 400
                        ? 'Sprawdź poprawność danych i spróbuj ponownie.'
                        : 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę.',
                )
            }

            setIsSubmitted(true)
        } catch (error: unknown) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'Wystąpił błąd podczas wysyłania zgłoszenia.',
            )
        } finally {
            submittingRef.current = false
            setIsSubmitting(false)
        }
    }

    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
            <div className="mb-8 text-center">
                <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl">
                    Zostań <span className="text-brand">testerem innowacji</span>
                </h1>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
                    Pomóż nam sprawdzać nowe rozwiązania. Opowiedz o sobie
                    i zgłoś chęć udziału w testach.
                </p>
            </div>

            {isSubmitted ? (
                <div
                    role="status"
                    className="rounded-[2.5rem] border border-white/85 bg-white/65 p-8 text-center shadow-[0_16px_50px_-12px_rgba(0,0,0,0.08)] backdrop-blur-2xl sm:p-12"
                >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-600">
                        <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                    </div>

                    <h2 className="mt-5 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                        Dziękujemy za zgłoszenie!
                    </h2>
                    <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
                        Twoje zgłoszenie zostało zapisane i trafiło do zespołu ROPS.
                    </p>

                    <Button
                        type="button"
                        onPress={() => {
                            setIsSubmitted(false)
                            setErrorMessage(null)
                        }}
                        className="mt-8 h-auto cursor-pointer rounded-full border border-black/[0.08] bg-white/80 px-6 py-2.5 text-sm font-semibold text-gray-800 shadow-2xs transition-all hover:bg-white active:scale-95"
                    >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Dodaj kolejne zgłoszenie
                    </Button>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    aria-busy={isSubmitting}
                    className="rounded-[2.5rem] border border-white/80 bg-white/55 p-6 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.08)] backdrop-blur-2xl sm:p-10"
                >
                    <div className="mb-8 rounded-2xl border border-brand/25 bg-brand/10 p-4 sm:p-5">
                        <h2 className="text-sm font-bold text-gray-900 sm:text-base">
                            Dołącz do grona testerów
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
                            Wypełnij formularz, aby zgłosić swoją kandydaturę.
                            Wszystkie pola są wymagane.
                        </p>
                    </div>

                    {errorMessage && (
                        <div
                            role="alert"
                            className="mb-6 flex items-center gap-2.5 rounded-2xl border border-rose-300/60 bg-rose-50/80 p-4 text-sm text-rose-800"
                        >
                            <AlertCircle
                                className="h-4 w-4 shrink-0 text-rose-600"
                                aria-hidden="true"
                            />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <fieldset
                        disabled={isSubmitting}
                        className="m-0 min-w-0 space-y-6 border-0 p-0"
                    >
                        <legend className="sr-only">Dane kandydata na testera</legend>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {contactFields.map((field) => (
                                <div
                                    key={field.name}
                                    className={field.name === 'email' ? 'sm:col-span-2' : ''}
                                >
                                    <label
                                        htmlFor={`tester-${field.name}`}
                                        className={labelClassName}
                                    >
                                        {field.label} <span className="text-brand">*</span>
                                    </label>
                                    <input
                                        id={`tester-${field.name}`}
                                        name={field.name}
                                        type={field.type}
                                        autoComplete={field.autoComplete}
                                        placeholder={field.placeholder}
                                        required
                                        className={inputClassName}
                                    />
                                </div>
                            ))}
                        </div>

                        {descriptionFields.map((field) => (
                            <div key={field.name}>
                                <label
                                    htmlFor={`tester-${field.name}`}
                                    className={labelClassName}
                                >
                                    {field.label} <span className="text-brand">*</span>
                                </label>
                                <textarea
                                    id={`tester-${field.name}`}
                                    name={field.name}
                                    rows={4}
                                    required
                                    placeholder={field.placeholder}
                                    className={`${inputClassName} resize-y`}
                                />
                            </div>
                        ))}

                        <div className="flex flex-col items-center justify-between gap-4 border-t border-black/[0.06] pt-6 sm:flex-row">
                            <p className="text-center text-xs text-gray-500 sm:text-left">
                                Dane posłużą do kontaktu w sprawie udziału w testach.
                            </p>

                            <Button
                                type="submit"
                                isDisabled={isSubmitting}
                                className="flex h-auto w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-hover active:scale-95 disabled:opacity-50 sm:w-auto"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2
                                            className="h-4 w-4 animate-spin"
                                            aria-hidden="true"
                                        />
                                        Wysyłanie...
                                    </>
                                ) : (
                                    <>
                                        Wyślij zgłoszenie
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </fieldset>
                </form>
            )}
        </div>
    )
}