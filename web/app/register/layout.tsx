import type { Metadata } from "next";
import "@payloadcms/next/css";

export const metadata: Metadata = {
  title: {
    default: "Rejestracja",
    template: "%s | IsKra Małopolska",
  },
  description: "Rejestracja w IsKra Małopolska.",
  applicationName: "IsKra Małopolska",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/iskra.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" data-theme="light">
      <body
        className="payload"
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        {children}
      </body>
    </html>
  );
}
