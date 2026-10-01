'use client'

import { motion } from "motion/react"

export default function SampleComponent() {
  return (
      <motion.h1 className={"text-center text-6xl pt-12 opacity-0"} animate={{ opacity: 1 }}>Hackyeah 2026</motion.h1>
  );
}
