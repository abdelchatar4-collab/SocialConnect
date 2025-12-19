/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

/**
 * GestionnaireSettings - Modern redesigned version
 * Manage team members with colors and roles
 */

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users, Palette, Wrench, Loader2, Save, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

// Couleurs prédéfinies pour les médaillons
const PREDEFINED_COLORS = [
  // === FAMILLE ÉMERAUDE ===
  { name: 'Émeraude (par défaut)', from: '#059669', to: '#047857' },
  { name: 'Émeraude Clair', from: '#34d399', to: '#10b981' },
  { name: 'Émeraude Profond', from: '#047857', to: '#064e3b' },
  { name: 'Émeraude Pastel', from: '#6ee7b7', to: '#34d399' },
  // === FAMILLE BLEU ===
  { name: 'Bleu Standard', from: '#3b82f6', to: '#2563eb' },
  { name: 'Bleu Ciel', from: '#0ea5e9', to: '#0284c7' },
  { name: 'Bleu Marine', from: '#1e40af', to: '#1e3a8a' },
  { name: 'Bleu Pastel', from: '#93c5fd', to: '#60a5fa' },
  // === FAMILLE VIOLET ===
  { name: 'Violet Standard', from: '#8b5cf6', to: '#7c3aed' },
  { name: 'Violet Clair', from: '#c4b5fd', to: '#a78bfa' },
  { name: 'Violet Profond', from: '#6d28d9', to: '#581c87' },
  { name: 'Violet Lavande', from: '#ddd6fe', to: '#c4b5fd' },
  // === FAMILLE ORANGE ===
  { name: 'Orange Standard', from: '#f59e0b', to: '#d97706' },
  { name: 'Orange Clair', from: '#fed7aa', to: '#fdba74' },
  { name: 'Orange Brûlé', from: '#ea580c', to: '#c2410c' },
  { name: 'Orange Amber', from: '#fbbf24', to: '#f59e0b' },
  // === FAMILLE ROSE ===
  { name: 'Rose Standard', from: '#ec4899', to: '#db2777' },
  { name: 'Rose Clair', from: '#f9a8d4', to: '#f472b6' },
  { name: 'Rose Fuchsia', from: '#d946ef', to: '#c026d3' },
  { name: 'Rose Pastel', from: '#fce7f3', to: '#f9a8d4' },
  // === FAMILLE VERT ===
  { name: 'Vert Standard', from: '#10b981', to: '#059669' },
  { name: 'Vert Lime', from: '#65a30d', to: '#4d7c0f' },
  { name: 'Vert Teal', from: '#14b8a6', to: '#0f766e' },
  { name: 'Vert Menthe', from: '#6ee7b7', to: '#34d399' },
  // === FAMILLE ROUGE ===
  { name: 'Rouge Standard', from: '#ef4444', to: '#dc2626' },
  { name: 'Rouge Clair', from: '#fca5a5', to: '#f87171' },
  { name: 'Rouge Carmin', from: '#dc2626', to: '#b91c1c' },
  { name: 'Rouge Cerise', from: '#e11d48', to: '#be185d' },
  // === FAMILLE INDIGO ===
  { name: 'Indigo Standard', from: '#6366f1', to: '#5b21b6' },
  { name: 'Indigo Clair', from: '#a5b4fc', to: '#818cf8' },
  { name: 'Indigo Profond', from: '#4338ca', to: '#3730a3' },
  { name: 'Indigo Perle', from: '#e0e7ff', to: '#c7d2fe' },
  // === FAMILLE CYAN ===
  { name: 'Cyan Standard', from: '#06b6d4', to: '#0891b2' },
  { name: 'Cyan Clair', from: '#67e8f9', to: '#22d3ee' },
  { name: 'Cyan Profond', from: '#0e7490', to: '#164e63' },
  { name: 'Cyan Aqua', from: '#a7f3d0', to: '#6ee7b7' },
  // === FAMILLE JAUNE ===
  { name: 'Jaune Standard', from: '#eab308', to: '#ca8a04' },
  { name: 'Jaune Clair', from: '#fef3c7', to: '#fde68a' },
  { name: 'Jaune Doré', from: '#f59e0b', to: '#d97706' },
  { name: 'Jaune Soleil', from: '#fbbf24', to: '#f59e0b' },
  // === FAMILLE POURPRE ===
  { name: 'Pourpre Standard', from: '#a855f7', to: '#9333ea' },
  { name: 'Pourpre Clair', from: '#d8b4fe', to: '#c084fc' },
  { name: 'Pourpre Royal', from: '#7c3aed', to: '#6d28d9' },
  { name: 'Pourpre Améthyste', from: '#e879f9', to: '#d946ef' },
  // === FAMILLE GRIS/NEUTRE ===
  { name: 'Slate Standard', from: '#64748b', to: '#475569' },
  { name: 'Slate Clair', from: '#cbd5e1', to: '#94a3b8' },
  { name: 'Slate Foncé', from: '#334155', to: '#1e293b' },
  { name: 'Graphite', from: '#374151', to: '#1f2937' },
  // === COULEURS SPÉCIALES ===
  { name: 'Bronze Élégant', from: '#d97706', to: '#92400e' },
  { name: 'Cuivre Antique', from: '#ea580c', to: '#9a3412' },
  { name: 'Or Raffiné', from: '#f59e0b', to: '#b45309' },
  { name: 'Platine Modern', from: '#e5e7eb', to: '#9ca3af' },
];

