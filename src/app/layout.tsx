/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import './globals.css' // Assurez-vous que globals.css est importé
import '../features/dashboard/styles/pasq-premium.css' // PASQ Premium Styles
import { Inter } from 'next/font/google'
import Providers from '@/components/Providers' // Si vous avez un composant pour les providers globaux comme NextAuth

// Configuration de la police Inter
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Recommandé pour de meilleures performances de chargement
  variable: '--font-inter' // Optionnel: si vous voulez l'utiliser comme variable CSS
})

export const metadata = {
  title: 'Gestion Usagers - PASQ',
  description: 'Application de gestion des usagers pour PASQ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} font-sans`}> {/* Applique la variable de police et une classe de base */}
      <body>
        <Providers> {/* Enveloppez avec vos providers si nécessaire */}
          {/* Ici, vous pourriez utiliser votre composant src/components/Layout.tsx si vous voulez qu'il structure le body */}
          {/* OU vous mettez directement le Header/Footer/main ici si src/components/Layout.tsx n'est pas utilisé globalement */}
          {children}
        </Providers>
      </body>
    </html>
  )
}
