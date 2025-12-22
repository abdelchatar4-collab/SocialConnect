/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React, { useEffect } from 'react';
import { formatDate } from '@/utils/formatters';

interface User {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  genre?: string;
  nationalite?: string;
  langueEntretien?: string;
  telephone?: string;
  email?: string;
  adresse: {
    rue: string;
    codePostal: string;
    ville: string;
    pays: string;
  };
  statutSejour?: string;
  dateOuverture: string;
  dateCloture?: string;
  etat: string;
  antenne: string;
  gestionnaire: string | { nom?: string; prenom?: string; id?: string };
  secteur?: string;
  premierContact?: string;
  importedAt?: string; // Champ pour les enregistrements importés
  problematiques: Array<{
    type: string;
    detail?: string;
  }>;
  actions: Array<{
    date: string;
    type: string;
    partenaire?: string;
    description?: string;
  }>;
  // PrevExp fields
  hasPrevExp?: boolean;
  prevExpDateVad?: string;
  prevExpDateAudience?: string;
  prevExpDateJugement?: string;
  prevExpDateSignification?: string;
  prevExpDateExpulsion?: string;
  prevExpTypeFamille?: string;
  prevExpTypeRevenu?: string;
  prevExpEtatLogement?: string;
  prevExpDemandeCpas?: string;
  prevExpNegociationProprio?: string;
  prevExpSolutionRelogement?: string;
  prevExpCommentaire?: string;
}

