/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

// filepath: src/app/api/get-cf-user/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  console.log("[API /api/get-cf-user] Requête GET reçue.");
  console.log("[DEBUG] NODE_ENV actuel:", process.env.NODE_ENV);

  if (process.env.NODE_ENV === 'development') {
    const mockEmail = "akc69@hotmail.fr";
    console.warn(`[API /api/get-cf-user] MODE DÉVELOPPEMENT: Retour d'un email de test: ${mockEmail}`);
    return NextResponse.json({ email: mockEmail });
  } else {
    const headersList = headers();
    const userEmail = headersList.get('Cf-Access-Authenticated-User-Email');

    // LOG TEMPORAIRE: Afficher tous les headers pour diagnostic
    console.log("[DEBUG] Tous les headers reçus:");
    headersList.forEach((value, key) => {
      if (key.toLowerCase().includes('cf') || key.toLowerCase().includes('cloudflare')) {
        console.log(`${key}: ${value}`);
      }
    });

    if (userEmail) {
      console.log("[API /api/get-cf-user] Email Cloudflare trouvé dans les headers:", userEmail);
      return NextResponse.json({ email: userEmail });
    } else {
      console.warn("[API /api/get-cf-user] ATTENTION: Header 'Cf-Access-Authenticated-User-Email' NON TROUVÉ en mode production.");
      return new NextResponse('Header utilisateur Cloudflare requis non trouvé.', { status: 400 });
    }
  }
}
