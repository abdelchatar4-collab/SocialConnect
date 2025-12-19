/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { DROPDOWN_CATEGORIES } from '@/constants/dropdownCategories';

export interface DropdownOption {
  id: string;
  value: string;
  label: string;
  order: number;
}

export interface DropdownOptionSet {
  id: string;
  name: string;
  options: string[];
  description?: string;
  isSystem?: boolean;
}

class OptionsClient {
  private baseURL: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly STORAGE_KEY = 'app_dropdown_options';

  constructor() {
    this.baseURL = typeof window !== 'undefined' ? window.location.origin : '';
  }

  /**
   * Détermine si l'application doit utiliser localStorage ou l'API
   */
  private isLocalStorageMode(): boolean {
    // FORCER TEMPORAIREMENT LE MODE API
    return false;

    // Priorité 1: Variable d'environnement explicite
    if (process.env.NEXT_PUBLIC_FORCE_LOCALSTORAGE === 'true') {
      return true;
    }
    if (process.env.NEXT_PUBLIC_FORCE_LOCALSTORAGE === 'false') {
      return false;
    }

    // Priorité 2: Mode développement par défaut
    return process.env.NODE_ENV === 'development';
  }

  /**
   * Gestion du cache mémoire
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Récupérer les options d'une catégorie
   */
  async getOptions(category: string, useCache: boolean = true): Promise<DropdownOption[]> {
    const cacheKey = `options_${category}`;

    // Vérifier le cache mémoire
    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log(`📦 Cache hit pour ${category}`);
        return cached;
      }
    }

    try {
      if (this.isLocalStorageMode()) {
        console.log(`💾 Mode localStorage pour ${category}`);
        return await this.getOptionsFromLocalStorage(category);
      } else {
        console.log(`🌐 Mode API pour ${category}`);
        return await this.getOptionsFromAPI(category);
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des options ${category}:`, error);
      // Fallback vers localStorage en cas d'erreur API
      if (!this.isLocalStorageMode()) {
        console.log(`🔄 Fallback localStorage pour ${category}`);
        return await this.getOptionsFromLocalStorage(category);
      }
      throw error;
    }
  }

  /**
   * Récupérer depuis localStorage
   */
  private async getOptionsFromLocalStorage(category: string): Promise<DropdownOption[]> {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];

    const allOptions = JSON.parse(stored);
    const categoryData = allOptions.find((opt: any) => opt.id === category);

    if (!categoryData) return [];

    // Convertir en format DropdownOption
    return categoryData.options.map((option: string, index: number) => ({
      id: `${category}_${index}`,
      // Pour les nationalités, utiliser le label comme valeur pour correspondre aux données BDD
      value: category === 'nationalite' ? option : option.toLowerCase().replace(/\s+/g, '_'),
      label: option,
      order: index
    }));
  }

  /**
   * Récupérer depuis l'API
   */
  private async getOptionsFromAPI(category: string): Promise<DropdownOption[]> {
    const response = await fetch(`${this.baseURL}/api/options/${category}`);
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    const options = await response.json();

    // Transformer les options pour les nationalités
    const transformedOptions = options.map((option: any) => ({
      ...option,
      // Pour les nationalités, s'assurer que la valeur correspond au label
      value: category === 'nationalite' ? option.label : option.value
    }));

    // Mettre en cache
    this.setCache(`options_${category}`, transformedOptions);

    return transformedOptions;
  }

  /**
   * Ajouter une option
   */
  async addOption(category: string, label: string): Promise<DropdownOption> {
    if (this.isLocalStorageMode()) {
      return this.addOptionToLocalStorage(category, label);
    } else {
      const result = await this.addOptionToAPI(category, label);
      // Invalider le cache
      this.cache.delete(`options_${category}`);
      return result;
    }
  }

  private addOptionToLocalStorage(category: string, label: string): DropdownOption {
    // Implémentation localStorage
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const allOptions = stored ? JSON.parse(stored) : [];

    let categoryData = allOptions.find((opt: any) => opt.id === category);
    if (!categoryData) {
      categoryData = { id: category, name: category, options: [] };
      allOptions.push(categoryData);
    }

    categoryData.options.push(label);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allOptions));

    return {
      id: `${category}_${categoryData.options.length - 1}`,
      // Pour les nationalités, utiliser le label comme valeur
      value: category === 'nationalite' ? label : label.toLowerCase().replace(/\s+/g, '_'),
      label,
      order: categoryData.options.length - 1
    };
  }

  private async addOptionToAPI(category: string, label: string): Promise<DropdownOption> {
    const response = await fetch(`${this.baseURL}/api/options/${category}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Pour les nationalités, utiliser le label comme valeur
        value: category === 'nationalite' ? label : label.toLowerCase().replace(/\s+/g, '_'),
        label
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de l'ajout: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Obtenir le statut du système
   */
  getSystemStatus() {
    return {
      mode: this.isLocalStorageMode() ? 'localStorage' : 'api',
      environment: process.env.NODE_ENV,
      forceLocalStorage: process.env.NEXT_PUBLIC_FORCE_LOCALSTORAGE,
      cacheSize: this.cache.size
    };
  }
}

// Instance singleton
export const optionsClient = new OptionsClient();
export default optionsClient;
