import Link from "next/link";
import {BeakerIcon, DocumentChartBarIcon, MagnifyingGlassIcon} from "@heroicons/react/24/outline";

type SiteHeaderProps = {
  audience: "user" | "organizer" | "research";
};

export default function SiteHeader({ audience }: SiteHeaderProps) {
  const isOrganizer = audience === "organizer";
  const isResearch = audience === "research";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <nav
        aria-label="Nawigacja główna"
        className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-8"
      >
        <Link
          href="/"
          aria-label="Przejdź do strony głównej"
          className="flex h-12 w-32 shrink-0 items-center align-middle sm:w-40 text-3xl font-extrabold"
        >
          <svg
              className="size-12"
              xmlns="http://www.w3.org/2000/svg"
              width="120.96pt"
              height="133.92pt"
              viewBox="0 0 120.96 133.92"
          >
            <defs>
              <linearGradient
                  id="gradient0"
                  gradientUnits="objectBoundingBox"
                  x1="0.913308590132904"
                  y1="-0.0161287894590365"
                  x2="0.354146203073112"
                  y2="1.19533756122675"
                  spreadMethod="pad"
              >
                <stop stopColor="#ffa100" offset="0" stopOpacity="1" />
                <stop stopColor="#d02323" offset="1" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path
                id="shape01"
                transform="matrix(-1 0 0 1 121.051 -0.000991999999996551)"
                fill="url(#gradient0)"
                strokeOpacity="0"
                stroke="#000000"
                strokeWidth="0"
                strokeLinecap="square"
                strokeLinejoin="bevel"
                d="M60.571 0C70.3304 31.5237 78.251 63.9571 121.142 75.242C91.5758 84.3703 80.9112 108.8 71.102 133.922C73.7159 109.911 76.6722 85.9301 60.571 59.58C44.4698 85.9301 47.4261 109.907 50.04 133.918C40.2308 108.796 29.5662 84.3663 0 75.238C42.891 63.9531 50.8116 31.5237 60.571 0Z"
            />
          </svg>
          ISKRA
        </Link>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {!isOrganizer && (
            <Link
                href="/innovations"
                className="rounded-lg px-3 py-2 flex flex-row gap-1 align-middle text-md font-semibold text-gray-900 transition-colors hover:bg-gray-100 hover:underline sm:px-4"
            >
              <MagnifyingGlassIcon className="size-6"></MagnifyingGlassIcon>
              Szukam Innowacji
            </Link>
          )}
          {!isResearch && (
              <Link
                  href={isOrganizer ? "/organizer/innovations" : "/form"}
                  className="rounded-lg px-3 py-2 flex flex-row gap-1 align-middle text-md font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:underline sm:inline-flex"
              >
                <DocumentChartBarIcon className="size-6"></DocumentChartBarIcon>
                {isOrganizer ? "Hub Innowacji" : "Zgłoś Innowację"}
              </Link>
          )}
          <Link
              href={isResearch ? "/research/hub" : "/research"}
              className="rounded-lg px-3 py-2 flex flex-row gap-1 align-middle text-md font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:underline sm:inline-flex"
          >
            <BeakerIcon className="size-6"></BeakerIcon>
            {(isOrganizer || isResearch) ? "Hub Testów" : "Chcę\u00A0zostać testerem"}
          </Link>


          {isOrganizer ? (
            <Link
              href="/"
              className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 sm:px-4"
            >
              Wyloguj
            </Link>
          ) : (
            <details className="group relative">
              <summary className="cursor-pointer list-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-nowrap font-semibold text-gray-800 transition-colors hover:bg-gray-100 sm:px-4">
                Zaloguj się
              </summary>
              <div className="absolute right-0 top-full mt-2 flex min-w-48 flex-col rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                <Link
                  href="/login/organizer"
                  className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Jako organizacja
                </Link>
                <Link
                  href="/login/tester"
                  className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Jako tester
                </Link>
              </div>
            </details>
          )}
        </div>
        {/*TODO: Burgerek*/}
      </nav>
    </header>
  );
}
