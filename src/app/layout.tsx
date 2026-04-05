import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Le Moulin d'Esneux — Portail Résidents",
  description: "Portail de gestion pour les résidents du Moulin d'Esneux à Esneux, Belgique.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
