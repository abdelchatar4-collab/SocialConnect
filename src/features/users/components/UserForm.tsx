/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { User } from '@/types/user';
import { UserFormData, UserFormRef, FormErrors } from '@/types';
import { useDropdownOptionsAPI } from '@/hooks/useDropdownOptionsAPI';
import { useAdmin } from '@/contexts/AdminContext';

// Step components
import { BasicInfoStep } from './form-steps/BasicInfoStep';
import { PersonalInfoStep } from './form-steps/PersonalInfoStep';
import { ManagementStep } from './form-steps/ManagementStep';
import { HousingStep } from './form-steps/HousingStep';
import { ProblematiquesActionsStep } from './form-steps/ProblematiquesActionsStep';
import { NotesStep } from './form-steps/NotesStep';

interface UserFormProps {
  initialData?: Partial<User>;
  onSubmit: (userData: Partial<User>) => Promise<void>;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
  className?: string;
}

const STEPS = [
  { id: 1, title: 'Identification', description: 'Nom, prénom et contact' },
  { id: 2, title: 'Infos personnelles', description: 'Naissance, nationalité' },
  { id: 3, title: 'Gestion', description: 'Gestionnaire, antenne et statut' },
  { id: 4, title: 'Logement', description: 'Situation logement & Prévention' },
  { id: 5, title: 'Problématiques', description: 'Suivi social & Actions' },
  { id: 6, title: 'Notes & Bilan', description: 'Notes générales et synthèse' }
];

