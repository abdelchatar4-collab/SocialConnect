/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useState, useCallback, useEffect } from 'react';
import { UserFormData } from '@/types/user';
import { merge } from 'lodash'; // Assurez-vous d'importer lodash ou implémentez une deep merge

interface UseUserFormStateProps {
  initialData?: Partial<UserFormData>;
  resetOnSubmit?: boolean;
}

interface UseUserFormStateReturn {
  formData: UserFormData;
  updateField: (field: keyof UserFormData, value: any) => void;
  updateFields: (fields: Partial<UserFormData>) => void;
  resetForm: (data?: Partial<UserFormData>) => void;
  isDirty: boolean;
  hasChanges: boolean;
  getChanges: () => Partial<UserFormData>;
}

const DEFAULT_FORM_DATA: UserFormData = {
  nom: '',
  prenom: '',
  genre: '',
  telephone: '',
  email: '',
  statutSejour: '',
  gestionnaire: '',
  nationalite: '',
  antenne: '',
  trancheAge: '',
  remarques: '',
  secteur: '',
  langue: '',
  premierContact: '',
  notesGenerales: '',
  etat: 'actif',
  dateNaissance: '',
  dateOuverture: '',
  dateCloture: '',
  partenaire: [],
  informationImportante: '',
  hasPrevExp: false,
  prevExpDateReception: '',
  prevExpDateRequete: '',
  prevExpDateVad: '',
  prevExpDecision: '',
  prevExpCommentaire: '',
  prevExpMotifRequete: '',
  prevExpDateAudience: '',
  prevExpDateSignification: '',
  prevExpDateJugement: '',
  prevExpDateExpulsion: '',
  prevExpDemandeCpas: '',
  prevExpNegociationProprio: '',
  prevExpSolutionRelogement: '',
  prevExpMaintienLogement: '',
  prevExpTypeFamille: '',
  prevExpTypeRevenu: '',
  prevExpEtatLogement: '',
  prevExpNombreChambre: '',
  prevExpAideJuridique: '',
  adresse: {
    rue: '',
    numero: '',
    boite: '',
    codePostal: '',
    ville: '',
    quartier: '',
    pays: '',
    secteur: ''
  },
  logementDetails: {
    type: '',
    statut: '',
    nombrePieces: 0,
    typeLogement: '',
    dateEntree: '',
    dateSortie: '',
    motifSortie: '',
    destinationSortie: '',
    proprietaire: '',
    bailleur: '',
    loyer: '',
    charges: '',
    commentaire: '',
    commentaires: '',
    bailEnregistre: '',
    dateContrat: '',
    dureeContrat: '',
    garantieLocative: '',
    statutGarantie: '',
    hasLitige: false,
    typeLitige: '',
    dateLitige: '',
    descriptionLitige: '',
    actionsPrises: '',
    datePreavis: '',
    dureePreavis: ''
  },
  problematiques: [],
  problematiquesDetails: '',
  actions: [],
  situationProfessionnelle: '',
  revenus: '',
  // Ajouter les champs manquants
  afficherDonneesConfidentielles: false,
  donneesConfidentielles: ''
};

/**
 * Hook pour gérer l'état d'un formulaire utilisateur
 * Fournit des fonctionnalités pour la mise à jour, la réinitialisation et le suivi des modifications
 */
export const useUserFormState = (props: UseUserFormStateProps = {}): UseUserFormStateReturn => {
  const { initialData = {}, resetOnSubmit = false } = props;

  // État du formulaire fusionné avec les données par défaut
  const [formData, setFormData] = useState<UserFormData>(() => ({
    ...DEFAULT_FORM_DATA,
    ...initialData
  }));

  // État initial pour comparaison des changements
  const [initialFormData, setInitialFormData] = useState<UserFormData>(() => ({
    ...DEFAULT_FORM_DATA,
    ...initialData
  }));

  // Mise à jour d'un champ unique
  const updateField = useCallback((field: keyof UserFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Mise à jour de plusieurs champs à la fois
  const updateFields = useCallback((fields: Partial<UserFormData>) => {
    setFormData(prev => merge({}, prev, fields)); // Utilise deep merge pour nested comme logementDetails
  }, []);

  // Réinitialisation du formulaire
  const resetForm = useCallback((data?: Partial<UserFormData>) => {
    const newData = {
      ...DEFAULT_FORM_DATA,
      ...(data || initialData)
    };
    setFormData(newData);
    setInitialFormData(newData);
  }, [initialData]);

  // Vérification si le formulaire a été modifié
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialFormData);

  // Alias pour la compatibilité
  const hasChanges = isDirty;

  // Obtenir les changements spécifiques
  const getChanges = useCallback((): Partial<UserFormData> => {
    const changes: any = {};

    Object.keys(formData).forEach((key) => {
      const field = key as keyof UserFormData;
      if (formData[field] !== initialFormData[field]) {
        changes[field] = formData[field];
      }
    });

    return changes as Partial<UserFormData>;
  }, [formData, initialFormData]);

  // Effet pour mettre à jour les données initiales quand elles changent
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const newData = {
        ...DEFAULT_FORM_DATA,
        ...initialData
      };
      setFormData(newData);
      setInitialFormData(newData);
    }
  }, [initialData]);

  return {
    formData,
    updateField,
    updateFields,
    resetForm,
    isDirty,
    hasChanges,
    getChanges
  };
};

/**
 * Hook simplifié pour un formulaire de création d'utilisateur
 */
export const useNewUserForm = () => {
  return useUserFormState({
    resetOnSubmit: true
  });
};

/**
 * Hook pour l'édition d'un utilisateur existant
 */
export const useEditUserForm = (userData: Partial<UserFormData>) => {
  return useUserFormState({
    initialData: userData,
    resetOnSubmit: false
  });
};
