import React, { useImperativeHandle, forwardRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useAdmin } from '@/contexts/AdminContext';
import { User } from '@/types/user';
import { UserFormRef } from '@/types';
import { useDropdownOptionsAPI } from '@/hooks/useDropdownOptionsAPI';

// Step components
import { BasicInfoStep } from './form-steps/BasicInfoStep';
import { PersonalInfoStep } from './form-steps/PersonalInfoStep';
import { ManagementStep } from './form-steps/ManagementStep';
import { HousingStep } from './form-steps/HousingStep';
import { ProblematiquesActionsStep } from './form-steps/ProblematiquesActionsStep';
import { NotesStep } from './form-steps/NotesStep';
import { MediationConflictStep } from './form-steps/MediationConflictStep';
import { MediationClosingStep } from './form-steps/MediationClosingStep';

// Modular UI components
import { UserFormStepper } from './UserFormStepper';
import { UserFormAuditTrail } from './UserFormAuditTrail';
import { UserFormNavigation } from './UserFormNavigation';

// Custom logic hook
import { useUserFormLogic } from '../hooks/useUserFormLogic';

interface UserFormProps {
  initialData?: Partial<User>;
  onSubmit: (userData: Partial<User>) => Promise<void>;
  onCancel?: () => void;
  onDelete?: () => void;
  mode?: 'create' | 'edit';
  className?: string;
}

const PASQ_STEPS = [
  { id: 1, title: 'Identification', description: 'Nom, prénom et contact' },
  { id: 2, title: 'Infos personnelles', description: 'Naissance, nationalité' },
  { id: 3, title: 'Gestion', description: 'Gestionnaire, antenne et statut' },
  { id: 4, title: 'Logement', description: 'Situation logement & Prévention' },
  { id: 5, title: 'Problématiques', description: 'Suivi social & Actions' },
  { id: 6, title: 'Notes & Bilan', description: 'Notes générales et synthèse' }
];

const MEDIATION_STEPS = [
  { id: 1, title: 'L\'Usager', description: 'Identité et coordonnées' },
  { id: 2, title: 'Le Litige', description: 'Gestionnaire et contexte du conflit' },
  { id: 3, title: 'Suivi & Bilan', description: 'Actions entreprises et conclusion' }
];

