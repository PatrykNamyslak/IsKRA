"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, Card, Form, Input, TextArea, Button } from "@heroui/react";
import PeekRating from "@/app/components/PeekRating";
import { Search, ArrowRight, Plus, FlaskConical } from "lucide-react";
import { ROPS_CATEGORIES } from "@/lib/categories";

interface Feedback {
    id: string | number;
    rating: number;
    comment: string;
    authorName?: string;
    role?: string;
    createdAt?: string;
}

interface Innovation {
    id: string | number;
    title: string;
    slug?: string;
    creatorType?: "application" | "matchmaking_gap" | "idea_exchange";
    category?: string | { name?: string };
    patientProblem: string;
    proposedSolution?: string;
    targetGroup?: string;
    status?: string;
    availableForTesting?: boolean;
    wantsToImplement?: boolean;
    contactName?: string;
    contactEmail?: string;
    supportNeeded?: string;
    createdAt?: string;
}

function InnovationsExplorerInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab");

    const [innovations, setInnovations] = useState<Innovation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [activeTab, setActiveTab] = useState<string>(() => {
        if (initialTab === "testing") return "testing";
        if (initialTab === "ideas") return "idea_exchange";
        return "all";
    });
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [categoriesList, setCategoriesList] = useState<{ id: number; name: string }[]>([]);

    useEffect(() => {
        fetch("/api/categories?limit=100")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.docs && data.docs.length > 0) {
                    setCategoriesList(data.docs.map((d: any) => ({ id: d.id, name: d.name })));
                }
            })
            .catch(() => {});
    }, []);

    // Expanded card state & feedbacks cache
    const [expandedId, setExpandedId] = useState<string | number | null>(null);
    const [feedbacksMap, setFeedbacksMap] = useState<Record<string, Feedback[]>>({});
    const [loadingFeedbacks, setLoadingFeedbacks] = useState<Record<string, boolean>>({});

    // Feedback form per expanded innovation
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackComment, setFeedbackComment] = useState("");
    const [feedbackAuthor, setFeedbackAuthor] = useState("");
    const [feedbackRole, setFeedbackRole] = useState("user");
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedbackSuccess, setFeedbackSuccess] = useState(false);

    // Fetch innovations
    useEffect(() => {
        const fetchInnovations = async () => {
            setIsLoading(true);
            try {
                let url = "/api/innovations?limit=100&sort=-createdAt";
                if (selectedCategory !== "all") {
                    const matchedCat = categoriesList.find((c) => c.name === selectedCategory);
                    if (matchedCat) {
                        url += `&where[category][equals]=${matchedCat.id}`;
                    } else {
                        url += `&where[category.name][equals]=${encodeURIComponent(selectedCategory)}`;
                    }
                }
                if (activeTab === "idea_exchange") {
                    url += `&where[creatorType][equals]=idea_exchange`;
                } else if (activeTab === "testing") {
                    url += `&where[availableForTesting][equals]=true`;
                } else if (activeTab === "application") {
                    url += `&where[creatorType][equals]=application`;
                }
                if (searchQuery.trim()) {
                    url += `&where[title][like]=${encodeURIComponent(searchQuery.trim())}`;
                }

                const res = await fetch(url);
                if (!res.ok) throw new Error("Błąd pobierania danych");
                const data = await res.json();
                setInnovations(data.docs || []);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Błąd połączenia");
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchInnovations();
        }, 200);

        return () => clearTimeout(timer);
    }, [activeTab, selectedCategory, searchQuery, categoriesList]);

    // Load feedbacks for an innovation
    const toggleExpand = async (id: string | number) => {
        if (expandedId === id) {
            setExpandedId(null);
            return;
        }

        setExpandedId(id);
        setFeedbackSuccess(false);
        setFeedbackComment("");

        if (!feedbacksMap[id]) {
            setLoadingFeedbacks((prev) => ({ ...prev, [id]: true }));
            try {
                const res = await fetch(`/api/feedbacks?where[innovation][equals]=${id}&sort=-createdAt`);
                if (res.ok) {
                    const data = await res.json();
                    setFeedbacksMap((prev) => ({ ...prev, [id]: data.docs || [] }));
                }
            } catch (err) {
                console.warn("Błąd pobierania opinii:", err);
            } finally {
                setLoadingFeedbacks((prev) => ({ ...prev, [id]: false }));
            }
        }
    };

    const handleAddFeedback = async (e: React.FormEvent, innovationId: string | number) => {
        e.preventDefault();
        if (!feedbackComment.trim()) return;

        setSubmittingFeedback(true);
        try {
            const res = await fetch("/api/feedbacks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    innovation: innovationId,
                    rating: feedbackRating,
                    comment: feedbackComment.trim(),
                    authorName: feedbackAuthor.trim() || "Użytkownik",
                    role: feedbackRole,
                }),
            });

            if (!res.ok) throw new Error("Nie udało się zapisać opinii.");
            const resJson = await res.json();

            setFeedbackSuccess(true);
            setFeedbackComment("");
            const createdItem = resJson.doc || resJson.data;
            if (createdItem) {
                setFeedbacksMap((prev) => ({
                    ...prev,
                    [innovationId]: [createdItem, ...(prev[innovationId] || [])],
                }));
            }
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Błąd");
        } finally {
            setSubmittingFeedback(false);
        }
    };

    const getCategoryName = (cat?: string | { name?: string }) => {
        if (!cat) return "Innowacja Społeczna";
        if (typeof cat === "object" && cat.name) return cat.name;
        return String(cat);
    };

    return (
        <div className="mx-auto w-full max-w-6xl py-8 sm:py-12 px-4 sm:px-6 relative z-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-black/[0.05]">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-gray-900">
                        Baza Pomysłów i Katalog Innowacji
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-2xl leading-relaxed">
                        Przeglądaj innowacje społeczne, giełdę pomysłów do zrealizowania oraz projekty do testowania
                        przez społeczność.
                    </p>
                </div>

                <Link
                    href="/form"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e58500] hover:bg-[#cc7700] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#e58500]/20 transition-all active:scale-95 shrink-0">
                    <Plus className="w-4 h-4" />
                    <span>Zgłoś pomysł</span>
                </Link>
            </div>

            {/* Tabs & Filters Controls */}
            <div className="mt-8 flex flex-col gap-4">
                {/* HeroUI Tabs on top */}
                <div className="w-full overflow-x-auto no-scrollbar pb-1">
                    <Tabs
                        selectedKey={activeTab}
                        onSelectionChange={(key) => setActiveTab(String(key))}
                        className="w-full min-w-max">
                        <Tabs.ListContainer className="w-full p-0.5">
                            <Tabs.List
                                aria-label="Wybór kategorii innowacji"
                                className="w-full flex bg-black/[0.04] p-1.5 rounded-full border border-white/60 backdrop-blur-md relative gap-1">
                                <Tabs.Tab
                                    id="all"
                                    className={`flex-1 py-2 sm:py-2.5 px-4 text-xs sm:text-sm font-medium rounded-full transition-all focus:outline-none cursor-pointer text-center relative z-10 whitespace-nowrap ${
                                        activeTab === "all"
                                            ? "bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}>
                                    Wszystkie innowacje
                                    <Tabs.Indicator className="rounded-full" />
                                </Tabs.Tab>

                                <Tabs.Tab
                                    id="idea_exchange"
                                    className={`flex-1 py-2 sm:py-2.5 px-4 text-xs sm:text-sm font-medium rounded-full transition-all focus:outline-none cursor-pointer text-center relative z-10 whitespace-nowrap ${
                                        activeTab === "idea_exchange"
                                            ? "bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}>
                                    Giełda pomysłów
                                    <Tabs.Indicator className="rounded-full" />
                                </Tabs.Tab>

                                <Tabs.Tab
                                    id="testing"
                                    className={`flex-1 py-2 sm:py-2.5 px-4 text-xs sm:text-sm font-medium rounded-full transition-all focus:outline-none cursor-pointer text-center relative z-10 whitespace-nowrap ${
                                        activeTab === "testing"
                                            ? "bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}>
                                    Do testowania
                                    <Tabs.Indicator className="rounded-full" />
                                </Tabs.Tab>

                                <Tabs.Tab
                                    id="application"
                                    className={`flex-1 py-2 sm:py-2.5 px-4 text-xs sm:text-sm font-medium rounded-full transition-all focus:outline-none cursor-pointer text-center relative z-10 whitespace-nowrap ${
                                        activeTab === "application"
                                            ? "bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}>
                                    Wnioski o wdrożenie
                                    <Tabs.Indicator className="rounded-full" />
                                </Tabs.Tab>
                            </Tabs.List>
                        </Tabs.ListContainer>
                    </Tabs>
                </div>

                {/* Search & Category Filter underneath */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Szukaj po tytule, problemie..."
                            className="w-full rounded-full bg-white/50 border border-white/70 pl-4 pr-10 py-2.5 text-base text-gray-900 placeholder-gray-400 focus:bg-white/80 focus:border-brand/50 outline-none shadow-2xs backdrop-blur-md transition-all"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="sm:w-auto shrink-0 rounded-full bg-white/50 border border-white/70 px-4 py-2.5 text-base text-gray-800 focus:bg-white/80 focus:border-brand/50 outline-none shadow-2xs backdrop-blur-md cursor-pointer transition-all">
                        <option value="all">Wszystkie kategorie</option>
                        {(categoriesList.length > 0 ? categoriesList.map((c) => c.name) : ROPS_CATEGORIES).map(
                            (cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            )
                        )}
                    </select>
                </div>
            </div>

            {/* Innovation Cards Grid */}
            <div className="mt-8">
                {isLoading ? (
                    <div className="py-24 text-center text-gray-400">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[#e58500] border-t-transparent" />
                        <p className="mt-3 text-xs sm:text-sm font-medium text-gray-500">
                            Wczytuję innowacje z bazy danych...
                        </p>
                    </div>
                ) : error ? (
                    <div className="rounded-[2rem] border border-rose-200 bg-rose-50/80 backdrop-blur-md p-6 text-center text-rose-700">
                        <p className="font-semibold text-sm">{error}</p>
                    </div>
                ) : innovations.length === 0 ? (
                    <div className="rounded-[2.5rem] border border-white/70 bg-white/40 backdrop-blur-xl p-12 text-center shadow-sm">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            Brak innowacji dla wybranych filtrów
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
                            Nie znaleziono pozycji pasujących do kryteriów. Możesz zresetować filtry lub dodać nowy
                            pomysł w kreatorze.
                        </p>
                        <div className="mt-5">
                            <Link
                                href="/form"
                                className="inline-flex items-center gap-2 rounded-full bg-[#e58500] hover:bg-[#cc7700] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all">
                                <span>Dodaj innowację w Kreatorze</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {innovations.map((item) => {
                            const isExpanded = expandedId === item.id;
                            const feedbacks = feedbacksMap[item.id] || [];
                            const isFeedbacksLoading = loadingFeedbacks[item.id];
                            const slugOrId = item.slug || String(item.id);

                            return (
                                <div
                                    key={item.id}
                                    className="flex flex-col justify-between rounded-[2rem] bg-white/45 border border-white/75 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)] backdrop-blur-2xl p-6 sm:p-7 transition-all duration-300 hover:shadow-[0_16px_40px_rgba(229,133,0,0.1)] hover:border-[#e58500]/30 hover:-translate-y-0.5 group">
                                    <div>
                                        {/* Top Badges */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                                            <span className="rounded-full bg-black/[0.04] border border-black/[0.08] px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                                                {getCategoryName(item.category)}
                                            </span>

                                            <div className="flex items-center gap-1.5">
                                                {item.creatorType === "idea_exchange" ? (
                                                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                                                        Giełda pomysłów
                                                    </span>
                                                ) : item.creatorType === "matchmaking_gap" ? (
                                                    <span className="rounded-full bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                                                        Niezaspokojona potrzeba
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-brand/10 border border-brand/25 px-2.5 py-0.5 text-xs font-semibold text-brand">
                                                        Wniosek o wdrożenie
                                                    </span>
                                                )}

                                                {item.availableForTesting && (
                                                    <span className="rounded-full bg-brand/10 border border-brand/25 px-2.5 py-0.5 text-xs font-semibold text-brand">
                                                        Do testów
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-brand transition-colors leading-snug">
                                            <Link href={`/innovations/${encodeURIComponent(slugOrId)}`}>
                                                {item.title}
                                            </Link>
                                        </h3>

                                        {/* Problem */}
                                        <div className="mt-3.5">
                                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                                                Zgłoszony problem:
                                            </span>
                                            <p className="mt-1 text-xs sm:text-sm text-gray-700 line-clamp-3 leading-relaxed">
                                                {item.patientProblem}
                                            </p>
                                        </div>

                                        {/* Solution */}
                                        {item.proposedSolution && (
                                            <div className="mt-3.5">
                                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                                                    Rozwiązanie:
                                                </span>
                                                <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                                    {item.proposedSolution}
                                                </p>
                                            </div>
                                        )}

                                        {/* Support needed */}
                                        {item.supportNeeded && (
                                            <div className="mt-3.5 p-3 rounded-2xl bg-white/50 border border-black/[0.04] text-xs text-gray-700">
                                                <span className="font-semibold text-gray-900 block mb-0.5">
                                                    {item.creatorType === "idea_exchange"
                                                        ? "Poszukiwany zespół:"
                                                        : "Wymagane wsparcie od ROPS:"}
                                                </span>
                                                <span className="text-gray-600">{item.supportNeeded}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions & Expand Footer */}
                                    <div className="mt-6 pt-4 border-t border-black/[0.05] flex items-center justify-end gap-2">
                                        <Button
                                            size="sm"
                                            onPress={() => router.push(`/innovations/${encodeURIComponent(slugOrId)}`)}
                                            className="rounded-full bg-gray-900 hover:bg-gray-800 text-white px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer h-auto min-h-0">
                                            <span>Szczegóły</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Button>

                                        {item.availableForTesting && (
                                            <Button
                                                size="sm"
                                                onPress={() =>
                                                    router.push(
                                                        `/form?tab=idea&problem=${encodeURIComponent(
                                                            `Zgłoszenie do testowania innowacji: ${item.title}`
                                                        )}`
                                                    )
                                                }
                                                className="rounded-full bg-brand hover:bg-brand-hover px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer h-auto min-h-0">
                                                <FlaskConical className="w-3.5 h-3.5" />
                                                <span>Aplikuj do testów</span>
                                            </Button>
                                        )}
                                    </div>

                                    {/* Expanded Content: Feedbacks & Feedback Form */}
                                    {isExpanded && (
                                        <div className="mt-4 pt-4 border-t border-black/[0.05] transition-all">
                                            <h4 className="text-xs font-bold text-gray-900 mb-3">
                                                Opinie społeczności i testerów:
                                            </h4>

                                            {isFeedbacksLoading ? (
                                                <p className="text-xs text-gray-400">Wczytywanie opinii...</p>
                                            ) : feedbacks.length > 0 ? (
                                                <div className="space-y-2 mb-4">
                                                    {feedbacks.map((fb, idx) => (
                                                        <div
                                                            key={fb.id || idx}
                                                            className="rounded-2xl border border-white/80 bg-white/50 p-3 text-xs">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-semibold text-gray-800">
                                                                    {fb.authorName || "Anonim"} (
                                                                    {fb.role === "tester"
                                                                        ? "🔬 Tester"
                                                                        : "👤 Użytkownik"}
                                                                    )
                                                                </span>
                                                                <span className="text-amber-500 font-mono text-[11px]">
                                                                    {"★".repeat(fb.rating)}
                                                                    {"☆".repeat(5 - fb.rating)}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-600 leading-relaxed">
                                                                {fb.comment}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-500 italic mb-4">
                                                    Brak wcześniejszych opinii. Dodaj pierwszą ocenę poniżej.
                                                </p>
                                            )}

                                            {/* Add Feedback HeroUI Card & Form */}
                                            <Card className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-2xs backdrop-blur-md">
                                                <Form
                                                    onSubmit={(e) => handleAddFeedback(e, item.id)}
                                                    className="flex flex-col gap-3">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <h5 className="text-xs font-bold text-gray-800">
                                                            Dodaj opinię o tym rozwiązaniu:
                                                        </h5>
                                                        <div className="flex items-center">
                                                            <PeekRating
                                                                value={feedbackRating}
                                                                onChange={setFeedbackRating}
                                                                count={5}
                                                                shape="star"
                                                                activeColor="#f5b400"
                                                                idleColor="#52525b"
                                                                tipColor="#27272a"
                                                                tipTextColor="#f5f5f5"
                                                                size={40}
                                                                lift={8}
                                                                magnify={1.27}
                                                                riseDuration={590}
                                                                popScale={1.3}
                                                                showTip={false}
                                                                allowClear={false}
                                                                readOnly={false}
                                                            />
                                                        </div>
                                                    </div>

                                                    <Input
                                                        type="text"
                                                        value={feedbackAuthor}
                                                        onChange={(e) => setFeedbackAuthor(e.target.value)}
                                                        placeholder="Twoje imię / pseudonim"
                                                        className="w-full text-base"
                                                    />

                                                    <TextArea
                                                        rows={2}
                                                        required
                                                        value={feedbackComment}
                                                        onChange={(e) => setFeedbackComment(e.target.value)}
                                                        placeholder="Twoje uwagi, wynik testu lub feedback..."
                                                        className="w-full text-base"
                                                    />

                                                    <div className="flex items-center justify-between pt-1">
                                                        {feedbackSuccess ? (
                                                            <span className="text-xs font-semibold text-emerald-600">
                                                                ✓ Opinia dodana!
                                                            </span>
                                                        ) : (
                                                            <span />
                                                        )}
                                                        <Button
                                                            type="submit"
                                                            isDisabled={submittingFeedback || !feedbackComment.trim()}
                                                            className="rounded-full bg-gray-900 hover:bg-gray-800 px-4 py-1.5 text-xs font-semibold text-white transition-all cursor-pointer">
                                                            {submittingFeedback ? "Zapisuję..." : "Wyślij opinię"}
                                                        </Button>
                                                    </div>
                                                </Form>
                                            </Card>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function InnovationsExplorer() {
    return (
        <Suspense
            fallback={
                <div className="py-24 text-center text-gray-400">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[#e58500] border-t-transparent" />
                    <p className="mt-3 text-xs sm:text-sm font-medium text-gray-500">Ładowanie bazy pomysłów...</p>
                </div>
            }>
            <InnovationsExplorerInner />
        </Suspense>
    );
}
