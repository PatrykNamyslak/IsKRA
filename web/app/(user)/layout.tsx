import type { Metadata, Viewport } from "next";
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
  title: {
    default: "IsKra Małopolska",
    template: "%s | IsKra Małopolska",
  },
  description: "Wsparcie i baza pomysłów dla projektów społecznych.",
  manifest: "/manifest.json",
  applicationName: "IsKra Małopolska",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IsKra",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/iskra-icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f5f7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pl"
      className={`${inter.variable} ${sourceCodePro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative bg-transparent">
        <div className="fixed inset-0 pointer-events-none -z-10 w-full h-full overflow-hidden">
          <Grainient
            color1="#d9d9d9"
            color2="#c6bda9"
            color3="#e7e7e7"
            timeSpeed={0}
            colorBalance={0.04}
            warpStrength={1}
            warpFrequency={10.3}
            warpSpeed={2.5}
            warpAmplitude={16}
            blendAngle={0}
            blendSoftness={0.05}
            rotationAmount={320}
            noiseScale={2}
            grainAmount={0.1}
            grainScale={0.2}
            grainAnimated={false}
            contrast={1.15}
            gamma={1.2}
            saturation={2.05}
            centerX={0}
            centerY={0}
            zoom={1.45}
          />
        </div>
        <LayoutClient />
        <main className="flex-1 flex flex-col relative z-0">
          {children}
        </main>
      </body>
    </html>
  );
}
