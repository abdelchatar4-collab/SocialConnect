/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { UserFormData } from './user';

export interface ProposedItem {
    type: string;
    description?: string;
    date?: string;
    validated: boolean;
}

export interface AnalysisResult {
    actions: ProposedItem[];
    problematiques: ProposedItem[];
}

export interface UseNotesAIProps {
    formData: UserFormData;
    onInputChange: (field: keyof UserFormData, value: any) => void;
}
