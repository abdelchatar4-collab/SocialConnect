'use client';

import React from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { User } from '@/types';

interface RgpdDocumentProps {
    user: User;
}

export const RgpdDocument: React.FC<RgpdDocumentProps> = ({ user }) => {
    const { logoUrl, serviceName, docRetentionPeriod, docAntenneAddresses, docServicePhone, docFooterText, docRgpdTitle, docRgpdSections } = useAdmin();

    // Adresse du service selon l'antenne (depuis les paramètres)
    const getServiceAddress = (antenne?: string | null) => {
        const a = antenne?.toLowerCase() || '';
        if (a.includes('cureghem') && docAntenneAddresses?.cureghem) {
            return docAntenneAddresses.cureghem;
        }
        if (a.includes('centre') && docAntenneAddresses?.centre) {
            return docAntenneAddresses.centre;
        }
        return docAntenneAddresses?.default || { rue: 'Rue du Chapelain, 2', cp: '1070 ANDERLECHT' };
    };

    const serviceAddr = getServiceAddress(user.antenne);

    // Calculate derived values
    const today = new Date().toLocaleDateString('fr-BE');
    const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim();

    // Adresse du bénéficiaire
    const addr = user.adresse || {};
    const street = `${addr.rue || ''} ${addr.numero || ''}`.trim();
    const city = `${addr.codePostal || ''} ${addr.ville || ''}`.trim();
    const fullAddress = [street, addr.boite ? `bte ${addr.boite}` : '', city].filter(Boolean).join(', ');

    // Section visibility helper
    const showSection = (key: string) => docRgpdSections?.[key] !== false;

    return (
        <div className="text-sm leading-relaxed text-justify font-sans text-black">
            {/* Header with Logo */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-4">
                <div className="w-1/2">
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt="Logo Service" className="h-20 object-contain object-left" />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src="/socialconnect-logo-final.png" alt="Logo Service" className="h-20 object-contain object-left" onError={(e) => e.currentTarget.style.display = 'none'} />
                    )}
                    {/* Fallback texte si pas d'image affichée */}
                    {!logoUrl && (
                        <div className="hidden text-2xl font-bold uppercase tracking-tighter text-gray-900 border-l-4 border-gray-900 pl-3 logo-fallback">
                            {serviceName || 'SERVICE SOCIAL'}
                        </div>
                    )}
                </div>
                <div className="w-1/2 text-right text-xs text-gray-600 font-medium">
                    <p className="font-bold uppercase text-sm text-black mb-1">{serviceName || 'ANDERLECHT PRÉVENTION'}</p>
                    <p>{serviceAddr.rue}</p>
                    <p>{serviceAddr.cp}</p>
                    {docServicePhone && <p className="mt-2">Tél: {docServicePhone}</p>}
                </div>
            </div>

            {/* Title */}
            <h1 className="text-lg font-bold text-center mb-8 uppercase px-8 leading-snug">
                {docRgpdTitle || 'Formulaire de consentement pour le traitement et l\'échange de données personnelles'}
            </h1>

            {/* Content Sections */}
            <div className="space-y-5">
                {showSection('intro') && (
                    <section>
                        <p className="mb-2 text-gray-700 italic text-xs border-l-2 border-gray-300 pl-3">
                            Le RGPD, ou Règlement Général sur la Protection des Données (UE 2016/679), est entré en vigueur le 25 mai 2018. Il vise à protéger les données personnelles et à responsabiliser les acteurs de leur traitement.
                        </p>
                    </section>
                )}

                {showSection('pourquoi') && (
                    <section>
                        <h2 className="font-bold text-black border-b border-gray-300 mb-2 uppercase text-xs tracking-wide">POURQUOI COLLECTE-T-ON VOS DONNÉES ?</h2>
                        <p>
                            Dans le cadre de la mission que vous souhaitez nous confier, notre service doit recueillir un certain nombre d'informations vous concernant.
                            Vos données (identité, coordonnées, situation sociale) sont utilisées pour toute démarche sociale nécessaire à la résolution de votre situation.
                        </p>
                        <p className="mt-2">
                            Ces données peuvent inclure des éléments sensibles si nécessaires (rapports, correspondances). Votre accord, explicite ou oral, est requis.
                            Nous agissons conformément aux règles européennes et nationales.
                        </p>
                    </section>
                )}

                <div className="grid grid-cols-2 gap-8">
                    {showSection('stockage') && (
                        <section>
                            <h2 className="font-bold text-black border-b border-gray-300 mb-2 uppercase text-xs tracking-wide">STOCKAGE ET SÉCURITÉ</h2>
                            <p>
                                Vos informations sont conservées (papier ou électronique) sous la responsabilité de votre référent, sur des serveurs sécurisés.
                                L'accès est restreint aux personnes habilitées, bien que des échanges sous secret professionnel partagé puissent avoir lieu dans votre intérêt.
                            </p>
                        </section>
                    )}

                    {showSection('conservation') && (
                        <section>
                            <h2 className="font-bold text-black border-b border-gray-300 mb-2 uppercase text-xs tracking-wide">DURÉE DE CONSERVATION</h2>
                            <p>
                                Les données sont conservées durant le traitement, puis archivées pour une durée maximale de <b>{docRetentionPeriod || '3 ans'}</b> après la clôture.
                                Vous pouvez demander à "récupérer" vos données personnelles à tout moment.
                            </p>
                        </section>
                    )}
                </div>

                {showSection('acces') && (
                    <section>
                        <h2 className="font-bold text-black border-b border-gray-300 mb-2 uppercase text-xs tracking-wide">QUI A ACCÈS ?</h2>
                        <p>
                            Votre référent social, son back-up éventuel, et si nécessaire (avec ce consentement) d'autres professionnels et services partenaires impliqués dans la résolution de votre situation.
                        </p>
                    </section>
                )}

                {/* SIGNATURE SECTION */}
                {showSection('signature') && (
                    <div className="mt-8 pt-4 border-t-2 border-gray-800 break-inside-avoid">
                        <h2 className="font-bold text-black bg-gray-100 p-2 mb-4 uppercase text-center tracking-widest">ACCORD DU BÉNÉFICIAIRE</h2>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-start">
                                <div className="w-6 h-6 border-2 border-gray-400 mr-3 flex-shrink-0"></div>
                                <p>Je suis le bénéficiaire.</p>
                            </div>
                            <div className="flex items-start">
                                <div className="w-6 h-6 border-2 border-gray-400 mr-3 flex-shrink-0"></div>
                                <p>Je déclare avoir lu et compris ce document.</p>
                            </div>
                            <div className="flex items-start">
                                <div className="w-6 h-6 border-2 border-gray-400 mr-3 flex-shrink-0"></div>
                                <p className="text-justify font-semibold">
                                    J'autorise le traitement et l'échange de mes données personnelles dans les conditions et finalités décrites ci-dessus.
                                    <span className="font-normal block mt-1 text-xs text-gray-600">Je comprends que je peux retirer ce consentement à tout moment par écrit.</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between mt-8 border-t border-gray-300 pt-6">
                            <div className="w-1/2 pr-4">
                                <p className="font-bold text-xs uppercase mb-2 text-gray-500">Bénéficiaire</p>
                                <p className="text-lg font-bold">{fullName || '____________________'}</p>
                                <p className="text-sm mt-1">{fullAddress}</p>
                            </div>
                            <div className="w-1/2 pl-8 border-l border-gray-300">
                                <p className="mb-4">Fait à Anderlecht, le <b>{today}</b></p>
                                <div className="h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 bg-gray-50">
                                    Signature
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer - en bas du contenu, pas fixe */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400">
                {docFooterText || 'Document généré par SocialConnect'} - {user.id}
            </div>
        </div>
    );
};
