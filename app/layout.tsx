import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-app", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SPPD Online",
  description: "Administrasi perjalanan dinas dalam dan luar daerah.",
  other: { "codex-preview": "development" },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
