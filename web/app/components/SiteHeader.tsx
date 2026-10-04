'use client'

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
            <Dropdown.Trigger className="rounded-full focus:outline-none cursor-pointer transition-transform flex items-center justify-center p-0.5">
              <Avatar
                size="sm"
                className="transition-transform ring-2 ring-[#e58500] ring-offset-2 ring-offset-white cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
              >
                <Avatar.Image
                  src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                  alt="Avatar użytkownika"
                />
                <Avatar.Fallback className="bg-amber-100 text-amber-900 font-semibold text-xs flex items-center justify-center">
                  RO
                </Avatar.Fallback>
              </Avatar>
            </Dropdown.Trigger>

            <Dropdown.Popover
              placement="bottom end"
              offset={18}
              className="min-w-56 rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl shadow-xl p-1 z-[100] text-xs"
            >
              <Dropdown.Menu
                aria-label="Profile Actions"
                onAction={(key) => {
                  if (key === "panel") router.push("/panel");
                  if (key === "organizer") router.push("/login/organizer");
                }}
              >
                <Dropdown.Section>
                  <Dropdown.Item
                    id="profile"
                    className="h-auto py-2.5 px-3 flex flex-col items-start justify-center cursor-default pointer-events-none opacity-100 select-none border-b border-gray-100/80 mb-1"
                  >
                    <p className="text-[11px] font-normal text-gray-500 leading-none">
                      Zalogowano jako
                    </p>
                    <p className="text-xs font-semibold text-gray-900 leading-normal truncate w-full mt-1">
                      admin@rops.pl
                    </p>
                  </Dropdown.Item>
                </Dropdown.Section>

                <Dropdown.Section>
                  <Dropdown.Item
                    id="panel"
                    className="rounded-xl px-3 py-2 text-xs font-medium text-gray-800 hover:bg-gray-100/80 focus:bg-gray-100 flex items-center gap-2 cursor-pointer transition-colors outline-none"
                  >
                    <span className="text-sm">🛡️</span>
                    <span>Panel ROPS</span>
                  </Dropdown.Item>

                  <Dropdown.Item
                    id="organizer"
                    className="rounded-xl px-3 py-2 text-xs text-gray-700 hover:bg-gray-100/80 focus:bg-gray-100 flex items-center gap-2 cursor-pointer transition-colors outline-none"
                  >
                    <span className="text-sm">🏢</span>
                    <span>Logowanie organizacji</span>
                  </Dropdown.Item>
                </Dropdown.Section>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
