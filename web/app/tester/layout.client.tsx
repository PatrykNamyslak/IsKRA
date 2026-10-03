export default function page_index() {
  return (
    <>
      <nav className="flex items-center justify-between bg-green-300 px-8 py-4 shadow-md">
        <a
          href="/tester"
          className="text-xl px-5 py-3 font-bold tracking-tight text-gray-900 transition-colors hover:text-green-700 bg-green-400"
        >
          STRONA GŁÓWNA
        </a>

        <div className="flex items-center gap-2">
          <a
            href="/tester/innovations"
            className="rounded-lg px-4 py-2 font-medium text-gray-800 transition-all hover:bg-green-400 hover:text-gray-950"
          >
            PRZEGLĄDAJ INNOWACJE
          </a>
          <a
            href="/"
            className="rounded-lg px-4 py-2 font-medium text-gray-800 transition-all hover:bg-red-400 hover:text-gray-950 bg-red-700"
          >
            WYLOGUJ
          </a>
        </div>
      </nav>
    </>
  );
}