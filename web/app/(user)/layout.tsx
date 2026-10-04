import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import LayoutClient from "@/app/(user)/layout.client";
import Grainient from "@/app/components/Grainient";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hackyeah 2026",
  description: "",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pl"
      className={`${inter.variable} ${sourceCodePro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative bg-transparent">
        <div className="fixed inset-0 pointer-events-none -z-10 w-full h-full overflow-hidden">
          <Grainient />
        </div>
        <LayoutClient />
        <main className="flex-1 flex flex-col relative z-0">
          {children}
        </main>
      </body>
    </html>
  );
}
