'use client'

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { Avatar, Dropdown } from "@heroui/react";

type SiteHeaderProps = {
  audience?: "user" | "organizer" | "research";
};

export default function SiteHeader({ audience }: SiteHeaderProps) {
  const router = useRouter();
  const isOrganizer = audience === "organizer";

  return (
    <header className="sticky top-3 sm:top-4 z-50 w-full px-4 sm:px-6 pointer-events-none transition-all">
      <div className="mx-auto flex w-full max-w-4xl sm:max-w-5xl items-center justify-between rounded-full bg-white/50 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] px-5 sm:px-6 py-3 sm:py-3.5 pointer-events-auto transition-all">
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

          {/* User Profile Avatar with HeroUI Dropdown */}
          <Dropdown>
            <Dropdown.Trigger>
              <button
                type="button"
                className="cursor-pointer focus:outline-none rounded-full transition-transform active:scale-95 flex items-center justify-center"
                aria-label="Menu profilu użytkownika"
              >
                <Avatar
                  className="w-8 h-8 rounded-full border border-white/90 shadow-2xs bg-gradient-to-br from-amber-50 to-orange-100 text-gray-700 flex items-center justify-center cursor-pointer hover:border-[#e58500]/50 transition-all"
                >
                  <Avatar.Fallback className="flex items-center justify-center w-full h-full">
                    <User className="w-4 h-4 text-gray-700" />
                  </Avatar.Fallback>
                </Avatar>
              </button>
            </Dropdown.Trigger>

            <Dropdown.Popover className="rounded-2xl border border-white/80 bg-white/95 shadow-xl backdrop-blur-xl p-1.5 min-w-44 z-50 text-xs">
              <Dropdown.Menu
                aria-label="Opcje konta"
                onAction={(key) => {
                  if (key === 'panel') router.push('/panel');
                  if (key === 'organizer') router.push('/login/organizer');
                }}
              >
                <Dropdown.Item
                  id="panel"
                  className="rounded-xl px-3 py-2 font-medium text-gray-800 hover:bg-gray-100 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  🛡️ Panel ROPS
                </Dropdown.Item>
                <Dropdown.Item
                  id="organizer"
                  className="rounded-xl px-3 py-2 text-gray-600 hover:bg-gray-100 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  🏢 Logowanie organizacji
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
