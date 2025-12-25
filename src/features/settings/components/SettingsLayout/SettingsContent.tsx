/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Settings Content Component
*/

import React from 'react';
import GeneralSettings from '@/components/settings/GeneralSettings';
import CustomizationSettings from '@/components/settings/CustomizationSettings';
import GestionnaireSettings from '@/components/settings/GestionnaireSettings';
import DropdownOptionsSettings from '@/components/settings/DropdownOptionsSettings';
import { PartenairesSettings } from '@/components/settings/PartenairesSettings';
import GeographicalSettings from '@/components/settings/GeographicalSettings';
import { BirthdaySettings } from '@/components/settings/BirthdaySettings';
import AntennesSettings from '@/components/settings/AntennesSettings';
import AiSettings from '@/components/settings/AiSettings';
import ModuleSettings from '@/components/settings/ModuleSettings';
import ColumnVisibilitySettings from '@/components/settings/ColumnVisibilitySettings';
import FormSectionSettings from '@/components/settings/FormSectionSettings';
import { PrestationAdmin } from '@/features/prestations/components/PrestationAdmin';
import { PersonalPrestationSettings } from '@/features/prestations/components/PersonalPrestationSettings';

import { DocumentSettings } from '@/components/settings/DocumentSettings';

export const SettingsContent: React.FC<{ activeId: string }> = ({ activeId }) => {
    switch (activeId) {
        case 'customization': return <CustomizationSettings />;
        case 'modules': return <ModuleSettings />;
        case 'general': return <GeneralSettings />;
        case 'gestionnaires': return <GestionnaireSettings />;
        case 'options': return <DropdownOptionsSettings />;
        case 'partenaires': return <PartenairesSettings />;
        case 'geographie': return <GeographicalSettings />;
        case 'equipe': return <BirthdaySettings />;
        case 'antennes': return <AntennesSettings />;
        case 'ai': return <AiSettings />;
        case 'colonnes': return <ColumnVisibilitySettings />;
        case 'formulaire': return <FormSectionSettings />;
        case 'prestations': return <PrestationAdmin />;
        case 'documents': return <DocumentSettings />;
        case 'mon-horaire': return <PersonalPrestationSettings />;
        default: return <div className="p-8 text-center text-gray-500">Section non trouvée</div>;
    }
};