interface SessionUserWithRole {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

interface Gestionnaire {
  id: string;
  nom?: string | null;
  prenom: string;
  email?: string | null;
  role?: string | null;
  couleurMedaillon?: string | null;
}

export default function GestionnaireSettings() {
  const { data: session, status: sessionStatus } = useSession();
  const userRole = (session?.user as SessionUserWithRole)?.role;

  const [gestionnaires, setGestionnaires] = useState<Gestionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [currentGestionnaire, setCurrentGestionnaire] = useState<Gestionnaire>({
    id: '',
    nom: '',
    prenom: '',
    email: '',
    role: 'USER',
    couleurMedaillon: null
  });

  useEffect(() => {
    if (sessionStatus === "loading") {
      setIsLoading(true);
      return;
    }

    if (sessionStatus === "authenticated" && userRole === "ADMIN") {
      fetchGestionnaires();
    } else if (sessionStatus === "authenticated" && userRole !== "ADMIN") {
      setError("Accès refusé. Droits administrateur requis.");
      setGestionnaires([]);
      setIsLoading(false);
    } else if (sessionStatus === "unauthenticated") {
      setError("Veuillez vous connecter en tant qu'administrateur.");
      setGestionnaires([]);
      setIsLoading(false);
    }
  }, [sessionStatus, userRole]);

  const fetchGestionnaires = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gestionnaires');
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Accès API refusé. Droits administrateur requis.');
        }
        throw new Error('Erreur lors du chargement des gestionnaires');
      }
      const data = await response.json();
      setGestionnaires(data);
      setError(null);
    } catch (err) {
      console.error('Erreur fetchGestionnaires:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGestionnaire = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = currentGestionnaire.id ? 'PUT' : 'POST';
      const url = currentGestionnaire.id
        ? `/api/gestionnaires/${currentGestionnaire.id}`
        : '/api/gestionnaires';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentGestionnaire)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }

      await fetchGestionnaires();
      setEditMode(false);
      setCurrentGestionnaire({ id: '', nom: '', prenom: '', email: '', role: 'USER' });
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce gestionnaire?')) return;

    try {
      const response = await fetch(`/api/gestionnaires/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      await fetchGestionnaires();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const configureAutoColors = async () => {
    try {
      setIsLoading(true);
      const gestionnairesSansCouleur = gestionnaires.filter(g => !g.couleurMedaillon);

      if (gestionnairesSansCouleur.length === 0) {
        alert('Tous les gestionnaires ont déjà une couleur configurée !');
        return;
      }

      const gestionnairesAvecCouleur = gestionnaires.filter(g => g.couleurMedaillon);
      let assignedCount = 0;

      for (let i = 0; i < gestionnairesSansCouleur.length; i++) {
        const gestionnaire = gestionnairesSansCouleur[i];
        const colorIndex = (gestionnairesAvecCouleur.length + i) % PREDEFINED_COLORS.length;
        const selectedColor = PREDEFINED_COLORS[colorIndex];

        const response = await fetch(`/api/gestionnaires/${gestionnaire.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...gestionnaire,
            couleurMedaillon: JSON.stringify({
              from: selectedColor.from,
              to: selectedColor.to
            })
          })
        });

        if (response.ok) {
          assignedCount++;
        }
      }

      await fetchGestionnaires();
      alert(`✅ ${assignedCount} couleur(s) configurée(s) automatiquement !\n\nRafraîchissez la page des usagers pour voir les changements.`);

    } catch (err) {
      console.error('Erreur lors de la configuration automatique:', err);
      setError('Erreur lors de la configuration automatique des couleurs');
    } finally {
      setIsLoading(false);
    }
  };

  const isAdminEditingSelf = editMode && (session?.user as SessionUserWithRole)?.id === currentGestionnaire.id && currentGestionnaire.role === 'ADMIN';

  if (isLoading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
      <span className="ml-2 text-gray-500">Chargement...</span>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 text-red-600 py-4 px-6 rounded-lg text-center">
      Erreur: {error}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Gestionnaires Card */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon settings-card-icon--blue">
            <Users className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="settings-card-title">Gestion des Gestionnaires</h3>
            <p className="settings-card-subtitle">{gestionnaires.length} membre(s) dans l'équipe</p>
          </div>
          {!editMode && (
            <button
              onClick={() => {
                setCurrentGestionnaire({ id: '', nom: '', prenom: '', email: '', role: 'USER', couleurMedaillon: null });
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
          {editMode ? (
            <form onSubmit={handleSaveGestionnaire} className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prenom" className="settings-label">Prénom</label>
                  <input
                    id="prenom"
                    type="text"
                    value={currentGestionnaire.prenom}
                    onChange={(e) => setCurrentGestionnaire({ ...currentGestionnaire, prenom: e.target.value })}
                    className="settings-input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="nom" className="settings-label">Nom</label>
                  <input
                    id="nom"
                    type="text"
                    value={currentGestionnaire.nom || ''}
                    onChange={(e) => setCurrentGestionnaire({ ...currentGestionnaire, nom: e.target.value })}
                    className="settings-input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="email" className="settings-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={typeof currentGestionnaire.email === 'string' ? currentGestionnaire.email : ''}
                    onChange={(e) => setCurrentGestionnaire({ ...currentGestionnaire, email: e.target.value })}
                    className="settings-input"
                  />
                </div>

                {/* Rôle */}
                <div className="md:col-span-2">
                  <label htmlFor="role" className="settings-label">Rôle</label>
                  <select
                    name="role"
                    value={currentGestionnaire.role || 'USER'}
                    onChange={(e) => setCurrentGestionnaire({ ...currentGestionnaire, role: e.target.value })}
                    className={`settings-input ${isAdminEditingSelf ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    disabled={isAdminEditingSelf}
                  >
                    <option key="USER" value="USER">Utilisateur (USER)</option>
                    <option key="ADMIN" value="ADMIN">Administrateur (ADMIN)</option>
                  </select>
                  {isAdminEditingSelf && (
                    <p className="settings-hint">Vous ne pouvez pas modifier votre propre rôle d'administrateur.</p>
                  )}
                </div>

                {/* Couleur */}
                <div className="md:col-span-2">
                  <label className="settings-label">
                    Couleur du médaillon
                    <span className="font-normal text-gray-500 ml-2">
                      ({PREDEFINED_COLORS.length} dégradés disponibles)
                    </span>
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
                    {PREDEFINED_COLORS.map((color, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentGestionnaire({
                          ...currentGestionnaire,
                          couleurMedaillon: JSON.stringify({ from: color.from, to: color.to })
                        })}
                        className={`relative p-1.5 rounded-lg border-2 transition-all hover:scale-105 group ${(() => {
                          try {
                            const currentColor = currentGestionnaire.couleurMedaillon
                              ? JSON.parse(currentGestionnaire.couleurMedaillon)
                              : null;
                            return currentColor?.from === color.from
                              ? 'border-cyan-500 ring-1 ring-cyan-200'
                              : 'border-transparent hover:border-gray-200';
                          } catch {
                            return 'border-transparent hover:border-gray-200';
                          }
                        })()}`}
                        title={color.name}
                      >
                        <div
                          className="w-6 h-6 rounded-full mx-auto mb-1 shadow-sm"
                          style={{
                            background: `linear-gradient(135deg, ${color.from}, ${color.to})`
                          }}
                        />
                        {(() => {
                          try {
                            const currentColor = currentGestionnaire.couleurMedaillon
                              ? JSON.parse(currentGestionnaire.couleurMedaillon)
                              : null;
                            return currentColor?.from === color.from && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-white text-[10px]">✓</span>
                              </div>
                            );
                          } catch {
                            return null;
                          }
                        })()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="settings-btn settings-btn--secondary"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
                <button
                  type="submit"
                  className="settings-btn settings-btn--primary"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
              </div>
            </form>
          ) : (
            <div className="divide-y divide-gray-100">
              {gestionnaires.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  Aucun gestionnaire disponible
                </div>
              ) : (
                gestionnaires.map((gestionnaire) => (
                  <div key={gestionnaire.id} className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg transition-colors group">
                    <div className="flex items-center space-x-3">
                      {/* Médaillon */}
                      <div
                        className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm border-2 border-white ring-1 ring-gray-100"
                        style={{
                          background: gestionnaire.couleurMedaillon
                            ? (() => {
                              try {
                                const couleur = typeof gestionnaire.couleurMedaillon === 'string'
                                  ? JSON.parse(gestionnaire.couleurMedaillon)
                                  : gestionnaire.couleurMedaillon;
                                return `linear-gradient(135deg, ${couleur.from}, ${couleur.to})`;
                              } catch (e) {
                                return 'linear-gradient(135deg, #64748b, #475569)';
                              }
                            })()
                            : 'linear-gradient(135deg, #64748b, #475569)'
                        }}
                      >
                        {(gestionnaire.prenom?.[0] || '').toUpperCase()}{(gestionnaire.nom?.[0] || '').toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800">{gestionnaire.prenom} {gestionnaire.nom}</p>
                          {gestionnaire.role === 'ADMIN' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">
                              ADMIN
                            </span>
                          )}
                        </div>
                        {gestionnaire.email && <p className="text-sm text-gray-500">{gestionnaire.email}</p>}
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setCurrentGestionnaire(gestionnaire);
                          setEditMode(true);
                        }}
                        className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(gestionnaire.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Utilities Card */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon settings-card-icon--green">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h3 className="settings-card-title">Utilitaires</h3>
            <p className="settings-card-subtitle">Outils de configuration</p>
          </div>
        </div>
        <div className="settings-card-body space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Outil d'Importation Excel</h4>
              <p className="text-sm text-gray-600">
                Convertir et préparer les fichiers Excel pour l'importation.
              </p>
            </div>
            <a
              href="/Utilitaires/Outil-Import-Fiches-Dossiers-V3.html"
              target="_blank"
              rel="noopener noreferrer"
              className="settings-btn settings-btn--secondary text-sm whitespace-nowrap ml-4"
            >
              Ouvrir l'outil
            </a>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                  Configuration Automatique des Couleurs
                </h4>
                <p className="text-sm text-gray-600">
                  Attribue des couleurs uniques aux gestionnaires sans couleur.
                </p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full">
                {gestionnaires.filter(g => !g.couleurMedaillon).length} à configurer
              </span>
            </div>
            <button
              onClick={configureAutoColors}
              disabled={isLoading || gestionnaires.filter(g => !g.couleurMedaillon).length === 0}
              className="settings-btn settings-btn--primary w-full justify-center"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
              Lancer la configuration automatique
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
