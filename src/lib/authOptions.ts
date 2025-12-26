/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  // Supprimer l'adaptateur Prisma pour utiliser JWT
  // adapter: process.env.NODE_ENV === 'production' ? PrismaAdapter(prisma) : undefined,
  providers: [
    // Provider de développement - bypass automatique avec droits admin
    ...(process.env.NODE_ENV === 'development' ? [
      CredentialsProvider({
        id: "dev-admin",
        name: "Dev Admin",
        credentials: {
          email: { label: "Email", type: "email", placeholder: "admin@dev.local" }
        },
        async authorize(credentials) {
          // En mode dev, créer automatiquement un utilisateur admin
          // Bascule dynamique selon l'email
          const isMediation = credentials?.email === "mediation@dev.local";
          const serviceId = isMediation ? "mediation" : "default";
          const name = isMediation ? "Admin Médiation" : "Admin Développement";

          return {
            id: isMediation ? "dev-mediation-1" : "dev-admin-1",
            email: credentials?.email || "admin@dev.local",
            name: name,
            role: "SUPER_ADMIN",
            serviceId: serviceId
          }
        }
      })
    ] : []),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Ajouter le provider Cloudflare Access
    ...(process.env.NODE_ENV === 'production' || process.env.ENABLE_CLOUDFLARE_DEV === 'true' ? [
      CredentialsProvider({
        id: "cloudflare-access",
        name: "Cloudflare Access",
        credentials: {},
        async authorize(credentials, req) {
          // Vérifier les headers Cloudflare Access
          const cfAccessJwt = req.headers?.['cf-access-jwt-assertion']
          const cfAccessEmail = req.headers?.['cf-access-authenticated-user-email']

          if (cfAccessJwt && cfAccessEmail) {
            // Vérifier que l'email est autorisé dans la base
            const gestionnaire = await prisma.gestionnaire.findUnique({
              where: { email: cfAccessEmail as string }
            })

            if (gestionnaire) {
              return {
                id: gestionnaire.id.toString(),
                email: gestionnaire.email,
                name: gestionnaire.nom,
                role: gestionnaire.role,
                serviceId: gestionnaire.serviceId
              }
            }
          }
          return null
        }
      })
    ] : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Provider dev-admin : toujours autoriser en développement
      if (account?.provider === "dev-admin") {
        console.log(`✅ Dev admin autorisé: ${user.email}`);
        return true;
      }

      // Provider cloudflare-access : déjà validé dans authorize()
      if (account?.provider === "cloudflare-access") {
        console.log(`✅ Cloudflare Access autorisé: ${user.email}`);
        return true;
      }

      // Provider Google : vérifier dans la base de données
      if (account?.provider === "google" && user.email) {
        const gestionnaire = await prisma.gestionnaire.findUnique({
          where: { email: user.email }
        })

        if (gestionnaire) {
          console.log(`✅ Gestionnaire Google autorisé: ${gestionnaire.email} (${gestionnaire.role})`)
          return true
        } else {
          console.log(`❌ Email Google non autorisé: ${user.email}`)
          return false
        }
      }

      // Tout autre cas : refuser
      console.log(`❌ Provider non reconnu ou email manquant`);
      return false
    },
    async jwt({ token, user, trigger, session }) {
      // Pour les mises à jour manuelles de session (update())
      if (trigger === "update" && session) {
        // On pourrait passer des données via session, mais on préfère re-fetcher de la DB pour être sûr
        console.log("🔄 Trigger Update détecté");
      }

      // Preserve user ID from initial login
      if (user) {
        token.id = user.id;
      }

      // 1. Récupérer l'émail (soit du user login, soit du token existant)
      const email = user?.email || token?.email;

      // 2. Si on a un email, on va chercher les données fraîches en base
      // Cela permet de mettre à jour le rôle ou le serviceId à chaque rafraichissement du token
      if (email) {
        const gestionnaire = await prisma.gestionnaire.findUnique({
          where: { email: email }
        });

        if (gestionnaire) {
          // Mise à jour du token avec les données DB fraîches
          token.id = gestionnaire.id; // Override with DB ID if exists
          token.gestionnaire = gestionnaire;
          token.role = gestionnaire.role;
          token.email = gestionnaire.email; // S'assurer que l'email est persistant

          // ✨ SUPPORT SERVICE SWITCHING
          // Priorité : lastActiveServiceId (DB) > serviceId (DB)
          token.serviceId = gestionnaire.lastActiveServiceId || gestionnaire.serviceId;

          console.log(`🔑 JWT refresh pour: ${email} (Service actif: ${token.serviceId})`);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string); // Ensure ID is passed
        session.user.role = token.role as string;
        (session.user as any).serviceId = token.serviceId as string;
        (session.user as any).gestionnaire = token.gestionnaire; // Use type assertion if needed

        if (token.gestionnaire) {
          console.log(`👤 Session créée pour: ${session.user.email} (ID: ${session.user.id} - Role: ${session.user.role})`);
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Si on vient du subdomain prestations, toujours rediriger vers /prestations
      if (baseUrl.includes('prestations.')) {
        return `${baseUrl}/prestations`;
      }

      // Comportement par défaut : vérifier si l'URL est relative ou du même domaine
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    }

  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/dev-login',
    error: '/dev-login', // Rediriger vers login en cas d'erreur aussi
  },
  debug: process.env.NODE_ENV === "development",
}