interface PrintPreviewProps {
  user: User;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ user }) => {
  // Suppression de la fonction locale incorrecte :
  // const formatDate = (date: string) => {
  //   if (!date) return '';
  //   return new Date(date).toLocaleDateString('fr-BE');
  // };


  // Helper function to format gestionnaire name
  const getGestionnaireName = (gestionnaire: string | { nom?: string; prenom?: string; id?: string } | undefined): string => {
    if (!gestionnaire) return 'Non spécifié';
    if (typeof gestionnaire === 'string') return gestionnaire;
    if (typeof gestionnaire === 'object') {
      const fullName = `${gestionnaire.prenom || ''} ${gestionnaire.nom || ''}`.trim();
      return fullName || gestionnaire.id || 'Non spécifié';
    }
    return 'Non spécifié';
  };

  return (
    <div className="print-preview p-8">
      <h2 className="text-2xl font-bold mb-6">Fiche usager - {user.id}</h2>

      {/* Informations personnelles */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">Informations personnelles</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><span className="font-semibold">Nom:</span> {user.nom}</p>
            <p><span className="font-semibold">Prénom:</span> {user.prenom}</p>
            <p><span className="font-semibold">Date de naissance:</span> {formatDate(user.dateNaissance)}</p>
            <p><span className="font-semibold">Genre:</span> {user.genre || 'Non spécifié'}</p>
          </div>
          <div>
            <p><span className="font-semibold">Nationalité:</span> {user.nationalite || 'Non spécifié'}</p>
            <p><span className="font-semibold">Langue d'entretien:</span> {user.langueEntretien || 'Non spécifié'}</p>
            <p><span className="font-semibold">Téléphone:</span> {user.telephone || 'Non spécifié'}</p>
            <p><span className="font-semibold">Email:</span> {user.email || 'Non spécifié'}</p>
          </div>
        </div>
      </div>

      {/* Informations administratives */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">Informations administratives</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><span className="font-semibold">Antenne:</span> {user.antenne}</p>
            <p><span className="font-semibold">Gestionnaire:</span> {getGestionnaireName(user.gestionnaire)}</p>
            <p><span className="font-semibold">Secteur:</span> {user.secteur || 'Non spécifié'}</p> {/* Ajout du secteur */}
            <p><span className="font-semibold">État du dossier:</span> {user.etat}</p>
          </div>
          <div>
            <p><span className="font-semibold">Date d'ouverture:</span> {formatDate(user.dateOuverture)}</p>
            {user.dateCloture && (
              <p><span className="font-semibold">Date de clôture:</span> {formatDate(user.dateCloture)}</p>
            )}
            <p><span className="font-semibold">Premier contact:</span> {user.premierContact || 'Non spécifié'}</p>
            <p><span className="font-semibold">Statut de séjour:</span> {user.statutSejour || 'Non spécifié'}</p>
          </div>
        </div>
      </div>

      {/* Problématiques */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">Problématiques</h3>
        <ul className="list-disc pl-5">
          {user.problematiques.map((prob, index) => (
            <li key={index}>
              {prob.type} {prob.detail ? `- ${prob.detail}` : ''}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">Actions</h3>
        <ul className="list-disc pl-5">
          {user.actions.map((action, index) => (
            <li key={index}>
              {formatDate(action.date)} - {action.type}
              {action.partenaire && ` avec ${action.partenaire}`}
              {action.description && `: ${action.description}`}
            </li>
          ))}
        </ul>
      </div>

      {/* Prévention Expulsion - CONDITIONNEL */}
      {user.hasPrevExp && (
        <div className="mb-6 border-2 border-blue-200 rounded-lg overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
            <h3 className="font-bold text-blue-900">🏠 Procédures & Prévention Expulsion</h3>
          </div>
          <div className="p-4">
            {/* Synthèse Sociale */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {user.prevExpTypeFamille && (
                <div>
                  <p className="text-sm font-semibold text-gray-600">Famille</p>
                  <p className="text-sm">{user.prevExpTypeFamille}</p>
                </div>
              )}
              {user.prevExpTypeRevenu && (
                <div>
                  <p className="text-sm font-semibold text-gray-600">Revenus</p>
                  <p className="text-sm">{user.prevExpTypeRevenu}</p>
                </div>
              )}
              {user.prevExpEtatLogement && (
                <div>
                  <p className="text-sm font-semibold text-gray-600">État logement</p>
                  <p className="text-sm">{user.prevExpEtatLogement}</p>
                </div>
              )}
            </div>

            {/* Bloc Financier */}
            {(user.prevExpDemandeCpas || user.prevExpNegociationProprio) && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm font-semibold text-gray-700 mb-2">Démarches financières</p>
                <div className="grid grid-cols-2 gap-4">
                  {user.prevExpDemandeCpas && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Demande CPAS</p>
                      <p className="text-sm">{user.prevExpDemandeCpas}</p>
                    </div>
                  )}
                  {user.prevExpNegociationProprio && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Négociation propriétaire</p>
                      <p className="text-sm">{user.prevExpNegociationProprio}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline Juridique */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Timeline juridique</p>
              <div className="flex flex-wrap gap-2">
                {user.prevExpDateVad && (
                  <div className="flex-1 min-w-[100px] p-2 bg-gray-100 rounded">
                    <p className="text-xs text-gray-600">VAD</p>
                    <p className="text-sm font-bold">{formatDate(user.prevExpDateVad)}</p>
                  </div>
                )}
                {user.prevExpDateAudience && (
                  <div className="flex-1 min-w-[100px] p-2 bg-gray-100 rounded">
                    <p className="text-xs text-gray-600">Audience</p>
                    <p className="text-sm font-bold">{formatDate(user.prevExpDateAudience)}</p>
                  </div>
                )}
                {user.prevExpDateJugement && (
                  <div className="flex-1 min-w-[100px] p-2 bg-gray-100 rounded">
                    <p className="text-xs text-gray-600">Jugement</p>
                    <p className="text-sm font-bold">{formatDate(user.prevExpDateJugement)}</p>
                  </div>
                )}
                {user.prevExpDateSignification && (
                  <div className="flex-1 min-w-[100px] p-2 bg-gray-100 rounded">
                    <p className="text-xs text-gray-600">Signification</p>
                    <p className="text-sm font-bold">{formatDate(user.prevExpDateSignification)}</p>
                  </div>
                )}
                {user.prevExpDateExpulsion && (
                  <div className={`flex-1 min-w-[100px] p-2 rounded border-2 ${new Date(user.prevExpDateExpulsion) > new Date()
                    ? 'bg-red-50 border-red-600'
                    : 'bg-gray-100 border-transparent'
                    }`}>
                    <p className={`text-xs font-bold ${new Date(user.prevExpDateExpulsion) > new Date()
                      ? 'text-red-600'
                      : 'text-gray-600'
                      }`}>⚠ EXPULSION</p>
                    <p className={`text-sm font-bold ${new Date(user.prevExpDateExpulsion) > new Date()
                      ? 'text-red-600'
                      : 'text-gray-900'
                      }`}>{formatDate(user.prevExpDateExpulsion)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Solution de relogement */}
            {user.prevExpSolutionRelogement && (
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-600">
                <p className="text-sm font-semibold text-blue-900">Solution de relogement</p>
                <p className="text-base font-bold text-blue-950">{user.prevExpSolutionRelogement}</p>
              </div>
            )}

            {/* Commentaire */}
            {user.prevExpCommentaire && (
              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-600">Commentaires</p>
                <p className="text-sm">{user.prevExpCommentaire}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintPreview;
