/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Partenaire {
  id: string;
  value: string;
  label: string;
}

interface PartenairesManagerProps {
  onClose: () => void;
}

export const PartenairesManager: React.FC<PartenairesManagerProps> = ({ onClose }) => {
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
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de l\'ajout');
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
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      setError('Erreur lors de la modification du partenaire');
    }
  };

  const handleDelete = async (id: string, value: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le partenaire "${value}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/partenaires/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchPartenaires();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la suppression');
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Gestion des Partenaires</h2>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Ajouter un nouveau partenaire */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-3">Ajouter un nouveau partenaire</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPartenaireValue}
                onChange={(e) => setNewPartenaireValue(e.target.value)}
                placeholder="Nom du partenaire"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
              <button
                onClick={handleAdd}
                disabled={!newPartenaireValue.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Ajouter
              </button>
            </div>
          </div>

          {/* Liste des partenaires */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium mb-3">Partenaires existants ({partenaires.length})</h3>
            {partenaires.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun partenaire configuré</p>
            ) : (
              partenaires.map((partenaire) => (
                <div key={partenaire.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  {editingId === partenaire.id ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleEdit(partenaire.id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleEdit(partenaire.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Sauver
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-medium">{partenaire.value}</span>
                      <button
                        onClick={() => startEdit(partenaire)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Modifier"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(partenaire.id, partenaire.value)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
