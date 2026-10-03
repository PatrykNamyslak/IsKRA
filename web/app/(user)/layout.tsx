import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import LayoutClient from "@/app/(user)/layout.client";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pl"
      className={`${inter.variable} ${sourceCodePro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LayoutClient />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
