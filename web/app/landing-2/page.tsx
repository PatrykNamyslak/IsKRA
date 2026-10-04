"use client";

import React, { useState } from 'react';
import { Sparkles, User, ArrowUp } from 'lucide-react';
import Link from 'next/link';

type Mode = 'szukam-wsparcia' | 'zglaszam-pomysl';

export default function IsKRA() {
  const [activeMode, setActiveMode] = useState<Mode>('szukam-wsparcia');
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsSubmitting(true);
    
    // Wire up your fetch/axios call to your backend endpoint here
    try {
      console.log('Submitting payload:', { mode: activeMode, prompt });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated network delay
      setPrompt('');
    } catch (error) {
      console.error('Submission failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f5f5f7] text-gray-900 font-sans antialiased min-h-screen flex flex-col relative selection:bg-[#e58500] selection:text-white overflow-x-hidden">
      
      {/* Atmospheric Mesh Background */}
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center items-center">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-slate-300/40 rounded-full blur-[100px] mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#e58500]/10 rounded-full blur-[120px] mix-blend-multiply"></div>
      </div>

      {/* Perimeter Top: Flowing Nav */}
      <header className="w-full px-4 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8 relative z-50">
        <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-sm border border-gray-700/50 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4 text-[#e58500]" />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-semibold text-gray-900 tracking-tight leading-none">IsKRA</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-gray-200 text-gray-500 leading-none">ROPS</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 md:gap-6">
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">O systemie</Link>
          <Link href="/innovations" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Baza pomysłów</Link>
          <Link href="/login/organizer" aria-label="Zaloguj się" className="w-10 h-10 rounded-full bg-white/60 border border-white flex items-center justify-center hover:bg-white transition-colors shadow-sm text-gray-500">
            <User className="w-4 h-4" />
          </Link>
        </div>

        <details className="group relative sm:hidden">
          <summary
            aria-label="Menu nawigacyjne"
            className="flex h-11 w-11 touch-manipulation cursor-pointer list-none items-center justify-center rounded-xl border border-white/80 bg-white/70 text-gray-700 shadow-sm [&::-webkit-details-marker]:hidden"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 group-open:hidden" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="hidden h-5 w-5 group-open:block" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
            </svg>
          </summary>
          <nav
            aria-label="Nawigacja mobilna"
            className="absolute right-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-white/80 bg-white p-2 shadow-xl"
          >
            <Link href="/" className="flex min-h-11 touch-manipulation items-center rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100">
              O systemie
            </Link>
            <Link href="/innovations" className="flex min-h-11 touch-manipulation items-center rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100">
              Baza pomysłów
            </Link>
            <Link href="/login/organizer" className="flex min-h-11 touch-manipulation items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100">
              <User className="h-4 w-4" />
              Zaloguj się
            </Link>
          </nav>
        </details>
        </div>
      </header>

      {/* Main Content: Optically Centered Command Center */}
      <section aria-labelledby="landing-title" className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-8 sm:px-6 relative z-10">
        <h1 id="landing-title" className="text-2xl sm:text-3xl font-medium tracking-tight text-gray-800 mb-6 text-center leading-tight">
          Czego potrzebuje Twój projekt?
        </h1>

        {/* Liquid Glass Unified Panel */}
        <div 
          className="w-full bg-white/40 border border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] rounded-[1.75rem] sm:rounded-[2.5rem] p-2.5 sm:p-3 flex flex-col transition-all"
          style={{ backdropFilter: 'blur(40px) saturate(150%)', WebkitBackdropFilter: 'blur(40px) saturate(150%)' }}
        >
          {/* Segmented Control */}
          <div className="flex bg-black/[0.04] p-1 rounded-full mb-3" role="tablist">
            <button 
              type="button"
              onClick={() => setActiveMode('szukam-wsparcia')}
              className={`min-h-11 flex-1 px-2 py-2 text-xs sm:text-sm font-medium rounded-full transition-all focus:outline-none ${
                activeMode === 'szukam-wsparcia' 
                  ? 'bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              role="tab" 
              aria-selected={activeMode === 'szukam-wsparcia'}
            >
              Szukam wsparcia
            </button>
            
            <button 
              type="button"
              onClick={() => setActiveMode('zglaszam-pomysl')}
              className={`min-h-11 flex-1 px-2 py-2 text-xs sm:text-sm font-medium rounded-full transition-all focus:outline-none ${
                activeMode === 'zglaszam-pomysl' 
                  ? 'bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              role="tab" 
              aria-selected={activeMode === 'zglaszam-pomysl'}
            >
              Zgłaszam pomysł dla ROPS
            </button>
          </div>

          {/* Input Area */}
          <div className="relative w-full">
            <form id="landing-2-form" onSubmit={handleSubmit} className="relative group flex flex-col">
              <label htmlFor="ai-prompt" className="sr-only">Opisz swój pomysł</label>
              <textarea 
                id="ai-prompt"
                name="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full bg-white/40 border border-white/50 focus:bg-white/70 focus:border-white rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 pr-16 sm:pr-20 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 resize-y min-h-[160px] text-base sm:text-[1.05rem] leading-relaxed shadow-inner transition-all duration-300 disabled:opacity-50"
                placeholder={
                  activeMode === 'szukam-wsparcia' 
                    ? "Opisz innowację. System skataloguje ją i znajdzie odpowiednią ścieżkę realizacji..."
                    : "Opisz koncepcję dla ROPS do realizacji zewnętrznej..."
                }
              />
              
              <div className="absolute bottom-3 right-3 flex items-center gap-3">
                <button 
                  id="landing-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-11 min-w-11 touch-manipulation bg-gray-400 text-white p-3.5 rounded-2xl shadow-md transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e58500] focus:ring-offset-transparent flex items-center justify-center disabled:cursor-wait"
                  aria-label="Przetwórz pomysł"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <ArrowUp className="w-5 h-5 stroke-[2.5px]" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Perimeter Bottom: Balanced Footer Typography */}
      <footer className="w-full px-4 py-6 sm:px-6 md:px-10 md:py-8 flex flex-col sm:flex-row justify-between items-center relative z-50 gap-4 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <span className="text-xs font-medium text-gray-400">System operacyjny gotowy</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-gray-400">
          <a href="#" className="hover:text-gray-800 transition-colors">Prywatność</a>
          <a href="#" className="hover:text-gray-800 transition-colors">Regulamin</a>
          <span className="text-gray-300 h-3 w-[1px] bg-gray-300 rounded-full"></span>
          <span>© 2026 ROPS</span>
        </div>
      </footer>
    </div>
  );
}