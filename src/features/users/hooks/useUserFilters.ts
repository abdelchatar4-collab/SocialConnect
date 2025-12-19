/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useState, useMemo, useCallback } from 'react';
import { User } from '@/types/user';

interface FilterOptions {
  search?: string;
  gestionnaire?: string;
  antenne?: string;
  etat?: string;
  nationalite?: string;
  secteur?: string;
  trancheAge?: string;
  dateStart?: string;
  dateEnd?: string;
}

interface SortOptions {
  field: keyof User;
  direction: 'asc' | 'desc';
}

interface PaginationOptions {
  page: number;
  pageSize: number;
}

interface UseUserFiltersProps {
  initialFilters?: FilterOptions;
  initialSort?: SortOptions;
  initialPagination?: PaginationOptions;
}

interface UseUserFiltersReturn {
  // États actuels
  filters: FilterOptions;
  sortOptions: SortOptions;
  pagination: PaginationOptions;

  // Actions de filtre
  updateFilter: (key: keyof FilterOptions, value: string | undefined) => void;
  updateFilters: (newFilters: Partial<FilterOptions>) => void;
  clearFilters: () => void;
  resetFilters: () => void;

  // Actions de tri
  updateSort: (field: keyof User, direction?: 'asc' | 'desc') => void;
  toggleSort: (field: keyof User) => void;

  // Actions de pagination
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // Fonctions d'application
  applyFilters: (users: User[]) => User[];
  applySorting: (users: User[]) => User[];
  applyPagination: (users: User[]) => { items: User[]; totalPages: number; totalItems: number };

  // Fonction combinée
  processUsers: (users: User[]) => {
    filteredUsers: User[];
    sortedUsers: User[];
    paginatedUsers: User[];
    totalPages: number;
    totalItems: number;
    hasFilters: boolean;
  };
}

const DEFAULT_FILTERS: FilterOptions = {};
const DEFAULT_SORT: SortOptions = { field: 'dateOuverture', direction: 'desc' };
const DEFAULT_PAGINATION: PaginationOptions = { page: 1, pageSize: 20 };

/**
 * Hook pour gérer les filtres, tri et pagination des utilisateurs
 */
export const useUserFilters = (props: UseUserFiltersProps = {}): UseUserFiltersReturn => {
  const {
    initialFilters = DEFAULT_FILTERS,
    initialSort = DEFAULT_SORT,
    initialPagination = DEFAULT_PAGINATION
  } = props;

  // États
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [sortOptions, setSortOptions] = useState<SortOptions>(initialSort);
  const [pagination, setPagination] = useState<PaginationOptions>(initialPagination);

  // Actions de filtre
  const updateFilter = useCallback((key: keyof FilterOptions, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    // Reset page à 1 quand on filtre
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSortOptions(initialSort);
    setPagination(initialPagination);
  }, [initialFilters, initialSort, initialPagination]);

  // Actions de tri
  const updateSort = useCallback((field: keyof User, direction: 'asc' | 'desc' = 'asc') => {
    setSortOptions({ field, direction });
  }, []);

  const toggleSort = useCallback((field: keyof User) => {
    setSortOptions(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Actions de pagination
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const nextPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
  }, []);

  const prevPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  }, []);

  // Fonction d'application des filtres
  const applyFilters = useCallback((users: User[]): User[] => {
    return users.filter(user => {
      // Recherche textuelle
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const fullName = `${user.nom} ${user.prenom}`.toLowerCase();
        const matches = fullName.includes(searchLower) ||
                       user.email?.toLowerCase().includes(searchLower) ||
                       user.telephone?.includes(filters.search);
        if (!matches) return false;
      }

      // Filtres spécifiques
      if (filters.gestionnaire && user.gestionnaire !== filters.gestionnaire) return false;
      if (filters.antenne && user.antenne !== filters.antenne) return false;
      if (filters.etat && user.etat !== filters.etat) return false;
      if (filters.nationalite && user.nationalite !== filters.nationalite) return false;
      if (filters.secteur && user.secteur !== filters.secteur) return false;
      if (filters.trancheAge && user.trancheAge !== filters.trancheAge) return false;

      // Filtres de date
      if (filters.dateStart && user.dateOuverture) {
        if (new Date(user.dateOuverture) < new Date(filters.dateStart)) return false;
      }
      if (filters.dateEnd && user.dateOuverture) {
        if (new Date(user.dateOuverture) > new Date(filters.dateEnd)) return false;
      }

      return true;
    });
  }, [filters]);

  // Fonction d'application du tri
  const applySorting = useCallback((users: User[]): User[] => {
    return [...users].sort((a, b) => {
      const aValue = a[sortOptions.field];
      const bValue = b[sortOptions.field];

      // Gestion des valeurs null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOptions.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortOptions.direction === 'asc' ? -1 : 1;

      // Comparaison pour les dates
      if (sortOptions.field.includes('date') || sortOptions.field.includes('Date')) {
        const dateA = new Date(aValue as string);
        const dateB = new Date(bValue as string);
        return sortOptions.direction === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }

      // Comparaison pour les chaînes
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.localeCompare(bValue);
        return sortOptions.direction === 'asc' ? result : -result;
      }

      // Comparaison générique
      if (aValue < bValue) return sortOptions.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOptions.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortOptions]);

  // Fonction d'application de la pagination
  const applyPagination = useCallback((users: User[]) => {
    const totalItems = users.length;
    const totalPages = Math.ceil(totalItems / pagination.pageSize);
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const items = users.slice(startIndex, endIndex);

    return {
      items,
      totalPages,
      totalItems
    };
  }, [pagination]);

  // Fonction combinée pour traiter tous les utilisateurs
  const processUsers = useCallback((users: User[]) => {
    const filteredUsers = applyFilters(users);
    const sortedUsers = applySorting(filteredUsers);
    const paginationResult = applyPagination(sortedUsers);

    return {
      filteredUsers,
      sortedUsers,
      paginatedUsers: paginationResult.items,
      totalPages: paginationResult.totalPages,
      totalItems: paginationResult.totalItems,
      hasFilters: Object.keys(filters).some(key => filters[key as keyof FilterOptions])
    };
  }, [applyFilters, applySorting, applyPagination, filters]);

  return {
    filters,
    sortOptions,
    pagination,
    updateFilter,
    updateFilters,
    clearFilters,
    resetFilters,
    updateSort,
    toggleSort,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    applyFilters,
    applySorting,
    applyPagination,
    processUsers
  };
};