export const UserForm = forwardRef<UserFormRef, UserFormProps>((
  {
    initialData,
    onSubmit,
    onCancel,
    mode = 'create',
    className = ''
  },
  ref
) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Get required fields from admin settings
  const { requiredFields } = useAdmin();

  // Use new API-based dropdown options AVEC POLLING
  const { options: optionsEtat, loading: loadingEtat } = useDropdownOptionsAPI('etat');
  const {
    options: optionsAntenne,
    loading: loadingAntenne,
    hasNewData: antenneHasNewData,
    markAsViewed: markAntenneAsViewed
  } = useDropdownOptionsAPI('antenne', 30000); // POLLING 30 secondes
  const { options: optionsTypeLogementDyn, loading: loadingTypeLogement } = useDropdownOptionsAPI('typeLogement');
  const { options: languageOptions, loading: loadingLanguages } = useDropdownOptionsAPI('langue');
  const { options: nationaliteOptions, loading: loadingNationalite } = useDropdownOptionsAPI('nationalite');
  const { options: optionsStatutSejour, loading: loadingStatutSejour } = useDropdownOptionsAPI('statutSejour');
  const { options: situationProfessionnelleOptions, loading: loadingSitProf } = useDropdownOptionsAPI('situationProfessionnelle');
  // Ajout des partenaires pour ManagementStep
  const { options: optionsPartenaire, loading: loadingPartenaire } = useDropdownOptionsAPI('partenaire');

  // Consommer les options API pour le logement
  const { options: optionsPrevExpDecision } = useDropdownOptionsAPI('prevExpDecision');
  const { options: optionsPrevExpDemandeCpas } = useDropdownOptionsAPI('prevExpDemandeCpas');
  const { options: optionsPrevExpNegociationProprio } = useDropdownOptionsAPI('prevExpNegociationProprio');
  const { options: optionsPrevExpSolutionRelogement } = useDropdownOptionsAPI('prevExpSolutionRelogement');
  const { options: optionsPrevExpTypeFamille } = useDropdownOptionsAPI('prevExpTypeFamille');
  const { options: optionsPrevExpTypeRevenu } = useDropdownOptionsAPI('prevExpTypeRevenu');
  const { options: optionsPrevExpEtatLogement } = useDropdownOptionsAPI('prevExpEtatLogement');
  const { options: optionsPrevExpNombreChambre } = useDropdownOptionsAPI('prevExpNombreChambre');
  const { options: optionsPrevExpAideJuridique } = useDropdownOptionsAPI('prevExpAideJuridique');
  const { options: optionsPrevExpMotifRequete } = useDropdownOptionsAPI('prevExpMotifRequete');

  // Options spécifiques au logement (il faudrait idéalement les charger via API ou constantes)
  const optionsStatutGarantie = [
    { value: 'Constituée', label: 'Constituée' },
    { value: 'En cours', label: 'En cours' },
    { value: 'Non constituée', label: 'Non constituée' }
  ];
  const optionsBailEnregistre = [
    { value: 'Oui', label: 'Oui' },
    { value: 'Non', label: 'Non' },
    { value: 'Inconnu', label: 'Inconnu' }
  ];
  const optionsDureeContrat = [
    { value: '1 an', label: '1 an' },
    { value: '3 ans', label: '3 ans' },
    { value: '9 ans', label: '9 ans' },
    { value: 'CDI', label: 'CDI' },
    { value: 'Autre', label: 'Autre' }
  ];
  const optionsTypeLitige = [
    { value: 'Loyer', label: 'Loyer impayé' },
    { value: 'Trouble', label: 'Trouble de voisinage' },
    { value: 'Insalubrité', label: 'Insalubrité' },
    { value: 'Autre', label: 'Autre' }
  ];
  const optionsDureePreavis = [
    { value: '3 mois', label: '3 mois' },
    { value: '6 mois', label: '6 mois' },
    { value: 'Autre', label: 'Autre' }
  ];
  const optionsPreavisPour = [
    { value: 'Bailleur', label: 'Bailleur' },
    { value: 'Locataire', label: 'Locataire' }
  ];
  const revenusOptions = [
    { value: 'Salaire', label: 'Salaire' },
    { value: 'CPAS', label: 'CPAS' },
    { value: 'Chômage', label: 'Chômage' },
    { value: 'Pension', label: 'Pension' },
    { value: 'Autre', label: 'Autre' }
  ];


  // Notification pour nouvelles antennes
  useEffect(() => {
    if (antenneHasNewData && markAntenneAsViewed) {
      console.log('🆕 Nouvelles antennes disponibles!');
      setTimeout(() => markAntenneAsViewed(), 3000);
    }
  }, [antenneHasNewData, markAntenneAsViewed]);

  // Convert User to UserFormData format
  const [formData, setFormData] = useState<UserFormData>(() => {
    const defaultData: UserFormData = {
      nom: '',
      prenom: '',
      genre: '',
      telephone: '',
      email: '',
      statutSejour: '',
      gestionnaire: '',
      nationalite: '',
      trancheAge: '',
      remarques: '',
      secteur: '',
      langue: '',
      premierContact: '',
      notesGenerales: '', // S'assurer que ce champ est bien initialisé
      informationImportante: '', // Important pour NotesStep
      etat: 'Actif', // Valeur par défaut
      antenne: '',
      dateNaissance: '',
      dateOuverture: new Date().toISOString().split('T')[0],
      dateCloture: '',
      id: undefined,
      rgpdAttestationGeneratedAt: null,
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
      hasPrevExp: false,
      prevExpDateReception: '',
      prevExpDateRequete: '',
      prevExpDateVad: '',
      prevExpDecision: '',
      prevExpCommentaire: '',
      // Nouveaux champs manquants
      prevExpMotifRequete: '',
      prevExpDateAudience: '',
      prevExpDateSignification: '',
      prevExpDateJugement: '',
      prevExpDateExpulsion: '',
      prevExpDossierOuvert: '',
      prevExpDemandeCpas: '',
      prevExpNegociationProprio: '',
      prevExpSolutionRelogement: '',
      prevExpMaintienLogement: '',
      prevExpTypeFamille: '',
      prevExpTypeRevenu: '',
      prevExpEtatLogement: '',
      prevExpNombreChambre: '',
      prevExpAideJuridique: '',
      situationProfessionnelle: '',
      revenus: '',
      afficherDonneesConfidentielles: false,
      donneesConfidentielles: '',

      // Initialisation du tableau partenaires
      partenaire: [],
      logementDetails: {
        type: '',
        statut: '',
        nombrePieces: 0,
        bailleur: '',
        commentaires: '',
        typeLogement: '',
        dateEntree: '',
        dateSortie: '',
        motifSortie: '',
        destinationSortie: '',
        proprietaire: '',
        loyer: '',
        charges: '',
        commentaire: '',
        hasLitige: false,
        // Champs manquants LogementDetailsForm
        bailEnregistre: '',
        dateContrat: '',
        dureeContrat: '',
        garantieLocative: '',
        statutGarantie: '',
        typeLitige: '',
        dateLitige: '',
        descriptionLitige: '',
        actionsPrises: '',
        datePreavis: '',
        dureePreavis: '',
        preavisPour: ''
      },
      problematiques: [],
      problematiquesDetails: '',
      actions: [],
    };

    if (initialData) {
      // Complete conversion function to map ALL fields from User to UserFormData
      const convertedData: UserFormData = {
        ...defaultData,
        nom: initialData.nom || '',
        prenom: initialData.prenom || '',
        genre: initialData.genre || '',
        telephone: initialData.telephone || '',
        email: initialData.email || '',
        statutSejour: initialData.statutSejour || '',
        gestionnaire: (() => {
          // Conversion robuste du gestionnaire
          if (!initialData.gestionnaire) return '';
          if (typeof initialData.gestionnaire === 'string') return initialData.gestionnaire;
          if (typeof initialData.gestionnaire === 'object' && initialData.gestionnaire?.id) {
            return initialData.gestionnaire.id;
          }
          if (typeof initialData.gestionnaire === 'object' && initialData.gestionnaire?.prenom) {
            return initialData.gestionnaire.prenom;
          }
          return '';
        })(),
        nationalite: initialData.nationalite || '',
        trancheAge: initialData.trancheAge || '',
        remarques: initialData.remarques || '',
        secteur: initialData.secteur || '',
        langue: initialData.langue || '',
        premierContact: initialData.premierContact || '',
        notesGenerales: initialData.notesGenerales || '',
        informationImportante: initialData.informationImportante || '',
        etat: initialData.etat || 'Ouvert',
        antenne: initialData.antenne || '',
        // Missing fields mapping
        situationProfessionnelle: initialData.situationProfessionnelle || '',
        revenus: initialData.revenus || '',
        hasPrevExp: initialData.hasPrevExp || false,
        prevExpMotifRequete: initialData.prevExpMotifRequete || '',
        prevExpDecision: initialData.prevExpDecision || '',
        prevExpDemandeCpas: initialData.prevExpDemandeCpas || '',
        prevExpNegociationProprio: initialData.prevExpNegociationProprio || '',
        prevExpSolutionRelogement: initialData.prevExpSolutionRelogement || '',
        prevExpMaintienLogement: initialData.prevExpMaintienLogement || '',
        prevExpTypeFamille: initialData.prevExpTypeFamille || '',
        prevExpTypeRevenu: initialData.prevExpTypeRevenu || '',
        prevExpEtatLogement: initialData.prevExpEtatLogement || '',
        prevExpNombreChambre: initialData.prevExpNombreChambre || '',
        prevExpAideJuridique: initialData.prevExpAideJuridique || '',

        // Conversion Partenaire: si c'est une string (ancien format), on la met dans un tableau
        // Conversion Partenaire: si c'est une string (ancien format), on la met dans un tableau d'objets
        partenaire: Array.isArray(initialData.partenaire)
          ? initialData.partenaire.map((p: any) => typeof p === 'string' ? { id: p, nom: p } : p)
          : initialData.partenaire
            ? [typeof initialData.partenaire === 'string' ? { id: initialData.partenaire, nom: initialData.partenaire } : initialData.partenaire]
            : [],
        dateNaissance: typeof initialData.dateNaissance === 'string'
          ? initialData.dateNaissance.split('T')[0]
          : initialData.dateNaissance
            ? initialData.dateNaissance.toISOString().split('T')[0]
            : '',
        dateOuverture: typeof initialData.dateOuverture === 'string'
          ? initialData.dateOuverture.split('T')[0]
          : initialData.dateOuverture
            ? initialData.dateOuverture.toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        dateCloture: typeof initialData.dateCloture === 'string'
          ? initialData.dateCloture.split('T')[0]
          : initialData.dateCloture
            ? initialData.dateCloture.toISOString().split('T')[0]
            : '',
        id: initialData.id,
        rgpdAttestationGeneratedAt: initialData.rgpdAttestationGeneratedAt || null,

        // Dates formatting for PrevExp
        prevExpDateReception: typeof initialData.prevExpDateReception === 'string' ? initialData.prevExpDateReception.split('T')[0] : '',
        prevExpDateRequete: typeof initialData.prevExpDateRequete === 'string' ? initialData.prevExpDateRequete.split('T')[0] : '',
        prevExpDateVad: typeof initialData.prevExpDateVad === 'string' ? initialData.prevExpDateVad.split('T')[0] : '',
        prevExpDateAudience: typeof initialData.prevExpDateAudience === 'string' ? initialData.prevExpDateAudience.split('T')[0] : '',
        prevExpDateSignification: typeof initialData.prevExpDateSignification === 'string' ? initialData.prevExpDateSignification.split('T')[0] : '',
        prevExpDateJugement: typeof initialData.prevExpDateJugement === 'string' ? initialData.prevExpDateJugement.split('T')[0] : '',
        prevExpDateExpulsion: typeof initialData.prevExpDateExpulsion === 'string' ? initialData.prevExpDateExpulsion.split('T')[0] : '',

        // Audit trail fields
        createdBy: (initialData as any).createdBy || null,
        createdAt: (initialData as any).createdAt || null,
        updatedBy: (initialData as any).updatedBy || null,
        updatedAt: (initialData as any).updatedAt || null,
      };

      // Map address fields
      if (initialData.adresse) {
        convertedData.adresse = {
          rue: initialData.adresse.rue || '',
          numero: initialData.adresse.numero || '',
          boite: initialData.adresse.boite || '',
          codePostal: initialData.adresse.codePostal || '',
          ville: initialData.adresse.ville || (initialData.adresse as any).commune || '',
          quartier: initialData.adresse.quartier || '',
          pays: initialData.adresse.pays || '',
          secteur: initialData.adresse.secteur || ''
        };
      }

      // Map logement fields - handle both logement and logementDetails
      const logementSource = (initialData as any).logement || (initialData as any).logementDetails;
      if (logementSource) {
        convertedData.logementDetails = {
          ...defaultData.logementDetails,
          type: logementSource.type || '',
          statut: logementSource.statut || '',
          nombrePieces: logementSource.nombrePieces || 0,
          bailleur: logementSource.bailleur || '',
          commentaires: logementSource.commentaires || '',
          typeLogement: logementSource.typeLogement || '',
          dateEntree: logementSource.dateEntree || '',
          dateSortie: logementSource.dateSortie || '',
          motifSortie: logementSource.motifSortie || '',
          destinationSortie: logementSource.destinationSortie || '',
          proprietaire: logementSource.proprietaire || '',
          loyer: logementSource.loyer || '',
          charges: logementSource.charges || '',
          commentaire: logementSource.commentaire || '',
          hasLitige: logementSource.hasLitige || false,
          // Mapping nouveaux champs
          bailEnregistre: logementSource.bailEnregistre || '',
          dateContrat: logementSource.dateContrat || '',
          dureeContrat: logementSource.dureeContrat || '',
          garantieLocative: logementSource.garantieLocative || '',
          statutGarantie: logementSource.statutGarantie || '',
          typeLitige: logementSource.typeLitige || '',
          dateLitige: logementSource.dateLitige || '',
          descriptionLitige: logementSource.descriptionLitige || '',
          actionsPrises: logementSource.actionsPrises || '',
          datePreavis: logementSource.datePreavis || '',
          dureePreavis: logementSource.dureePreavis || '',
          preavisPour: logementSource.preavisPour || '',
        };
      }

      // Map problematiques
      if (initialData.problematiques && Array.isArray(initialData.problematiques)) {
        convertedData.problematiques = initialData.problematiques.map(p => ({
          id: p.id,
          type: p.type || '',
          description: p.description || p.detail || '',
          dateSignalement: p.dateSignalement || new Date().toISOString(),
          detail: p.detail || '',
        }));
      }

      // Mapping pour le champ "Détails supplémentaires"
      convertedData.problematiquesDetails = initialData.problematiquesDetails || '';

      // Map actions
      if (initialData.actions && Array.isArray(initialData.actions)) {
        convertedData.actions = initialData.actions.map(a => ({
          description: a.description || '',
          date: a.date || '',
          fait: (a as any).fait || false,
          type: a.type || '',
          partenaire: a.partenaire || '',
        }));
      }

      return convertedData;
    }

    return defaultData;
  });

  // State for real gestionnaires data
  const [gestionnaires, setGestionnaires] = useState<Array<{ id: string; prenom: string; nom: string }>>([]);

  // Load gestionnaires on component mount
  useEffect(() => {
    const fetchGestionnaires = async () => {
      try {
        const response = await fetch('/api/gestionnaires');
        if (response.ok) {
          const data = await response.json();
          // Normalisation des gestionnaires pour le select
          const rawGestionnaires = Array.isArray(data) ? data : data.gestionnaires || [];
          setGestionnaires(rawGestionnaires.map((g: any) => ({
            id: g.id || g._id,  // Fallback si _id
            prenom: g.prenom,
            nom: g.nom || ''
          })));
        } else {
          console.warn('Could not fetch gestionnaires, using fallback data');
          setGestionnaires([
            { id: 'gest-1', prenom: 'Houssaine', nom: '' },
            { id: 'gest-2', prenom: 'Samia', nom: '' },
            { id: 'gest-3', prenom: 'Mohamed', nom: '' },
            { id: 'gest-4', prenom: 'Delphine', nom: '' },
            { id: 'gest-5', prenom: 'Fatima', nom: '' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching gestionnaires:', error);
        setGestionnaires([
          { id: 'gest-1', prenom: 'Houssaine', nom: '' },
          { id: 'gest-2', prenom: 'Samia', nom: '' },
          { id: 'gest-3', prenom: 'Mohamed', nom: '' },
          { id: 'gest-4', prenom: 'Delphine', nom: '' },
          { id: 'gest-5', prenom: 'Fatima', nom: '' }
        ]);
      }
    };

    fetchGestionnaires();
  }, []);

  // Handle field changes
  const handleFieldChange = (field: keyof UserFormData | string, value: any) => {
    setFormData((prev: UserFormData) => {
      if (field.includes('.')) {
        const [parentField, childField] = field.split('.');
        return {
          ...prev,
          [parentField]: {
            ...(prev[parentField as keyof UserFormData] as any),
            [childField]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle nested input changes (specifically for logementDetails)
  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof UserFormData] as any),
        [childField]: value
      }
    }));
  };

  // Fields per step mapping (for per-step validation)
  const STEP_FIELDS: Record<number, string[]> = {
    1: ['nom', 'prenom', 'genre', 'telephone', 'email', 'langue'],
    2: ['dateNaissance', 'nationalite', 'statutSejour', 'trancheAge'],
    3: ['gestionnaire', 'antenne', 'etat', 'premierContact'],
    4: ['hasPrevExp'], // Logement step
    5: [], // Problématiques step - arrays
    6: ['remarques', 'notesGenerales'] // Notes step
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      // Per-step validation: check required fields for current step
      if (requiredFields && requiredFields.length > 0) {
        const currentStepFields = STEP_FIELDS[currentStep] || [];
        const requiredForThisStep = requiredFields.filter(f => currentStepFields.includes(f));

        if (requiredForThisStep.length > 0) {
          const missingFields: string[] = [];

          for (const fieldName of requiredForThisStep) {
            const value = (formData as any)[fieldName];
            if (!value || (typeof value === 'string' && value.trim() === '')) {
              missingFields.push(fieldName);
            }
          }

          if (missingFields.length > 0) {
            const fieldLabels: Record<string, string> = {
              nom: 'Nom', prenom: 'Prénom', genre: 'Genre',
              telephone: 'Téléphone', email: 'Email', langue: 'Langue',
              dateNaissance: 'Date de naissance', nationalite: 'Nationalité',
              statutSejour: 'Statut séjour', trancheAge: 'Tranche d\'âge',
              gestionnaire: 'Gestionnaire', antenne: 'Antenne',
              etat: 'État', premierContact: 'Premier contact',
              remarques: 'Remarques', notesGenerales: 'Notes générales'
            };

            const missingLabels = missingFields.map(f => fieldLabels[f] || f);
            alert(
              `⚠️ Champs obligatoires manquants sur cette étape :\n\n` +
              `• ${missingLabels.join('\n• ')}\n\n` +
              `Veuillez remplir ces champs avant de continuer.`
            );
            return; // Block navigation
          }
        }
      }

      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  // Form submission logic
  const handleSubmit = async () => {
    // VALIDATION: Check required fields from settings
    if (requiredFields && requiredFields.length > 0) {
      const missingFields: string[] = [];

      for (const fieldName of requiredFields) {
        const value = (formData as any)[fieldName];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          missingFields.push(fieldName);
        }
      }

      if (missingFields.length > 0) {
        const fieldLabels: Record<string, string> = {
          nom: 'Nom',
          prenom: 'Prénom',
          genre: 'Genre',
          telephone: 'Téléphone',
          email: 'Email',
          antenne: 'Antenne',
          gestionnaire: 'Gestionnaire',
          nationalite: 'Nationalité',
          statutSejour: 'Statut séjour',
          dateNaissance: 'Date de naissance',
          dateOuverture: 'Date d\'ouverture'
        };

        const missingLabels = missingFields.map(f => fieldLabels[f] || f);
        alert(
          `⚠️ Champs obligatoires manquants :\n\n` +
          `• ${missingLabels.join('\n• ')}\n\n` +
          `Veuillez remplir ces champs avant de sauvegarder.`
        );
        return; // Stop submission
      }
    }

    // SECURITY: Future Date Warning
    if (formData.dateOuverture) {
      const submittedDate = new Date(formData.dateOuverture);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today to midnight

      if (submittedDate > today) {
        const confirmed = window.confirm(
          "⚠️ Attention : La date d'ouverture indiquée est dans le futur.\n\n" +
          "Cela placera ce dossier en tête de la liste 'Derniers ajouts' et pourrait fausser le tri.\n\n" +
          "Confirmez-vous vouloir conserver cette date ?"
        );
        if (!confirmed) return; // Stop submission if cancelled
      }
    }

    try {
      setIsSubmitting(true);
      const submissionData = {
        ...formData,
        partenaire: Array.isArray(formData.partenaire) && formData.partenaire.length > 0
          ? formData.partenaire.map(p => p.nom || p.id).join(', ')
          : null
      };
      await onSubmit(submissionData as Partial<User>);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    submitForm: handleSubmit,
    resetForm: () => setFormData({} as UserFormData),
    getCurrentData: () => formData,
    isDirty: () => false
  }));

  // Preparation des options pour ManagementStep
  const gestionnaireOptions = gestionnaires.map(g => ({
    value: g.id,
    label: `${g.prenom} ${g.nom}`.trim()
  }));

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formData={formData}
            errors={errors}
            onInputChange={handleFieldChange}
          />
        );
      case 2:
        return (
          <PersonalInfoStep
            formData={formData}
            errors={errors}
            onInputChange={handleFieldChange}
            situationProfessionnelleOptions={situationProfessionnelleOptions.map(s => ({ value: s.value, label: s.label }))}
            languageOptions={[
              { value: '', label: 'Sélectionner...' },
              ...languageOptions.map(l => ({ value: l.value, label: l.label }))
            ]}
            nationaliteOptions={[
              { value: '', label: 'Sélectionner...' },
              ...nationaliteOptions.map(n => ({ value: n.value, label: n.label }))
            ]}
            statutSejourOptions={[
              { value: '', label: 'Sélectionner...' },
              ...optionsStatutSejour.map(s => ({ value: s.value, label: s.label }))
            ]}
          />
        );
      case 3:
        return (
          <ManagementStep
            formData={formData}
            errors={errors}
            onInputChange={handleFieldChange}
            gestionnaires={gestionnaireOptions}
            optionsAntenne={optionsAntenne}
            optionsEtat={optionsEtat}
            optionsPartenaire={optionsPartenaire}
          />
        );
      case 4:
        return (
          <HousingStep
            formData={formData}
            onInputChange={handleFieldChange}
            onNestedInputChange={handleNestedInputChange}
            optionsTypeLogementDyn={[
              { value: '', label: 'Sélectionner...' },
              ...optionsTypeLogementDyn.map(t => ({ value: t.value, label: t.label }))
            ]}
            optionsPrevExpDecision={optionsPrevExpDecision}
            optionsPrevExpDemandeCpas={optionsPrevExpDemandeCpas}
            optionsPrevExpNegociationProprio={optionsPrevExpNegociationProprio}
            optionsPrevExpSolutionRelogement={optionsPrevExpSolutionRelogement}
            optionsPrevExpTypeFamille={optionsPrevExpTypeFamille}
            optionsPrevExpTypeRevenu={optionsPrevExpTypeRevenu}
            optionsPrevExpEtatLogement={optionsPrevExpEtatLogement}
            optionsPrevExpNombreChambre={optionsPrevExpNombreChambre}
            optionsPrevExpAideJuridique={optionsPrevExpAideJuridique}
            optionsPrevExpMotifRequete={optionsPrevExpMotifRequete}
            optionsStatutGarantie={optionsStatutGarantie}
            optionsBailEnregistre={optionsBailEnregistre}
            optionsDureeContrat={optionsDureeContrat}
            optionsTypeLitige={optionsTypeLitige}
            optionsDureePreavis={optionsDureePreavis}
            optionsPreavisPour={optionsPreavisPour}
            revenusOptions={revenusOptions}
          />
        );
      case 5:
        return (
          <ProblematiquesActionsStep
            formData={formData}
            onInputChange={handleFieldChange}
          />
        );
      case 6:
        return (
          <NotesStep
            formData={formData}
            onInputChange={handleFieldChange}
          />
        );
      default:
        return <div>Étape inconnue</div>;
    }
  };

  // Check step completion
  const isStepCompleted = (stepId: number): boolean => {
    return stepId < currentStep; // Previous steps are considered completed
  };

  const getStepIcon = (stepId: number): string => {
    if (isStepCompleted(stepId)) return '✓';
    return stepId.toString();
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Enhanced step indicator with progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleStepClick(step.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${currentStep === step.id
                    ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-300'
                    : isStepCompleted(step.id)
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                >
                  {getStepIcon(step.id)}
                </button>
                <div className="text-center mt-2">
                  <div className={`text-sm font-semibold ${currentStep === step.id
                    ? 'text-indigo-600'
                    : isStepCompleted(step.id)
                      ? 'text-green-600'
                      : 'text-gray-700'
                    }`}>
                    {step.title}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 max-w-32">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 mt-[-20px] ${isStepCompleted(step.id + 1) || currentStep > step.id
                  ? 'bg-green-300'
                  : 'bg-gray-200'
                  }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {renderCurrentStep()}
      </div>

      {/* Audit Trail Info (only in edit mode) */}
      {mode === 'edit' && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-500">
          <div className="flex flex-wrap gap-4">
            {(formData as any).createdBy ? (
              <span>
                📝 Créé par <strong className="text-gray-700">{(formData as any).createdBy}</strong>
                {(formData as any).createdAt && (
                  <> le {new Date((formData as any).createdAt).toLocaleDateString('fr-BE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</>
                )}
              </span>
            ) : (
              /* Fallback: show gestionnaire for old records */
              formData.gestionnaire && gestionnaires.length > 0 && (
                <span>
                  📝 Créé par <strong className="text-gray-700">
                    {gestionnaires.find(g => g.id === formData.gestionnaire)?.prenom || 'Gestionnaire'} (présumé)
                  </strong>
                </span>
              )
            )}
            {(formData as any).updatedBy && (
              <span>
                ✏️ Modifié par <strong className="text-gray-700">{(formData as any).updatedBy}</strong>
                {(formData as any).updatedAt && (
                  <> le {new Date((formData as any).updatedAt).toLocaleDateString('fr-BE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</>
                )}
              </span>
            )}
            {!(formData as any).createdBy && !(formData as any).updatedBy && !formData.gestionnaire && (
              <span className="italic">Traçabilité non disponible (dossier créé avant activation)</span>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
        >
          ← Précédent
        </button>

        <div className="space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
            >
              Annuler
            </button>
          )}

          {currentStep === STEPS.length ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
            >
              {isSubmitting
                ? (mode === 'edit' ? 'Mise à jour...' : 'Enregistrement...')
                : (mode === 'edit' ? '✓ Mettre à jour' : '✓ Enregistrer')
              }
            </button>
          ) : (
            <>
              {mode === 'edit' && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mr-3"
                >
                  {isSubmitting ? 'Mise à jour...' : '✓ Mettre à jour'}
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors duration-200"
              >
                Suivant →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

UserForm.displayName = 'UserForm';

export default UserForm;
