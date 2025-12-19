/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import {
  PhoneIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  EyeIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { User, Gestionnaire } from '@/types';
import { Badge } from '@/components/ui';

interface UserCardProps {
  user: User;
  gestionnaire?: Gestionnaire;
  showDossier: boolean;
  showPhone: boolean;
  showProblematiques: boolean;
  showActions: boolean;
  onUserClick: (id: string) => void;
  getEtatBadgeVariant: (etat?: string | null) => "success" | "destructive" | "warning" | "default";
  getGestionnaireColor: (id: string) => string;
  GestionnaireIcon: React.ComponentType<any>;
  deduceActionType: (action: any) => string;
}

export default function UserCard({
  user,
  gestionnaire,
  showDossier,
  showPhone,
  showProblematiques,
  showActions,
  onUserClick,
  getEtatBadgeVariant,
  getGestionnaireColor,
  GestionnaireIcon,
  deduceActionType
}: UserCardProps) {
  const gestionnaireColor = getGestionnaireColor(gestionnaire?.id || '');
  const actions = deduceActionType(user.notesGenerales || '');

  return (
    <div
      className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden transform hover:-translate-y-1 cursor-pointer"
      onClick={() => onUserClick(user.id)}
    >
      {/* Barre d'accent avec gradient */}
      <div
        className="h-1 bg-gradient-to-r from-transparent via-current to-transparent"
        style={{ color: gestionnaireColor }}
      />

      <div className="p-5">
        {/* En-tête avec dossier */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            {showDossier && (
              <div className="text-xs font-medium text-gray-500 mb-1">
                Dossier #{user.id}
              </div>
            )}
            <h3 
              className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors truncate"
              title={`${user.nom} ${user.prenom}`}
            >
              {user.nom} {user.prenom}
            </h3>
          </div>

          {/* Badge statut */}
          <Badge variant={getEtatBadgeVariant(user.etat)}>
            {user.etat}
          </Badge>
        </div>

        {/* Informations principales */}
        <div className="space-y-2 mb-4">
          {showPhone && user.telephone && (
            <div className="flex items-center text-sm text-gray-600">
              <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
              {user.telephone}
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-400" />
            {user.antenne}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
            {user.secteur}
          </div>
        </div>

        {/* Problématiques */}
        {showProblematiques && user.problematiques && user.problematiques.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-500 mb-2">Problématiques</div>
            <div className="flex flex-wrap gap-1">
              {user.problematiques.slice(0, 3).map((prob, idx) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                >
                  {typeof prob === 'string' ? prob : prob.type}
                </span>
              ))}
              {user.problematiques.length > 3 && (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                  +{user.problematiques.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* En-tête avec gestionnaire et actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <GestionnaireIcon
              gestionnaire={gestionnaire}
              size="sm"
              showTooltip={true}
            />
          </div>

          {/* Actions rapides */}
          <div className="flex space-x-1">
            <button
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Voir le détail"
            >
              <EyeIcon className="h-4 w-4" />
            </button>

            {showActions && actions.length > 0 && (
              <button
                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                title={`${actions.length} action(s)`}
              >
                <ClipboardDocumentListIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
