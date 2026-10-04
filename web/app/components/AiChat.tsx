"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<string>("google/gemini-2.5-flash");
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if OpenRouter API key is configured
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data) => {
        setIsConfigured(data.configured);
        if (data.defaultModel) {
          setActiveModel(data.defaultModel);
        }
      })
      .catch(() => setIsConfigured(false));
  }, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setErrorMessage(null);

    // Placeholder for streaming assistant response
    const assistantMessageIndex = updatedMessages.length;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          model: activeModel,
          stream: true,
        }),
      });


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Błąd serwera (kod ${response.status})`
        );
      }

      if (!response.body) {
        throw new Error("Brak strumienia danych w odpowiedzi.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        setMessages((prev) => {
          const next = [...prev];
          if (next[assistantMessageIndex]) {
            next[assistantMessageIndex] = {
              ...next[assistantMessageIndex],
              content: accumulatedContent,
            };
          }
          return next;
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Błąd połączenia z AI";
      setErrorMessage(msg);
      // Remove empty assistant placeholder if failed
      setMessages((prev) =>
        prev.filter((_, idx) => idx !== assistantMessageIndex || prev[idx].content !== "")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-3xl mx-auto my-8 p-6 bg-neutral-900/80 border border-neutral-800 rounded-2xl shadow-2xl backdrop-blur-md text-neutral-100"
    >
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-neutral-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              AI Assistant
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700/80 font-mono">
              {activeModel}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Połączenie z modelem AI przez bramkę OpenRouter
          </p>
        </div>

        {/* Configuration Status Badge */}
        <div className="flex items-center gap-2">
          {isConfigured === null ? (
            <span className="text-xs text-neutral-500 animate-pulse">
              Sprawdzanie konfiguracji...
            </span>
          ) : isConfigured ? (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Klucz API aktywny
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Wymagany klucz w .env.local
            </span>
          )}
        </div>
      </div>

      {/* Warning when API key not configured */}
      {isConfigured === false && (
        <div className="mt-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-200 text-xs flex flex-col gap-1">
          <div className="font-semibold flex items-center gap-1.5">
            ⚠️ Brak klucza OPENROUTER_API_KEY
          </div>
          <p className="text-amber-300/80">
            Wklej swój klucz do pliku{" "}
            <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-100 font-mono">
              web/.env.local
            </code>{" "}
            jako:
          </p>
          <code className="bg-black/50 p-2 rounded text-neutral-200 font-mono text-[11px] overflow-x-auto select-all">
            OPENROUTER_API_KEY=sk-or-v1-twoj-klucz-tutaj
          </code>
        </div>
      )}


      {/* Chat Messages Area */}
      <div className="mt-4 h-80 overflow-y-auto pr-2 space-y-3.5 scrollbar-thin scrollbar-thumb-neutral-700">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
            <p className="text-sm font-medium text-neutral-400">
              Czat jest gotowy do rozmowy.
            </p>
            <p className="text-xs mt-1 text-neutral-500">
              Zadaj pytanie, aby przetestować integrację z OpenRouter API.
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="text-[10px] text-neutral-400 mb-1 px-1">
                {msg.role === "user" ? "Ty" : "AI"}
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-neutral-800 text-neutral-200 border border-neutral-700/60 rounded-bl-none shadow-sm"
                }`}
              >
                {msg.content || (isLoading && i === messages.length - 1 ? (
                  <span className="inline-flex items-center gap-1 text-neutral-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.4s]" />
                  </span>
                ) : (
                  ""
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="mt-3 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs">
          <strong>Błąd:</strong> {errorMessage}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Napisz wiadomość do AI..."
          disabled={isLoading}
          className="flex-1 bg-neutral-800/90 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <span>Wyślij</span>
          )}
        </button>
      </form>
    </motion.div>
  );
}
