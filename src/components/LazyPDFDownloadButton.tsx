/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { User, Gestionnaire } from '@/types';
import UserPDFDocument from '@/components/UserPDFView';

interface LazyPDFDownloadButtonProps {
    user: User;
    gestionnaires: Gestionnaire[];
    className?: string;
}

const PdfIcon = ({ className = "h-5 w-5 mr-2" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
    </svg>
);

const LazyPDFDownloadButton: React.FC<LazyPDFDownloadButtonProps> = ({ user, gestionnaires, className }) => {
    const [isClient, setIsClient] = useState(false);
    const [shouldGenerate, setShouldGenerate] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Timeout de sécurité pour éviter le blocage infini
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (shouldGenerate) {
            timeout = setTimeout(() => {
                // Si après 15 secondes on est toujours là, c'est suspect
                // On ne peut pas savoir si c'est fini car PDFDownloadLink ne donne pas de callback onFinish
                // Mais on peut au moins afficher un warning ou reset
                console.warn("PDF generation taking too long");
            }, 15000);
        }
        return () => clearTimeout(timeout);
    }, [shouldGenerate]);

    if (!isClient) return null;

    if (error) {
        return (
            <div className="flex flex-col items-center">
                <span className="text-red-500 text-xs mb-1">Erreur PDF</span>
                <button
                    onClick={() => { setError(null); setShouldGenerate(false); }}
                    className="text-xs underline text-blue-600"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    // Si on n'a pas encore demandé la génération, on affiche un bouton simple
    if (!shouldGenerate) {
        return (
            <button
                onClick={() => setShouldGenerate(true)}
                className={className}
            >
                <PdfIcon /> Préparer le PDF
            </button>
        );
    }

    // Une fois cliqué, on monte le PDFDownloadLink qui va générer le document
    return (
        <PDFDownloadLink
            document={<UserPDFDocument user={user} gestionnairesList={gestionnaires} />}
            fileName={`fiche-${user.nom?.toLowerCase() || "usager"}-${user.prenom?.toLowerCase() || ""}.pdf`}
            className={className}
            onError={(err) => {
                console.error("PDF Generation Error:", err);
                setError("Erreur lors de la génération");
                setShouldGenerate(false);
            }}
        >
            {({ loading, error: linkError }) => {
                if (linkError) {
                    console.error("Link Error:", linkError);
                    // On ne peut pas mettre à jour l'état ici directement (render loop), mais on peut afficher l'erreur
                    return <span>Erreur</span>;
                }
                return (
                    <span className="flex items-center">
                        {loading ? (
                            <>
                                <svg className="animate-spin mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Génération...
                            </>
                        ) : (
                            <>
                                <PdfIcon /> Télécharger PDF
                            </>
                        )}
                    </span>
                );
            }}
        </PDFDownloadLink>
    );
};

export default LazyPDFDownloadButton;
