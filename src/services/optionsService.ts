/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Dropdown Options Service
Refactored to use extracted configuration for maintainability
*/

import { DropdownOptionSet, defaultOptions } from '@/config/defaultDropdownOptions';

// Re-export types and defaults for backward compatibility
export type { DropdownOptionSet } from '@/config/defaultDropdownOptions';
export { defaultOptions } from '@/config/defaultDropdownOptions';

const STORAGE_KEY = 'app_dropdown_options';

function notifyOptionsDataChange() {
  window.dispatchEvent(new CustomEvent('options-data-changed'));
}

/** Récupère toutes les ensembles d'options */
export function getAllOptionSets(): DropdownOptionSet[] {
  try {
    ensureAllDefaultOptions();
    const savedOptions = localStorage.getItem(STORAGE_KEY);
    if (savedOptions) return JSON.parse(savedOptions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultOptions));
    return defaultOptions;
  } catch (error) {
    console.error('Erreur lors de la récupération des options:', error);
    return defaultOptions;
  }
}

/** Récupère un ensemble d'options par ID */
export function getOptionSetById(id: string): DropdownOptionSet | undefined {
  return getAllOptionSets().find(optionSet => optionSet.id === id);
}

/** Récupère les options d'un menu déroulant par ID */
export function getOptionsById(id: string): string[] {
  const optionSet = getOptionSetById(id);
  return optionSet ? ['', ...optionSet.options] : [''];
}

/** Ajoute une nouvelle option */
export function addOption(optionSetId: string, newOption: string): boolean {
  try {
    if (!newOption.trim()) return false;
    const allOptions = getAllOptionSets();
    const optionSetIndex = allOptions.findIndex(os => os.id === optionSetId);
    if (optionSetIndex === -1) return false;
    if (allOptions[optionSetIndex].options.includes(newOption)) return false;

    allOptions[optionSetIndex].options.push(newOption);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allOptions));
    notifyOptionsDataChange();
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'une option:', error);
    return false;
  }
}

/** Met à jour une option existante */
export function updateOption(optionSetId: string, oldOption: string, newOption: string): boolean {
  try {
    if (!newOption.trim()) return false;
    const allOptions = getAllOptionSets();
    const optionSetIndex = allOptions.findIndex(os => os.id === optionSetId);
    if (optionSetIndex === -1) return false;

    const optionIndex = allOptions[optionSetIndex].options.indexOf(oldOption);
    if (optionIndex === -1) return false;

    allOptions[optionSetIndex].options[optionIndex] = newOption;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allOptions));
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour d\'une option:', error);
    return false;
  }
}

/** Supprime une option */
export function deleteOption(optionSetId: string, option: string): boolean {
  try {
    const allOptions = getAllOptionSets();
    const optionSetIndex = allOptions.findIndex(os => os.id === optionSetId);
    if (optionSetIndex === -1) return false;

    allOptions[optionSetIndex].options = allOptions[optionSetIndex].options.filter(opt => opt !== option);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allOptions));
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression d\'une option:', error);
    return false;
  }
}

/** Ajoute un nouvel ensemble d'options */
export function addOptionSet(newOptionSet: Omit<DropdownOptionSet, 'id'>): string {
  try {
    const allOptions = getAllOptionSets();
    const id = `custom_${Date.now()}`;
    allOptions.push({ ...newOptionSet, id, options: newOptionSet.options || [] });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allOptions));
    return id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un ensemble d\'options:', error);
    return '';
  }
}

/** Réinitialise toutes les options aux valeurs par défaut */
export function resetAllOptions(): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultOptions));
    return true;
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des options:', error);
    return false;
  }
}

/** Vérifie et met à jour les options manquantes */
export function ensureAllDefaultOptions(): boolean {
  try {
    const savedOptions = localStorage.getItem(STORAGE_KEY);
    let currentOptions: DropdownOptionSet[] = savedOptions ? JSON.parse(savedOptions) : [];

    // Migration: renommer 'actionsSuivi' vers 'actions'
    const actionsSuiviIndex = currentOptions.findIndex(opt => opt.id === 'actionsSuivi');
    let hasChanges = actionsSuiviIndex !== -1;
    if (hasChanges) {
      currentOptions[actionsSuiviIndex].id = 'actions';
    }

    // Ajouter les options par défaut manquantes
    for (const defaultOption of defaultOptions) {
      if (!currentOptions.find(opt => opt.id === defaultOption.id)) {
        currentOptions.push(defaultOption);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentOptions));
    }
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification des options par défaut:', error);
    return false;
  }
}
