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
          return {
            id: "dev-admin-1",
            email: "admin@dev.local",
            name: "Admin Développement",
            role: "ADMIN"
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
                role: gestionnaire.role
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
    async jwt({ token, user }) {
      // En mode développement, utiliser les données de l'utilisateur dev
      if (process.env.NODE_ENV === 'development' && user?.role) {
        token.gestionnaire = {
          id: 1,
          email: user.email,
          nom: user.name,
          role: user.role
        }
        token.role = user.role
        console.log(`🔑 JWT dev enrichi pour: ${user.email} (${user.role})`)
        return token
      }

      if (user && user.email) {
        const gestionnaire = await prisma.gestionnaire.findUnique({
          where: { email: user.email }
        })
        if (gestionnaire) {
          token.gestionnaire = gestionnaire
          token.role = gestionnaire.role
          console.log(`🔑 JWT enrichi pour: ${gestionnaire.email} (${gestionnaire.role})`)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.gestionnaire && session.user) {
        session.user.role = token.role as string
        session.user.gestionnaire = token.gestionnaire
        console.log(`👤 Session créée pour: ${session.user.email} (${session.user.role})`)
      }
      return session
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
