import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PrintLayout } from '@/components/documents/PrintLayout';
import { RgpdDocument } from '@/features/users/components/documents/RgpdDocument';

interface RgpdPageProps {
    params: {
        id: string;
    };
}

export default async function RgpdPage({ params }: RgpdPageProps) {
    // Récupération de l'ID depuis les paramètres URL
    const { id } = params;

    // Récupération des données utilisateur complètes
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            adresse: true,
            // On peut inclure d'autres relations si nécessaire pour le document
        },
    });

    if (!user) {
        notFound();
    }

    // Conversion des dates pour éviter les erreurs de sérialisation (si nécessaire)
    // Prisma retourne des objets Date que Next.js Server Components peuvent gérer
    // mais parfois il est préférable de passer des objets simples aux Client Components.
    // Ici RgpdDocument attend un type User qui peut contenir des Dates,
    // mais pour être sûr, on peut laisser le composant gérer ou transformer ici.
    // Pour l'instant on passe user tel quel, si erreur de sérialisation on adaptera.

    return (
        <PrintLayout title={`Attestation RGPD - ${user.nom} ${user.prenom}`}>
            <RgpdDocument user={user as any} />
            {/* Le cast 'as any' est temporaire si le type Prisma diffère légèrement du type User frontend */}
        </PrintLayout>
    );
}