export const UserForm = forwardRef<UserFormRef, UserFormProps>((
  {
    initialData,
    onSubmit,
    onCancel,
    onDelete,
    mode = 'create',
    className = ''
  },
  ref
) => {
  const { data: session } = useSession();
  const { enabledModules } = useAdmin();
  const currentServiceId = (session?.user as any)?.serviceId || 'default';

  // Déterminer si on utilise le flux Médiation (plus court, 3 étapes)
  // Basé sur le module activé OU l'ID du service pour la compatibilité
  const isMediation = useMemo(() => {
    return enabledModules.mediationFlow === true || currentServiceId.includes('mediation');
  }, [enabledModules, currentServiceId]);

  const steps = useMemo(() => isMediation ? MEDIATION_STEPS : PASQ_STEPS, [isMediation]);

  const {
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
  } = useUserFormLogic({ initialData, onSubmit, mode, totalSteps: steps.length });

  // Dropdown options hooks (Some kept for PASQ mode)
  const { options: optionsEtat } = useDropdownOptionsAPI('etat');
  const { options: optionsAntenne } = useDropdownOptionsAPI('antenne', 30000);
  const { options: optionsTypeLogementDyn } = useDropdownOptionsAPI('typeLogement');
  const { options: languageOptions } = useDropdownOptionsAPI('langue');
  const { options: nationaliteOptions } = useDropdownOptionsAPI('nationalite');
  const { options: optionsStatutSejour } = useDropdownOptionsAPI('statutSejour');
  const { options: situationProfessionnelleOptions } = useDropdownOptionsAPI('situationProfessionnelle');
  const { options: optionsPartenaire } = useDropdownOptionsAPI('partenaire');

  // Specific options API for housing
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

  // Constants
  const optionsStatutGarantie = [{ value: 'Constituée', label: 'Constituée' }, { value: 'En cours', label: 'En cours' }, { value: 'Non constituée', label: 'Non constituée' }];
  const optionsBailEnregistre = [{ value: 'Oui', label: 'Oui' }, { value: 'Non', label: 'Non' }, { value: 'Inconnu', label: 'Inconnu' }];
  const optionsDureeContrat = [{ value: '1 an', label: '1 an' }, { value: '3 ans', label: '3 ans' }, { value: '9 ans', label: '9 ans' }, { value: 'CDI', label: 'CDI' }, { value: 'Autre', label: 'Autre' }];
  const optionsTypeLitige = [{ value: 'Loyer', label: 'Loyer impayé' }, { value: 'Trouble', label: 'Trouble de voisinage' }, { value: 'Insalubrité', label: 'Insalubrité' }, { value: 'Autre', label: 'Autre' }];
  const optionsDureePreavis = [{ value: '3 mois', label: '3 mois' }, { value: '6 mois', label: '6 mois' }, { value: 'Autre', label: 'Autre' }];
  const optionsPreavisPour = [{ value: 'Bailleur', label: 'Bailleur' }, { value: 'Locataire', label: 'Locataire' }];
  const revenusOptions = [{ value: 'Salaire', label: 'Salaire' }, { value: 'CPAS', label: 'CPAS' }, { value: 'Chômage', label: 'Chômage' }, { value: 'Pension', label: 'Pension' }, { value: 'Autre', label: 'Autre' }];

  // Static options transformation
  const transformOptions = (opts: any[]) => opts.map(o => ({ value: o.value, label: o.label }));
  const transformWithPlaceholder = (opts: any[]) => [{ value: '', label: 'Sélectionner...' }, ...transformOptions(opts)];

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    submitForm: handleSubmit,
    resetForm: () => { }, // Handled by page container usually
    getCurrentData: () => formData,
    isDirty: () => false
  }));

  const renderCurrentStep = () => {
    // Médiation Locale Ultra-Simplified Flow
    if (isMediation) {
      switch (currentStep) {
        case 1:
          return <BasicInfoStep formData={formData} errors={errors} onInputChange={handleFieldChange} />;
        case 2:
          return (
            <MediationConflictStep
              formData={formData}
              errors={errors}
              onInputChange={handleFieldChange}
              gestionnaires={gestionnaires.filter(g => (g as any).isGestionnaireDossier !== false).map(g => ({ value: g.id, label: `${g.prenom} ${g.nom}`.trim() }))}
              optionsAntenne={optionsAntenne}
              optionsEtat={optionsEtat}
            />
          );
        case 3:
          return <MediationClosingStep formData={formData} onInputChange={handleFieldChange} />;
        default:
          return <div>Étape inconnue</div>;
      }
    }

    // Default PASQ Flow
    switch (currentStep) {
      case 1:
        return <BasicInfoStep formData={formData} errors={errors} onInputChange={handleFieldChange} />;
      case 2:
        return (
          <PersonalInfoStep
            formData={formData}
            errors={errors}
            onInputChange={handleFieldChange}
            situationProfessionnelleOptions={transformOptions(situationProfessionnelleOptions)}
            languageOptions={transformWithPlaceholder(languageOptions)}
            nationaliteOptions={transformWithPlaceholder(nationaliteOptions)}
            statutSejourOptions={transformWithPlaceholder(optionsStatutSejour)}
          />
        );
      case 3:
        return (
          <ManagementStep
            formData={formData}
            errors={errors}
            onInputChange={handleFieldChange}
            gestionnaires={gestionnaires.filter(g => (g as any).isGestionnaireDossier !== false).map(g => ({ value: g.id, label: `${g.prenom} ${g.nom}`.trim() }))}
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
            optionsTypeLogementDyn={transformWithPlaceholder(optionsTypeLogementDyn)}
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
        return <ProblematiquesActionsStep formData={formData} onInputChange={handleFieldChange} />;
      case 6:
        return <NotesStep formData={formData} onInputChange={handleFieldChange} />;
      default:
        return <div>Étape inconnue</div>;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <UserFormStepper steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {renderCurrentStep()}
      </div>

      <UserFormAuditTrail formData={formData} mode={mode} gestionnaires={gestionnaires} />

      <UserFormNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        isSubmitting={isSubmitting}
        mode={mode}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        onDelete={onDelete}
      />
    </div>
  );
});

UserForm.displayName = 'UserForm';

export default UserForm;
