/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest, NextFetchEvent } from "next/server"

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
    const url = req.nextUrl.clone()
    const host = req.headers.get("host") || ""
    console.log(`[MIDDLEWARE] Host: ${host}, Path: ${url.pathname}, Cookies: ${req.cookies.get("from_prestations")?.value}`);

    // 1. Logic for PRESTATIONS subdomain (Runs BEFORE Auth)
    if (host.startsWith("prestations.")) {
        if (!url.pathname.startsWith("/prestations")) {
            url.pathname = "/prestations"
            const redirectResponse = NextResponse.redirect(url)

            // Determine root domain for cookie (to share between prestations.xxx and xxx)
            const rootDomain = host.replace("prestations.", "").split(':')[0]

            redirectResponse.cookies.set("from_prestations", "true", {
                httpOnly: true,
                maxAge: 60 * 5, // 5 minutes
                domain: process.env.NODE_ENV === 'production' ? `.${rootDomain}` : undefined
            })

            redirectResponse.headers.set("X-Middleware-Debug", "Redirecting-Prestations")
            return redirectResponse
        }
    }

    // 2. Logic for Redirect after Login (Runs BEFORE Auth check to intercept /dashboard)
    // If user lands on /dashboard or / and has the prestations cookie, redirect to /prestations
    if (url.pathname === "/dashboard" || url.pathname === "/") {
        const fromPrestations = req.cookies.get("from_prestations")?.value
        if (fromPrestations === "true") {
            url.pathname = "/prestations"
            const redirectResponse = NextResponse.redirect(url)
            // Clear the cookie after redirect
            redirectResponse.cookies.delete("from_prestations")
            // Debug header
            redirectResponse.headers.set("X-Middleware-Debug", "Redirecting-Dashboard-Cookie")
            return redirectResponse
        }
    }

    // 3. Chain to NextAuth middleware for authentication protection
    // We create a specific auth middleware instance with our config
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

    // Execute the auth middleware
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
         * - public files (logo, etc)
         */
        "/((?!api/auth|api/options|api/cron|dev-login|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
    ],
}
