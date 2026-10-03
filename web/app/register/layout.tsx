import type { Metadata } from "next";
import "@payloadcms/next/css";

export const metadata: Metadata = {
  title: "Register | Payload CMS",
  description: "Register account in Payload CMS",
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
