import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";

type SiteHeaderProps = {
  audience?: "user" | "organizer" | "research";
};

export default function SiteHeader({ audience }: SiteHeaderProps) {
  const isOrganizer = audience === "organizer";

  return (
    <header className="sticky top-3 sm:top-4 z-50 w-full px-4 sm:px-6 pointer-events-none transition-all">
      <div className="mx-auto flex w-full max-w-4xl sm:max-w-5xl items-center justify-between rounded-full bg-white/50 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] px-5 sm:px-6 py-2 pointer-events-auto transition-all">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/iskra.svg"
            alt="IsKRA"
            width={26}
            height={29}
            className="w-6.5 h-auto transition-transform group-hover:scale-110"
            priority
          />
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-semibold text-gray-900 tracking-tight leading-none text-base">
              IsKRA
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-gray-200 text-gray-500 leading-none">
              ROPS
            </span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <div className="flex items-center gap-5 sm:gap-6">
          <Link
            href="/innovations"
            className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Baza pomysłów
          </Link>

          <Link
            href="/form"
            className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Zgłoś pomysł
          </Link>

          {/* User Profile / Panel dropdown / button */}
          <details className="group relative">
            <summary className="cursor-pointer list-none flex items-center justify-center w-8 h-8 rounded-full bg-white/80 border border-white hover:bg-white transition-all shadow-2xs text-gray-600 hover:text-gray-900 focus:outline-none">
              <User className="w-4 h-4" />
            </summary>
            <div className="absolute right-0 top-full mt-2 flex min-w-44 flex-col rounded-2xl border border-white/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl z-50 text-xs">
              <Link
                href="/panel"
                className="rounded-xl px-3 py-2 font-medium text-gray-800 hover:bg-gray-100 flex items-center gap-2 transition-colors"
              >
                🛡️ Panel ROPS
              </Link>
              <Link
                href="/login/organizer"
                className="rounded-xl px-3 py-2 text-gray-600 hover:bg-gray-100 flex items-center gap-2 transition-colors"
              >
                🏢 Logowanie organizacji
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
