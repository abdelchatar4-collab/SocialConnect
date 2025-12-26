/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest, NextFetchEvent } from "next/server"

// 3. Instance statique du middleware NextAuth pour éviter les re-créations à chaque requête
const authMiddleware = withAuth(
    function onSuccess(req) {
        return NextResponse.next()
    },
    {
        pages: {
            signIn: "/dev-login",
        },
    }
)

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
    const url = req.nextUrl.clone()
    const host = req.headers.get("host") || ""

    // 1. Logic for PRESTATIONS subdomain (Runs BEFORE Auth)
    if (host.startsWith("prestations.")) {
        if (!url.pathname.startsWith("/prestations")) {
            url.pathname = "/prestations"
            const redirectResponse = NextResponse.redirect(url)

            const rootDomain = host.replace("prestations.", "").split(':')[0]

            redirectResponse.cookies.set("from_prestations", "true", {
                httpOnly: true,
                maxAge: 60 * 5, // 5 minutes
                domain: process.env.NODE_ENV === 'production' ? `.${rootDomain}` : undefined
            })

            return redirectResponse
        }
    }

    // 2. Logic for Redirect after Login
    if (url.pathname === "/dashboard" || url.pathname === "/") {
        const fromPrestations = req.cookies.get("from_prestations")?.value
        if (fromPrestations === "true") {
            url.pathname = "/prestations"
            const redirectResponse = NextResponse.redirect(url)
            redirectResponse.cookies.delete("from_prestations")
            return redirectResponse
        }
    }

    // 3. Si c'est la racine, on ne protège pas (la page d'accueil gère son propre état session)
    // Cela évite les boucles de redirection avec Playwright et les health checks
    if (url.pathname === "/") {
        return NextResponse.next()
    }

    // 4. Exécuter le middleware NextAuth pour les autres routes
    return authMiddleware(req as any, event as any)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (NextAuth API routes)
         * - api/options (Options API)
         * - api/cron (Cron API)
         * - dev-login (Login page)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - index.html (eviter les boucles)
         * - public files (images, etc)
         */
        "/((?!api/auth|api/options|api/cron|dev-login|_next/static|_next/image|favicon.ico|index\\.html|.*\\.png$|.*\\.svg$).*)",
    ],
}
