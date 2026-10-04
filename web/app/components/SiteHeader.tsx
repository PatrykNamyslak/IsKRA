"use client";

import { useState } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Avatar, Dropdown, Link } from "@heroui/react";
import { motion, AnimatePresence } from "motion/react";

type SiteHeaderProps = {
    audience?: "user" | "organizer" | "research";
};

export default function SiteHeader({ audience }: SiteHeaderProps) {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-3 sm:top-4 z-50 w-full px-4 sm:px-6 pointer-events-none mb-3 sm:mb-1">
            <div className="mx-auto w-full max-w-4xl sm:max-w-5xl relative pointer-events-auto">
                <div className="w-full rounded-full bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] px-5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
                    {/* Brand Logo */}
                    <NextLink href="/" className="flex items-center gap-2.5 group shrink-0">
                        <Image
                            src="/iskra-full.svg"
                            alt="IsKRA"
                            width={92}
                            height={28}
                            className="h-6.5 w-auto transition-transform group-hover:scale-105"
                            priority
                        />
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

                        {/* User Profile Avatar with HeroUI Dropdown */}
                        <Dropdown>
                            <Dropdown.Trigger className="rounded-full focus:outline-none cursor-pointer transition-transform flex items-center justify-center p-0.5">
                                <Avatar
                                    size="sm"
                                    className="transition-transform ring-2 ring-brand ring-offset-2 ring-offset-white cursor-pointer hover:scale-105 active:scale-95 shadow-sm">
                                    <Avatar.Image
                                        src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg"
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
                                className="min-w-56 rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl shadow-xl p-1 z-[100] text-xs">
                                <Dropdown.Menu
                                    aria-label="Profile Actions"
                                    onAction={(key) => {
                                        if (key === "panel") router.push("/panel");
                                        if (key === "organizer") router.push("/login/organizer");
                                    }}>
                                    <Dropdown.Section>
                                        <Dropdown.Item
                                            id="profile"
                                            className="h-auto py-2.5 px-3 flex flex-col items-start justify-center cursor-default pointer-events-none opacity-100 select-none border-b border-gray-100/80 mb-1">
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
                                            className="rounded-xl px-3 py-2 text-xs font-medium text-gray-800 hover:bg-gray-100/80 focus:bg-gray-100 cursor-pointer transition-colors outline-none">
                                            Panel ROPS
                                        </Dropdown.Item>

                                        <Dropdown.Item
                                            id="organizer"
                                            className="rounded-xl px-3 py-2 text-xs text-gray-700 hover:bg-gray-100/80 focus:bg-gray-100 cursor-pointer transition-colors outline-none">
                                            Logowanie organizacji
                                        </Dropdown.Item>
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
                                    <Avatar.Image
                                        src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg"
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
                                className="min-w-52 rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl shadow-xl p-1 z-[100] text-xs">
                                <Dropdown.Menu
                                    aria-label="Profile Actions Mobile"
                                    onAction={(key) => {
                                        if (key === "panel") router.push("/panel");
                                        if (key === "organizer") router.push("/login/organizer");
                                    }}>
                                    <Dropdown.Item id="profile" className="px-3 py-2 pointer-events-none opacity-100">
                                        <p className="text-[10px] text-gray-500">Zalogowano jako</p>
                                        <p className="text-xs font-semibold text-gray-900">admin@rops.pl</p>
                                    </Dropdown.Item>
                                    <Dropdown.Item id="panel" className="rounded-xl px-3 py-2 text-xs">
                                        Panel ROPS
                                    </Dropdown.Item>
                                    <Dropdown.Item id="organizer" className="rounded-xl px-3 py-2 text-xs">
                                        Logowanie organizacji
                                    </Dropdown.Item>
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
