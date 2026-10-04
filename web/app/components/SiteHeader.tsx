"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Avatar, Dropdown, Link } from "@heroui/react";
import { motion, AnimatePresence } from "motion/react";

type SiteHeaderProps = {
    audience?: "user" | "organizer" | "research";
};

type AuthUser = {
    id: string | number;
    email: string;
    role: string;
    name?: string | null;
};

export default function SiteHeader({ audience }: SiteHeaderProps) {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        fetch("/api/auth/me")
            .then((res) => (res.ok ? res.json() : { user: null }))
            .then((data) => {
                if (isMounted) setUser(data?.user || null);
            })
            .catch(() => {
                if (isMounted) setUser(null);
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });
        return () => {
            isMounted = false;
        };
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setUser(null);
            router.refresh();
            router.push("/");
        } catch (e) {
            console.error("Logout error:", e);
        }
    };

    const getRoleLabel = (role?: string) => {
        switch (role) {
            case "admin":
                return "Administrator";
            case "organization":
                return "Organizacja";
            case "tester":
                return "Tester";
            default:
                return "Użytkownik";
        }
    };

    const getInitials = (u: AuthUser) => {
        if (u.name && u.name.trim()) {
            const parts = u.name.trim().split(/\s+/);
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return parts[0].slice(0, 2).toUpperCase();
        }
        return (u.email || "U").slice(0, 2).toUpperCase();
    };

    return (
        <header className="sticky top-3 sm:top-4 z-50 w-full px-4 sm:px-6 pointer-events-none mb-3 sm:mb-1">
            <div className="mx-auto w-full max-w-4xl sm:max-w-5xl relative pointer-events-auto">
                <div className="w-full rounded-full bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] px-5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
                    {/* Brand Logo */}
                    <NextLink href="/" className="flex items-center gap-2.5 group shrink-0">
                        <Image
                            src="/iskra-icon.svg"
                            alt=""
                            width={44}
                            height={49}
                            className="h-6 w-auto transition-transform group-hover:scale-105"
                            priority
                        />
                        <span className="text-sm font-bold tracking-tight text-gray-800 sm:text-base">
                            IsKra <span className="font-medium text-gray-500">Małopolska</span>
                        </span>
                    </NextLink>

                    {/* Desktop Navigation Menu */}
                    <div className="hidden md:flex items-center gap-5 lg:gap-6">
                        <Link
                            href="/innovations"
                            className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Baza pomysłów
                            <Link.Icon />
                        </Link>

                        <Link
                            href="/form"
                            className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Zgłoś pomysł
                            <Link.Icon />
                        </Link>

                        <Link
                            href="/tester"
                            className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Chcę zostać testerem
                            <Link.Icon />
                        </Link>

                        {/* User Profile Avatar with HeroUI Dropdown */}
                        <Dropdown>
                            <Dropdown.Trigger className="rounded-full focus:outline-none cursor-pointer transition-transform flex items-center justify-center p-0.5">
                                <Avatar
                                    size="sm"
                                    className="transition-transform ring-2 ring-brand ring-offset-2 ring-offset-white cursor-pointer hover:scale-105 active:scale-95 shadow-sm">
                                    <Avatar.Fallback className="bg-amber-100 text-amber-900 font-semibold text-xs flex items-center justify-center">
                                        {user ? (
                                            getInitials(user)
                                        ) : (
                                            <svg className="w-3.5 h-3.5 text-amber-900/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        )}
                                    </Avatar.Fallback>
                                </Avatar>
                            </Dropdown.Trigger>

                            <Dropdown.Popover
                                placement="bottom end"
                                offset={18}
                                className="min-w-56 rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl shadow-xl p-1 z-[100] text-xs">
                                <Dropdown.Menu
                                    aria-label="Profile Actions"
                                    onAction={(key) => {
                                        if (key === "panel") router.push("/panel");
                                        if (key === "login") router.push("/panel/login");
                                        if (key === "organizer") router.push("/login/organizer");
                                        if (key === "logout") handleLogout();
                                    }}>
                                    <Dropdown.Section>
                                        <Dropdown.Item
                                            id="profile"
                                            className="h-auto py-2.5 px-3 flex flex-col items-start justify-center cursor-default pointer-events-none opacity-100 select-none border-b border-gray-100/80 mb-1">
                                            {user ? (
                                                <>
                                                    <p className="text-[11px] font-normal text-gray-500 leading-none">
                                                        Zalogowano jako ({getRoleLabel(user.role)})
                                                    </p>
                                                    <p className="text-xs font-semibold text-gray-900 leading-normal truncate w-full mt-1">
                                                        {user.email}
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-[11px] font-normal text-gray-500 leading-none">
                                                        Konto gościa
                                                    </p>
                                                    <p className="text-xs font-semibold text-gray-900 leading-normal truncate w-full mt-1">
                                                        Niezalogowany
                                                    </p>
                                                </>
                                            )}
                                        </Dropdown.Item>
                                    </Dropdown.Section>

                                    <Dropdown.Section>
                                        {user ? (
                                            <>
                                                <Dropdown.Item
                                                    id="panel"
                                                    className="rounded-xl px-3 py-2 text-xs font-medium text-gray-800 hover:bg-gray-100/80 focus:bg-gray-100 cursor-pointer transition-colors outline-none">
                                                    {user.role === "admin" ? "Panel ROPS" : "Panel użytkownika"}
                                                </Dropdown.Item>

                                                <Dropdown.Item
                                                    id="logout"
                                                    className="rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 focus:bg-rose-50 cursor-pointer transition-colors outline-none">
                                                    Wyloguj się
                                                </Dropdown.Item>
                                            </>
                                        ) : (
                                            <>
                                                <Dropdown.Item
                                                    id="login"
                                                    className="rounded-xl px-3 py-2 text-xs font-medium text-gray-800 hover:bg-gray-100/80 focus:bg-gray-100 cursor-pointer transition-colors outline-none">
                                                    Zaloguj się
                                                </Dropdown.Item>

                                                <Dropdown.Item
                                                    id="organizer"
                                                    className="rounded-xl px-3 py-2 text-xs text-gray-700 hover:bg-gray-100/80 focus:bg-gray-100 cursor-pointer transition-colors outline-none">
                                                    Logowanie organizacji
                                                </Dropdown.Item>
                                            </>
                                        )}
                                    </Dropdown.Section>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>
                    </div>

                    {/* Mobile Hamburger & Actions */}
                    <div className="flex md:hidden items-center gap-2">
                        <Dropdown>
                            <Dropdown.Trigger className="rounded-full focus:outline-none cursor-pointer p-0.5">
                                <Avatar
                                    size="sm"
                                    className="ring-2 ring-brand ring-offset-2 ring-offset-white shadow-xs">
                                    <Avatar.Fallback className="bg-amber-100 text-amber-900 font-semibold text-xs flex items-center justify-center">
                                        {user ? (
                                            getInitials(user)
                                        ) : (
                                            <svg className="w-3.5 h-3.5 text-amber-900/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        )}
                                    </Avatar.Fallback>
                                </Avatar>
                            </Dropdown.Trigger>
                            <Dropdown.Popover
                                placement="bottom end"
                                offset={18}
                                className="min-w-52 rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl shadow-xl p-1 z-[100] text-xs">
                                <Dropdown.Menu
                                    aria-label="Profile Actions Mobile"
                                    onAction={(key) => {
                                        if (key === "panel") router.push("/panel");
                                        if (key === "login") router.push("/panel/login");
                                        if (key === "organizer") router.push("/login/organizer");
                                        if (key === "logout") handleLogout();
                                    }}>
                                    <Dropdown.Item id="profile" className="px-3 py-2 pointer-events-none opacity-100">
                                        {user ? (
                                            <>
                                                <p className="text-[10px] text-gray-500">Zalogowano jako ({getRoleLabel(user.role)})</p>
                                                <p className="text-xs font-semibold text-gray-900 truncate">{user.email}</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-[10px] text-gray-500">Konto gościa</p>
                                                <p className="text-xs font-semibold text-gray-900">Niezalogowany</p>
                                            </>
                                        )}
                                    </Dropdown.Item>

                                    {user ? (
                                        <>
                                            <Dropdown.Item id="panel" className="rounded-xl px-3 py-2 text-xs">
                                                {user.role === "admin" ? "Panel ROPS" : "Panel"}
                                            </Dropdown.Item>
                                            <Dropdown.Item id="logout" className="rounded-xl px-3 py-2 text-xs text-rose-600">
                                                Wyloguj się
                                            </Dropdown.Item>
                                        </>
                                    ) : (
                                        <>
                                            <Dropdown.Item id="login" className="rounded-xl px-3 py-2 text-xs">
                                                Zaloguj się
                                            </Dropdown.Item>
                                            <Dropdown.Item id="organizer" className="rounded-xl px-3 py-2 text-xs">
                                                Logowanie organizacji
                                            </Dropdown.Item>
                                        </>
                                    )}
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>

                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/[0.04] hover:bg-black/[0.08] active:scale-90 transition-all focus:outline-none cursor-pointer"
                            aria-label="Menu nawigacji">
                            <div className="w-4 h-3 flex flex-col justify-between items-center">
                                <motion.span
                                    animate={isMobileMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-full h-0.5 bg-gray-800 rounded-full origin-center"
                                />
                                <motion.span
                                    animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                                    transition={{ duration: 0.15 }}
                                    className="w-full h-0.5 bg-gray-800 rounded-full"
                                />
                                <motion.span
                                    animate={isMobileMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-full h-0.5 bg-gray-800 rounded-full origin-center"
                                />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Expandable Drawer Menu - Floating Absolute below pill */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            key="mobile-nav"
                            initial={{ opacity: 0, y: -10, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.97 }}
                            transition={{ type: "spring", bounce: 0.12, duration: 0.3 }}
                            className="absolute top-[calc(100%+8px)] left-0 right-0 rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.14)] p-3 md:hidden flex flex-col gap-1 z-50">
                            <Link
                                href="/innovations"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full px-4 py-2.5 rounded-2xl hover:bg-black/[0.04] text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center justify-between">
                                Baza pomysłów
                                <Link.Icon />
                            </Link>

                            <Link
                                href="/form"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full px-4 py-2.5 rounded-2xl hover:bg-black/[0.04] text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center justify-between">
                                Zgłoś pomysł
                                <Link.Icon />
                            </Link>

                            <Link
                                href="/tester"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full px-4 py-2.5 rounded-2xl hover:bg-black/[0.04] text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center justify-between">
                                Chcę zostać testerem
                                <Link.Icon />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
