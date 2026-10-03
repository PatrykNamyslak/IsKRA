"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserSession {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export default function OrganizerLayoutClient() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login/organizer");
      router.refresh();
    } catch (e) {
      console.error("Błąd wylogowania:", e);
    }
  }

  return (
    <nav className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-6 py-3.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/organizer"
            className="flex items-center gap-2 font-bold tracking-tight text-white hover:opacity-90 transition-opacity"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white font-black text-sm">
              🏥
            </span>
            <div className="leading-tight">
              <span className="block text-base font-extrabold uppercase tracking-wide">Panel Organizatora</span>
              <span className="block text-[11px] font-normal text-blue-200">Placówki Medyczne & Opiekuńcze</span>
            </div>
          </Link>

          <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/40 text-blue-100 border border-blue-400/30">
            STREFA ORGANIZACJI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/organizer"
            className="hidden sm:inline-flex rounded-lg px-3.5 py-2 text-sm font-semibold text-white/90 hover:bg-white/15 transition-all"
          >
            Pulpit Zgłoszeń
          </Link>

          <Link
            href="/organizer/innovations"
            className="rounded-lg px-3.5 py-2 text-sm font-semibold text-white/90 hover:bg-white/15 transition-all"
          >
            Przeglądaj Innowacje
          </Link>

          <Link
            href="/"
            className="hidden lg:inline-flex rounded-lg px-3 py-1.5 text-xs font-medium text-blue-200 hover:text-white hover:bg-white/10 transition-all"
          >
            Strona Główna Serwisu
          </Link>

          {!loading && (
            user ? (
              <div className="flex items-center gap-2.5 pl-3 border-l border-white/20">
                <div className="hidden sm:block text-right">
                  <span className="block text-xs font-semibold text-white leading-tight">
                    {user.name || user.email}
                  </span>
                  <span className="block text-[10px] text-blue-200 uppercase tracking-wider font-mono">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg px-3.5 py-1.5 text-xs font-bold text-white bg-red-600/90 hover:bg-red-600 shadow-sm transition-all cursor-pointer"
                >
                  WYLOGUJ
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-3 border-l border-white/20">
                <Link
                  href="/login/organizer"
                  className="rounded-lg px-3.5 py-1.5 text-xs font-bold text-blue-900 bg-white hover:bg-blue-50 shadow-sm transition-all"
                >
                  ZALOGUJ / REJESTRACJA
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}