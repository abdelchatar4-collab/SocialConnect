'use client';

/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
 */

import React from 'react';
import { Plus, Users, Loader2, AlertCircle } from 'lucide-react';
import { useGestionnaireLogic } from './gestionnaires/useGestionnaireLogic';
import { GestionnaireForm } from './gestionnaires/GestionnaireForm';
import { GestionnaireList } from './gestionnaires/GestionnaireList';
import { GestionnaireUtilities } from './gestionnaires/GestionnaireUtilities';

export const GestionnaireSettings: React.FC = () => {
  const {
    gestionnaires,
    isLoading,
    error,
    editMode,
    setEditMode,
    currentGestionnaire,
    setCurrentGestionnaire,
    handleSaveGestionnaire,
    handleDelete,
    configureAutoColors,
    isAdminEditingSelf
  } = useGestionnaireLogic();

  if (isLoading && gestionnaires.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-cyan-600" />
        <p>Chargement des gestionnaires...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Liste des Gestionnaires */}
        <div className="xl:col-span-2 space-y-6">
          <div className="settings-card">
            <div className="settings-card-header flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="settings-card-icon settings-card-icon--blue">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="settings-card-title">Équipe de Gestion</h3>
                  <p className="settings-card-subtitle">
                    {gestionnaires.length} membres enregistrés
                  </p>
                </div>
              </div>
              {!editMode && (
                <button
                  onClick={() => {
                    setCurrentGestionnaire({ id: '', nom: '', prenom: '', email: '', role: 'USER', isActive: true });
                    setEditMode(true);
                  }}
                  className="settings-btn settings-btn--primary"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              )}
            </div>

            <div className="settings-card-body">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {editMode ? (
                <GestionnaireForm
                  currentGestionnaire={currentGestionnaire}
                  setCurrentGestionnaire={setCurrentGestionnaire}
                  onSubmit={handleSaveGestionnaire}
                  onCancel={() => setEditMode(false)}
                  isAdminEditingSelf={isAdminEditingSelf}
                />
              ) : (
                <GestionnaireList
                  gestionnaires={gestionnaires}
                  onEdit={(g) => {
                    setCurrentGestionnaire(g);
                    setEditMode(true);
                  }}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        </div>

        {/* Utilitaires */}
        <div className="space-y-6">
          <GestionnaireUtilities
            isLoading={isLoading}
            gestWithoutColorCount={gestionnaires.filter(g => !g.couleurMedaillon).length}
            onAutoConfigure={configureAutoColors}
          />
        </div>
      </div>
    </div>
  );
};

export default GestionnaireSettings;
