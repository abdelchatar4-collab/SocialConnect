/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * API Service Layer - Centralized API calls
 */

const API_BASE = '/api';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Users API
export const usersAPI = {
  getAll: () => fetchAPI<any[]>('/users'),
  getById: (id: string) => fetchAPI<any>(`/users/${id}`),
  create: (data: any) => fetchAPI<any>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI<any>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI<void>(`/users/${id}`, {
    method: 'DELETE',
  }),
  bulkDelete: (ids: string[]) => fetchAPI<void>('/users/bulk-delete', {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  }),
};

// Gestionnaires API
export const gestionnairesAPI = {
  getAll: () => fetchAPI<any[]>('/gestionnaires'),
  getById: (id: string) => fetchAPI<any>(`/gestionnaires/${id}`),
};

// Dropdown Options API
export const dropdownAPI = {
  getOptions: (category: string) => fetchAPI<any[]>(`/dropdown-options?category=${category}`),
  createOption: (category: string, data: any) => fetchAPI<any>('/dropdown-options', {
    method: 'POST',
    body: JSON.stringify({ category, ...data }),
  }),
};

// Export all APIs
export const api = {
  users: usersAPI,
  gestionnaires: gestionnairesAPI,
  dropdown: dropdownAPI,
};

export default api;
