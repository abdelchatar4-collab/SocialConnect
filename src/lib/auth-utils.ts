/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Auth Utilities for Multi-Tenancy
*/

import { Session } from "next-auth";
import { getGlobalClient } from "./prisma-clients";

/**
 * Récupère le serviceId réellement actif pour l'utilisateur.
 * Pour les SUPER_ADMIN/ADMIN, interroge la DB pour avoir la valeur la plus fraîche (lastActiveServiceId).
 * Pour les USER, utilise la valeur de la session.
 */
export async function getDynamicServiceId(session: Session | null): Promise<string> {
    if (!session?.user) return 'default';

    // Type casting pour éviter les erreurs de linter sur les propriétés dynamiques
    const user = session.user as any;
    const userRole = user.role;
    const sessionServiceId = user.serviceId || 'default';
    const email = user.email;

    if ((userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && email) {
        try {
            const dbUser = await getGlobalClient().gestionnaire.findUnique({
                where: { email: email },
                select: { lastActiveServiceId: true, serviceId: true }
            });

            return dbUser?.lastActiveServiceId || dbUser?.serviceId || sessionServiceId;
        } catch (error) {
            console.error("[getDynamicServiceId] Erreur critique de contexte:", error);
            return sessionServiceId;
        }
    }

    return sessionServiceId;
}
