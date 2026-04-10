import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nerolia — Appels d'offre automatisés",
  description: "Identifiez et répondez automatiquement aux appels d'offre grâce à l'IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900 min-h-screen font-satoshi">{children}</body>
    </html>
  );
}
