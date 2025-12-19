/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

console.log("<<<<< /api/auth/[...nextauth]/route.ts (UTILISE @/lib/authOptions) >>>>>");
import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions"; // Utiliser celui-ci
import type { NextApiHandler } from "next";

// Créer le handler avec une gestion d'erreur
let handler: ReturnType<typeof NextAuth>;
try {
  handler = NextAuth(authOptions);
  console.log("[NextAuth] Handler créé avec succès");
} catch (error) {
  console.error("[NextAuth] Erreur lors de la création du handler:", error);
  throw error;
}

export { handler as GET, handler as POST };

// Assurez-vous que le fichier @/lib/authOptions.ts exporte bien authOptions
// Exemple de @/lib/authOptions.ts :
// import { NextAuthOptions } from 'next-auth';
// // ... importez vos providers, adapters etc.
//
// export const authOptions: NextAuthOptions = {
//   providers: [
//     // ... vos providers
//   ],
//   // ... autres options
// };
