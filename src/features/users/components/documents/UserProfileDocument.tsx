'use client';

import React from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { User } from '@/types';

interface UserProfileDocumentProps {
    user: User;
}

export const UserProfileDocument: React.FC<UserProfileDocumentProps> = ({ user }) => {
    const { logoUrl, serviceName, docAntenneAddresses, docFooterText, docUserProfileSections } = useAdmin();

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
    const today = new Date().toLocaleDateString('fr-BE');
    const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim();

    // Adresse du bénéficiaire
    const addr = user.adresse || {};
    const street = `${addr.rue || ''} ${addr.numero || ''}`.trim();
    const city = `${addr.codePostal || ''} ${addr.ville || ''}`.trim();
    const fullAddress = [street, addr.boite ? `bte ${addr.boite}` : '', city].filter(Boolean).join(', ');

    // Date formatting helper
    const formatDate = (date: string | Date | null | undefined) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('fr-BE');
        } catch {
            return 'N/A';
        }
    };

    // Section visibility helper
    const showSection = (key: string) => docUserProfileSections?.[key] !== false;

    return (
        <div className="text-sm leading-relaxed font-sans text-black">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 border-b-2 border-gray-800 pb-4">
                <div className="w-1/2">
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt="Logo Service" className="h-16 object-contain object-left" />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src="/socialconnect-logo-final.png" alt="Logo Service" className="h-16 object-contain object-left" onError={(e) => e.currentTarget.style.display = 'none'} />
                    )}
                </div>
                <div className="w-1/2 text-right text-xs text-gray-600 font-medium">
                    <p className="font-bold uppercase text-sm text-black mb-1">{serviceName || 'ANDERLECHT PRÉVENTION'}</p>
                    <p>{serviceAddr.rue}</p>
                    <p>{serviceAddr.cp}</p>
                </div>
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-center mb-6 uppercase bg-gray-100 py-3 rounded">
                Fiche Usager : {fullName}
            </h1>
            <p className="text-center text-xs text-gray-500 mb-6">Dossier N° {user.id} — Imprimé le {today}</p>

            {/* Content Grid */}
            <div className="space-y-6">
                {/* Section Identité */}
                {showSection('identite') && (
                    <section>
                        <h2 className="font-bold text-black bg-blue-100 px-3 py-1 rounded mb-3 uppercase text-xs tracking-wide">Identité</h2>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            <div><span className="text-gray-500">Nom :</span> <span className="font-medium">{user.nom || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Prénom :</span> <span className="font-medium">{user.prenom || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Date de naissance :</span> <span className="font-medium">{formatDate(user.dateNaissance)}</span></div>
                            <div><span className="text-gray-500">Genre :</span> <span className="font-medium">{user.genre || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Nationalité :</span> <span className="font-medium">{user.nationalite || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Statut séjour :</span> <span className="font-medium">{user.statutSejour || 'N/A'}</span></div>
                        </div>
                    </section>
                )}

                {/* Section Contact */}
                {showSection('contact') && (
                    <section>
                        <h2 className="font-bold text-black bg-green-100 px-3 py-1 rounded mb-3 uppercase text-xs tracking-wide">Contact</h2>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            <div><span className="text-gray-500">Adresse :</span> <span className="font-medium">{fullAddress || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Téléphone :</span> <span className="font-medium">{user.telephone || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Email :</span> <span className="font-medium">{user.email || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Langue(s) :</span> <span className="font-medium">{user.langue || 'N/A'}</span></div>
                        </div>
                    </section>
                )}

                {/* Section Situation */}
                {showSection('situationSociale') && (
                    <section>
                        <h2 className="font-bold text-black bg-yellow-100 px-3 py-1 rounded mb-3 uppercase text-xs tracking-wide">Situation Professionnelle</h2>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            <div><span className="text-gray-500">Situation :</span> <span className="font-medium">{user.situationProfessionnelle || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Revenus :</span> <span className="font-medium">{user.revenus || 'N/A'}</span></div>
                        </div>
                    </section>
                )}

                {/* Section Gestion */}
                {showSection('gestion') && (
                    <section>
                        <h2 className="font-bold text-black bg-purple-100 px-3 py-1 rounded mb-3 uppercase text-xs tracking-wide">Gestion du Dossier</h2>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            <div><span className="text-gray-500">Gestionnaire :</span> <span className="font-medium">{typeof user.gestionnaire === 'string' ? user.gestionnaire : (user.gestionnaire?.nom ? `${user.gestionnaire.prenom || ''} ${user.gestionnaire.nom}` : 'N/A')}</span></div>
                            <div><span className="text-gray-500">Antenne :</span> <span className="font-medium">{user.antenne || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Date ouverture :</span> <span className="font-medium">{formatDate(user.dateOuverture)}</span></div>
                        </div>
                    </section>
                )}

                {/* Section Logement (if available) */}
                {showSection('logement') && user.logementDetails && typeof user.logementDetails === 'object' && (
                    <section>
                        <h2 className="font-bold text-black bg-orange-100 px-3 py-1 rounded mb-3 uppercase text-xs tracking-wide">Logement</h2>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                            <div><span className="text-gray-500">Type logement :</span> <span className="font-medium">{(user.logementDetails as any).typeLogement || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Statut logement :</span> <span className="font-medium">{(user.logementDetails as any).statutLogement || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Loyer :</span> <span className="font-medium">{(user.logementDetails as any).loyer ? `${(user.logementDetails as any).loyer}€` : 'N/A'}</span></div>
                            <div><span className="text-gray-500">Charges :</span> <span className="font-medium">{(user.logementDetails as any).charges ? `${(user.logementDetails as any).charges}€` : 'N/A'}</span></div>
                        </div>
                    </section>
                )}

                {/* Section Notes */}
                {showSection('notes') && (user.remarques || user.notesGenerales || user.informationImportante) && (
                    <section className="break-inside-avoid">
                        <h2 className="font-bold text-black bg-red-100 px-3 py-1 rounded mb-3 uppercase text-xs tracking-wide">Notes et Remarques</h2>
                        <div className="space-y-2 text-sm">
                            {user.informationImportante && (
                                <div className="p-2 bg-red-50 border-l-4 border-red-500 rounded">
                                    <p className="font-bold text-red-700 text-xs mb-1">⚠️ INFORMATION IMPORTANTE</p>
                                    <p>{user.informationImportante}</p>
                                </div>
                            )}
                            {user.remarques && (
                                <div>
                                    <p className="text-gray-500 font-medium">Remarques :</p>
                                    <p className="whitespace-pre-wrap">{user.remarques}</p>
                                </div>
                            )}
                            {user.notesGenerales && (
                                <div>
                                    <p className="text-gray-500 font-medium">Notes générales :</p>
                                    <p className="whitespace-pre-wrap">{user.notesGenerales}</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-300 text-center text-[10px] text-gray-400">
                {docFooterText || 'Document généré par SocialConnect'} — {user.id}
            </div>
        </div>
    );
};
