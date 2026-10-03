'use client'

import { motion } from "motion/react"

export default function page_index() {
  return (
    <>
      <motion.nav className="flex items-center justify-between bg-yellow-300 px-8 py-4 shadow-md">
        <motion.a
          href="/"
          className="text-xl px-5 py-3 font-bold tracking-tight text-gray-900 transition-colors hover:text-yellow-700 bg-yellow-400"
        >
          STRONA GŁÓWNA
        </motion.a>

        <div className="flex items-center gap-2">
          <motion.a
            href="/form"
            className="rounded-lg px-4 py-2 font-medium text-gray-800 transition-all hover:bg-yellow-400 hover:text-gray-950"
          >
            FORMULARZ
          </motion.a>

          <motion.a
            href="/innovations"
            className="rounded-lg px-4 py-2 font-medium text-gray-800 transition-all hover:bg-yellow-400 hover:text-gray-950"
          >
            PRZEGLĄDAJ INNOWACJE
          </motion.a>
        </div>
      </motion.nav>
    </>
  );
}