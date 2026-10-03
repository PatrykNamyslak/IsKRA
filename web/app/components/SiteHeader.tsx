import Link from "next/link";

type SiteHeaderProps = {
    audience: "user" | "organizer";
};

export default function SiteHeader({ audience }: SiteHeaderProps) {
    const isOrganizer = audience === "organizer";

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
            <nav
                aria-label="Nawigacja główna"
                className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
                <Link
                    href="/"
                    aria-label="Przejdź do strony głównej"
                    className="flex h-12 w-32 shrink-0 items-center sm:w-40">
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 160 48"
                        className="h-12 w-32 sm:w-40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="4" width="40" height="40" rx="14" fill="#312E81" />
                        <path
                            d="M13 27.5 21.5 18l8.5 9.5M21.5 18v16M13 34h17"
                            stroke="#A5F3FC"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <circle cx="34" cy="13" r="4" fill="#FBBF24" />
                        <text
                            x="50"
                            y="23"
                            fill="#1F2937"
                            fontFamily="Arial, sans-serif"
                            fontSize="15"
                            fontWeight="700"
                            letterSpacing="1">
                            INNO
                        </text>
                        <text
                            x="50"
                            y="37"
                            fill="#6B7280"
                            fontFamily="Arial, sans-serif"
                            fontSize="8"
                            fontWeight="600"
                            letterSpacing="1.4">
                            MOST
                        </text>
                    </svg>
                </Link>

                <div className="flex items-center justify-end gap-2 sm:gap-4">
                    {!isOrganizer && (
                        <Link
                            href="/form"
                            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:inline-flex">
                            Zgłoś potrzebę
                        </Link>
                    )}
                    <Link
                        href={isOrganizer ? "/organizer/innovations" : "/innovations"}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 sm:px-4">
                        Wszystkie innowacje
                    </Link>

                    {isOrganizer ? (
                        <Link
                            href="/"
                            className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 sm:px-4">
                            Wyloguj
                        </Link>
                    ) : (
                        <details className="group relative">
                            <summary className="cursor-pointer list-none rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100 sm:px-4">
                                Zaloguj się
                            </summary>
                            <div className="absolute right-0 top-full mt-2 flex min-w-48 flex-col rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                                <Link
                                    href="/login/organizer"
                                    className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    Jako organizacja
                                </Link>
                                <Link
                                    href="/login/tester"
                                    className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    Jako badacz
                                </Link>
                            </div>
                        </details>
                    )}
                </div>
            </nav>
        </header>
    );
}
