/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useState, useCallback, useEffect } from 'react';
import { User, UserFormData, FormErrors } from '@/types';
import { useAdmin } from '@/contexts/AdminContext';
import { useDropdownOptionsAPI } from '@/hooks/useDropdownOptionsAPI';

interface UseUserFormLogicProps {
    initialData?: Partial<User>;
    onSubmit: (userData: Partial<User>) => Promise<void>;
    mode: 'create' | 'edit';
    totalSteps: number;
}

export const useUserFormLogic = ({ initialData, onSubmit, mode, totalSteps }: UseUserFormLogicProps) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [gestionnaires, setGestionnaires] = useState<Array<{ id: string; prenom: string; nom: string }>>([]);

    const { requiredFields } = useAdmin();

    // Load gestionnaires
    useEffect(() => {
        const fetchGestionnaires = async () => {
            try {
                const response = await fetch('/api/gestionnaires');
                if (response.ok) {
                    const data = await response.json();
                    const rawGestionnaires = Array.isArray(data) ? data : data.gestionnaires || [];

                    // On filtre pour ne garder que les actifs,
                    // SAUF si le gestionnaire actuel est inactif (pour qu'il reste visible dans la liste d'édition)
                    const filtered = rawGestionnaires.filter((g: any) => {
                        if (g.isActive !== false) return true;
                        // Si on est en mode édition et que c'est le gestionnaire actuel, on le garde
                        if (mode === 'edit' && initialData && (
                            String(g.id) === String(initialData.gestionnaire) ||
                            String(g.prenom) === String(initialData.gestionnaire)
                        )) {
                            return true;
                        }
                        return false;
                    });

                    setGestionnaires(filtered.map((g: any) => ({
                        id: g.id || g._id,
                        prenom: g.prenom,
                        nom: g.nom || '',
                        isActive: g.isActive !== false
                    })));
                } else {
                    // Fallback if API fails
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
            }
        };
        fetchGestionnaires();
    }, []);

    // Initialize form data with mapping
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
            notesGenerales: '',
            informationImportante: '',
            etat: 'Actif',
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
            mediationType: '',
            mediationDemandeur: '',
            mediationPartieAdverse: '',
            mediationStatut: '',
            mediationDescription: '',
            problematiques: [],
            problematiquesDetails: '',
            actions: [],
        };

        if (initialData) {
            const convertedData: UserFormData = {
                ...defaultData,
                nom: initialData.nom || '',
                prenom: initialData.prenom || '',
                genre: initialData.genre || '',
                telephone: initialData.telephone || '',
                email: initialData.email || '',
                statutSejour: initialData.statutSejour || '',
                gestionnaire: (() => {
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
                mediationType: initialData.mediationType || '',
                mediationDemandeur: initialData.mediationDemandeur || '',
                mediationPartieAdverse: initialData.mediationPartieAdverse || '',
                mediationStatut: initialData.mediationStatut || '',
                mediationDescription: initialData.mediationDescription || '',
                id: initialData.id,
                rgpdAttestationGeneratedAt: initialData.rgpdAttestationGeneratedAt || null,
                prevExpDateReception: typeof initialData.prevExpDateReception === 'string' ? initialData.prevExpDateReception.split('T')[0] : '',
                prevExpDateRequete: typeof initialData.prevExpDateRequete === 'string' ? initialData.prevExpDateRequete.split('T')[0] : '',
                prevExpDateVad: typeof initialData.prevExpDateVad === 'string' ? initialData.prevExpDateVad.split('T')[0] : '',
                prevExpDateAudience: typeof initialData.prevExpDateAudience === 'string' ? initialData.prevExpDateAudience.split('T')[0] : '',
                prevExpDateSignification: typeof initialData.prevExpDateSignification === 'string' ? initialData.prevExpDateSignification.split('T')[0] : '',
                prevExpDateJugement: typeof initialData.prevExpDateJugement === 'string' ? initialData.prevExpDateJugement.split('T')[0] : '',
                prevExpDateExpulsion: typeof initialData.prevExpDateExpulsion === 'string' ? initialData.prevExpDateExpulsion.split('T')[0] : '',
                createdBy: (initialData as any).createdBy || null,
                createdAt: (initialData as any).createdAt || null,
                updatedBy: (initialData as any).updatedBy || null,
                updatedAt: (initialData as any).updatedAt || null,
            };

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

            if (initialData.problematiques && Array.isArray(initialData.problematiques)) {
                convertedData.problematiques = initialData.problematiques.map(p => ({
                    id: p.id,
                    type: p.type || '',
                    description: p.description || p.detail || '',
                    dateSignalement: p.dateSignalement || new Date().toISOString(),
                    detail: p.detail || '',
                }));
            }

            convertedData.problematiquesDetails = initialData.problematiquesDetails || '';

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

    const handleFieldChange = useCallback((field: string, value: any) => {
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

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    }, [errors]);

    const handleNestedInputChange = useCallback((parentField: string, childField: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parentField]: {
                ...(prev[parentField as keyof UserFormData] as any),
                [childField]: value
            }
        }));
    }, []);

    const STEP_FIELDS: Record<number, string[]> = {
        1: ['nom', 'prenom', 'genre', 'telephone', 'email', 'langue'],
        2: ['dateNaissance', 'nationalite', 'statutSejour', 'trancheAge'],
        3: ['gestionnaire', 'antenne', 'etat', 'premierContact'],
        4: ['hasPrevExp'],
        5: [],
        6: ['remarques', 'notesGenerales']
    };

    const validateStep = useCallback((step: number): boolean => {
        if (!requiredFields || requiredFields.length === 0) return true;

        const currentStepFields = STEP_FIELDS[step] || [];
        const requiredForThisStep = requiredFields.filter(f => currentStepFields.includes(f));

        if (requiredForThisStep.length > 0) {
            const missingFields: string[] = [];
            for (const fieldName of requiredForThisStep) {
                let value;
                if (fieldName.includes('.')) {
                    const [parent, child] = fieldName.split('.');
                    value = (formData as any)[parent]?.[child];
                } else {
                    value = (formData as any)[fieldName];
                }

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
                return false;
            }
        }
        return true;
    }, [formData, requiredFields]);

    const handleNext = useCallback(() => {
        if (currentStep < totalSteps) {
            if (validateStep(currentStep)) {
                setCurrentStep(prev => prev + 1);
            }
        }
    }, [currentStep, totalSteps, validateStep]);

    const handlePrevious = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const handleSubmit = useCallback(async () => {
        if (requiredFields && requiredFields.length > 0) {
            const missingFields: string[] = [];
            for (const fieldName of requiredFields) {
                let value;
                if (fieldName.includes('.')) {
                    const [parent, child] = fieldName.split('.');
                    value = (formData as any)[parent]?.[child];
                } else {
                    value = (formData as any)[fieldName];
                }

                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    missingFields.push(fieldName);
                }
            }

            if (missingFields.length > 0) {
                const fieldLabels: Record<string, string> = {
                    nom: 'Nom', prenom: 'Prénom', genre: 'Genre',
                    telephone: 'Téléphone', email: 'Email', antenne: 'Antenne',
                    gestionnaire: 'Gestionnaire', nationalite: 'Nationalité',
                    statutSejour: 'Statut séjour', dateNaissance: 'Date de naissance',
                    dateOuverture: 'Date d\'ouverture'
                };

                const missingLabels = missingFields.map(f => fieldLabels[f] || f);
                alert(
                    `⚠️ Champs obligatoires manquants :\n\n` +
                    `• ${missingLabels.join('\n• ')}\n\n` +
                    `Veuillez remplir ces champs avant de sauvegarder.`
                );
                return;
            }
        }

        if (formData.dateOuverture) {
            const today = new Date();
            const todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");

            if (formData.dateOuverture > todayStr) {
                const confirmed = window.confirm(
                    "⚠️ Attention : La date d'ouverture indiquée est dans le futur.\n\n" +
                    "Cela placera ce dossier en tête de la liste 'Derniers ajouts'.\n\n" +
                    "Confirmez-vous vouloir conserver cette date ?"
                );
                if (!confirmed) return;
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
    }, [formData, onSubmit, requiredFields]);

    return {
        currentStep,
        setCurrentStep,
        isSubmitting,
        errors,
        formData,
        gestionnaires,
        handleFieldChange,
        handleNestedInputChange,
        handleNext,
        handlePrevious,
        handleSubmit
    };
};
