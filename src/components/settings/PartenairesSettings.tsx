/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

/**
 * PartenairesSettings - Modern redesigned version
 * Manage external partner organizations
 */

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Handshake, Save, X, Loader2, Building2 } from 'lucide-react';

interface Partenaire {
  id: string;
  value: string;
  label: string;
}

export const PartenairesSettings: React.FC = () => {
  const [partenaires, setPartenaires] = useState<Partenaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newPartenaireValue, setNewPartenaireValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPartenaires();
  }, []);

  const fetchPartenaires = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/partenaires');
      if (response.ok) {
        const data = await response.json();
        setPartenaires(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des partenaires:', error);
      setError('Erreur lors du chargement des partenaires');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newPartenaireValue.trim()) return;

    try {
      const response = await fetch('/api/partenaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newPartenaireValue.trim() })
      });

      if (response.ok) {
        setNewPartenaireValue('');
        fetchPartenaires();
        setError(null);
      } else {
        setError('Erreur lors de l\'ajout du partenaire');
      }
    } catch (error) {
      setError('Erreur lors de l\'ajout du partenaire');
    }
  };

  const handleEdit = async (id: string) => {
    if (!editValue.trim()) return;

    try {
      const response = await fetch(`/api/partenaires/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: editValue.trim() })
      });

      if (response.ok) {
        setEditingId(null);
        setEditValue('');
        fetchPartenaires();
        setError(null);
      } else {
        setError('Erreur lors de la modification du partenaire');
      }
    } catch (error) {
      setError('Erreur lors de la modification du partenaire');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) return;

    try {
      const response = await fetch(`/api/partenaires/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchPartenaires();
        setError(null);
      } else {
        setError('Erreur lors de la suppression du partenaire');
      }
    } catch (error) {
      setError('Erreur lors de la suppression du partenaire');
    }
  };

  const startEdit = (partenaire: Partenaire) => {
    setEditingId(partenaire.id);
    setEditValue(partenaire.value);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setError(null);
  };

  if (loading && partenaires.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
        <span className="ml-2 text-gray-500">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon settings-card-icon--purple">
            <Handshake className="w-4 h-4" />
          </div>
          <div>
            <h3 className="settings-card-title">Gestion des Partenaires</h3>
            <p className="settings-card-subtitle">{partenaires.length} organisation(s) partenaire(s)</p>
          </div>
        </div>

        <div className="settings-card-body space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* Add Form */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              Ajouter une organisation
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPartenaireValue}
                onChange={(e) => setNewPartenaireValue(e.target.value)}
                placeholder="Nom du partenaire (ex: CPAS, Police, ...)"
                className="settings-input"
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
              <button
                onClick={handleAdd}
                disabled={!newPartenaireValue.trim()}
                className="settings-btn settings-btn--primary"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
          </div>

          {/* List */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white divide-y divide-gray-100">
            {partenaires.length === 0 ? (
              <div className="p-8 text-center text-gray-500 italic">
                Aucun partenaire configuré
              </div>
            ) : (
              partenaires.map((partenaire) => (
                <div key={partenaire.id} className="p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors group">
                  {editingId === partenaire.id ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="settings-input flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleEdit(partenaire.id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleEdit(partenaire.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-xs">
                        {partenaire.label.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="flex-1 text-gray-900 font-medium">{partenaire.value}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(partenaire)}
                          className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(partenaire.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
