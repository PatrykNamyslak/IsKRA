"use client";

import React, { useState } from 'react';
import { Sparkles, User, ArrowUp } from 'lucide-react';

type Mode = 'szukam-wsparcia' | 'zglaszam-pomysl';

export default function IsKRA() {
  const [activeMode, setActiveMode] = useState<Mode>('szukam-wsparcia');
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call to your backend
    try {
      console.log('Submitting to ROPS matching engine:', { mode: activeMode, prompt });
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Handle success (e.g., route to success page or show toast)
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
      <header className="w-full px-6 py-6 md:px-10 md:py-8 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-sm border border-gray-700/50 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4 text-[#e58500]" />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-semibold text-gray-900 tracking-tight leading-none">IsKRA</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-gray-200 text-gray-500 leading-none">ROPS</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">O systemie</a>
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Baza pomysłów</a>
          <button className="w-8 h-8 rounded-full bg-white/60 border border-white flex items-center justify-center hover:bg-white transition-colors shadow-sm text-gray-500">
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content: Optically Centered Command Center */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 relative z-10">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-gray-800 mb-6 text-center">
          Czego potrzebuje Twój projekt?
        </h1>

        {/* Liquid Glass Unified Panel */}
        <div 
          className="w-full bg-white/40 border border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-3 flex flex-col transition-all"
          style={{ backdropFilter: 'blur(40px) saturate(150%)', WebkitBackdropFilter: 'blur(40px) saturate(150%)' }}
        >
          {/* Segmented Control */}
          <div className="flex bg-black/[0.04] p-1 rounded-full mb-3" role="tablist">
            <button 
              onClick={() => setActiveMode('szukam-wsparcia')}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all focus:outline-none ${
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
              onClick={() => setActiveMode('zglaszam-pomysl')}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all focus:outline-none ${
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
            <form onSubmit={handleSubmit} className="relative group">
              <label htmlFor="ai-prompt" className="sr-only">Opisz swój pomysł</label>
              <textarea 
                id="ai-prompt"
                name="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-white/40 border border-white/50 focus:bg-white/70 focus:border-white rounded-[2rem] p-6 pr-20 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 resize-none min-h-[160px] text-[1.05rem] leading-relaxed shadow-inner transition-all duration-300 disabled:opacity-50"
                placeholder={
                  activeMode === 'szukam-wsparcia' 
                    ? "Opisz innowację. System skataloguje ją i znajdzie odpowiednią ścieżkę realizacji..."
                    : "Opisz koncepcję dla ROPS do realizacji zewnętrznej..."
                }
              />
              
              <div className="absolute bottom-3 right-3 flex items-center gap-3">
                <button 
                  type="submit"
                  disabled={isSubmitting || !prompt.trim()}
                  className="bg-[#e58500] hover:bg-[#cc7700] disabled:bg-gray-400 text-white p-3.5 rounded-2xl shadow-md transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e58500] focus:ring-offset-transparent flex items-center justify-center"
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
      </main>

      {/* Perimeter Bottom: Balanced Footer Typography */}
      <footer className="w-full px-6 py-6 md:px-10 md:py-8 flex flex-col md:flex-row justify-between items-center relative z-50 gap-4 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <span className="text-xs font-medium text-gray-400">System gotowy</span>
        </div>

        <div className="flex items-center gap-5 text-xs font-medium text-gray-400">
          <a href="#" className="hover:text-gray-800 transition-colors">Prywatność</a>
          <a href="#" className="hover:text-gray-800 transition-colors">Regulamin</a>
          <span className="text-gray-300 h-3 w-[1px] bg-gray-300 rounded-full"></span>
          <span>© 2026 ROPS</span>
        </div>
      </footer>
    </div>
  );
}