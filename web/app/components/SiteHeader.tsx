import Link from "next/link";
import { Sparkles, User } from "lucide-react";

type SiteHeaderProps = {
  audience?: "user" | "organizer" | "research";
};

export default function SiteHeader({ audience }: SiteHeaderProps) {
  const isOrganizer = audience === "organizer";

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4 md:px-10 flex justify-between items-center bg-[#f5f5f7]/80 backdrop-blur-md border-b border-black/[0.04] transition-all">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        {/* Brand Logo from landing-2 */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-sm border border-gray-700/50 flex items-center justify-center text-white transition-transform group-hover:scale-105">
            <Sparkles className="w-4 h-4 text-[#e58500]" />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-semibold text-gray-900 tracking-tight leading-none text-base">
              IsKRA
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-gray-200 text-gray-500 leading-none">
              ROPS
            </span>
          </div>
        </Link>

        {/* Navigation Menu from landing-2 */}
        <div className="flex items-center gap-5 sm:gap-6">
          <Link
            href="/innovations"
            className="text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Baza pomysłów
          </Link>

          <Link
            href="/form"
            className="text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Zgłoś pomysł
          </Link>

          {/* User Profile / Panel dropdown / button */}
          <details className="group relative">
            <summary className="cursor-pointer list-none flex items-center justify-center w-8 h-8 rounded-full bg-white/70 border border-white hover:bg-white transition-all shadow-2xs text-gray-600 hover:text-gray-900 focus:outline-none">
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
