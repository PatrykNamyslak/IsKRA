"use client";

import { Accessibility, RotateCcw } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "iskra-accessibility-settings";
const DEFAULT_SETTINGS = { textScale: 1, highContrast: false };
const DEFAULT_SNAPSHOT = JSON.stringify(DEFAULT_SETTINGS);
const CHANGE_EVENT = "iskra-accessibility-change";

type AccessibilitySettings = typeof DEFAULT_SETTINGS;

let fallbackSnapshot = DEFAULT_SNAPSHOT;

function getSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? fallbackSnapshot;
  } catch (error) {
    console.error("Nie udało się odczytać ustawień dostępności.", error);
    return fallbackSnapshot;
  }
}

function getServerSnapshot() {
  return DEFAULT_SNAPSHOT;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function saveSettings(settings: AccessibilitySettings) {
  fallbackSnapshot = JSON.stringify(settings);
  try {
    window.localStorage.setItem(STORAGE_KEY, fallbackSnapshot);
  } catch (error) {
    console.error("Nie udało się zapisać ustawień dostępności.", error);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function parseSettings(snapshot: string): AccessibilitySettings {
  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (!parsed || typeof parsed !== "object") return DEFAULT_SETTINGS;

    const settings = parsed as Partial<AccessibilitySettings>;
    return {
      textScale:
        typeof settings.textScale === "number"
          ? Math.min(1.75, Math.max(1, settings.textScale))
          : DEFAULT_SETTINGS.textScale,
      highContrast:
        typeof settings.highContrast === "boolean"
          ? settings.highContrast
          : DEFAULT_SETTINGS.highContrast,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function AccessibilityControls() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const settings = parseSettings(snapshot);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accessibility-text-scale", String(settings.textScale));
    root.dataset.highContrast = String(settings.highContrast);
  }, [settings.highContrast, settings.textScale]);

  const updateSettings = (changes: Partial<AccessibilitySettings>) => {
    saveSettings({ ...settings, ...changes });
  };

  const togglePanel = () => {
    setIsOpen((open) => !open);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[1000] sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          aria-label="Ustawienia dostępności"
          className="mb-3 w-[min(21rem,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white p-5 text-gray-900 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">Dostępność</h2>
              <p className="mt-1 text-xs text-gray-600">
                Ustaw wygląd strony według swoich potrzeb.
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateSettings(DEFAULT_SETTINGS)}
              className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
              aria-label="Przywróć domyślne ustawienia dostępności"
              title="Przywróć domyślne"
            >
              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="accessibility-text-scale" className="text-sm font-semibold">
                Rozmiar tekstu
              </label>
              <output htmlFor="accessibility-text-scale" className="text-sm tabular-nums text-gray-600">
                {Math.round(settings.textScale * 100)}%
              </output>
            </div>
            <input
              id="accessibility-text-scale"
              type="range"
              min="1"
              max="1.75"
              step="0.05"
              value={settings.textScale}
              onChange={(event) => updateSettings({ textScale: Number(event.target.value) })}
              className="mt-3 min-h-8 w-full cursor-pointer accent-indigo-600"
              aria-valuetext={`${Math.round(settings.textScale * 100)} procent`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>100%</span>
              <span>175%</span>
            </div>
          </div>

          <label className="mt-5 flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-200 px-3 py-2">
            <span>
              <span className="block text-sm font-semibold">Wysoki kontrast</span>
              <span className="mt-0.5 block text-xs text-gray-600">
                Ciemne tło i jasny tekst
              </span>
            </span>
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(event) => updateSettings({ highContrast: event.target.checked })}
              className="h-5 w-5 shrink-0 accent-indigo-600"
            />
          </label>
        </section>
      )}

      <button
        type="button"
        onClick={togglePanel}
        aria-label={isOpen ? "Zamknij ustawienia dostępności" : "Otwórz ustawienia dostępności"}
        aria-expanded={isOpen}
        className="ml-auto flex h-14 w-14 touch-manipulation items-center justify-center rounded-full border-2 border-white bg-indigo-700 text-white shadow-lg transition hover:scale-105 hover:bg-indigo-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
      >
        <Accessibility aria-hidden="true" className="h-7 w-7" />
      </button>
    </div>
  );
}
