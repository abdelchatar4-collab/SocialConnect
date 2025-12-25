import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PrintLayout } from '@/components/documents/PrintLayout';
import { UserProfileDocument } from '@/features/users/components/documents/UserProfileDocument';

interface UserProfilePageProps {
    params: {
        id: string;
    };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
    const { id } = params;

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            adresse: true,
            gestionnaire: true,
        },
    });

    if (!user) {
        notFound();
    }

    // Construire le nom du gestionnaire si c'est une relation
    const userWithGestionnaire = {
        ...user,
        gestionnaire: user.gestionnaire
            ? `${user.gestionnaire.prenom || ''} ${user.gestionnaire.nom || ''}`.trim()
            : null,
    };

    return (
        <PrintLayout title={`Fiche Usager - ${user.prenom} ${user.nom}`}>
            <UserProfileDocument user={userWithGestionnaire as any} />
        </PrintLayout>
    );
}
