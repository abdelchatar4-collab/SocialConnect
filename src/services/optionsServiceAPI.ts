/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

export interface DropdownOptionAPI {
  id: string;
  value: string;
  label: string;
  order: number;
}

export interface DropdownOptionSetAPI {
  id: string;
  name: string;
  options: string[];
  description?: string;
  isSystem?: boolean;
}

// Récupérer toutes les catégories d'options
export async function getAllOptionSetsAPI(): Promise<DropdownOptionSetAPI[]> {
  const response = await fetch('/api/options/categories');
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des catégories');
  }
  return response.json();
}

// Récupérer les options d'une catégorie spécifique
export async function getOptionsByCategoryAPI(type: string): Promise<DropdownOptionAPI[]> {
  const response = await fetch(`/api/options/${type}`);
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des options pour ${type}`);
  }
  return response.json();
}

// Ajouter une nouvelle option
export async function addOptionAPI(type: string, label: string): Promise<DropdownOptionAPI> {
  const normalizedLabel = label.trim();
  const computedValue =
    type === 'nationalite'
      ? normalizedLabel
      : normalizedLabel.toLowerCase().replace(/\s+/g, '_');

  const response = await fetch(`/api/options/${type}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      value: computedValue,
      label: normalizedLabel
    })
  });

  if (!response.ok) {
    let errorMessage = 'Erreur lors de l\'ajout de l\'option';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }
  return response.json();
}

// Mettre à jour une option
export async function updateOptionAPI(
  type: string,
  optionId: string,
  label: string
): Promise<DropdownOptionAPI> {
  const normalizedLabel = label.trim();
  const computedValue =
    type === 'nationalite'
      ? normalizedLabel
      : normalizedLabel.toLowerCase().replace(/\s+/g, '_');

  const response = await fetch(`/api/options/${type}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: optionId,
      value: computedValue,
      label: normalizedLabel
    })
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour de l\'option');
  }
  return response.json();
}

// Supprimer une option
export async function deleteOptionAPI(type: string, optionId: string): Promise<void> {
  const response = await fetch(`/api/options/${type}?id=${optionId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la suppression de l\'option');
  }
}
