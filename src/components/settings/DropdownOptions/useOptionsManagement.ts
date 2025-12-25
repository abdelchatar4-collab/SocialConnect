/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Options Management Hook
*/

import { useState, useEffect } from 'react';
import {
    getAllOptionSetsAPI,
    getOptionsByCategoryAPI,
    addOptionAPI,
    updateOptionAPI,
    deleteOptionAPI,
    DropdownOptionAPI,
    DropdownOptionSetAPI
} from '@/services/optionsServiceAPI';

export function useOptionsManagement() {
    const [optionSets, setOptionSets] = useState<DropdownOptionSetAPI[]>([]);
    const [selectedSet, setSelectedSet] = useState<DropdownOptionSetAPI | null>(null);
    const [detailedOptions, setDetailedOptions] = useState<DropdownOptionAPI[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { loadOptionSets(); }, []);

    const loadOptionSets = async () => {
        try {
            setLoading(true);
            const options = (await getAllOptionSetsAPI()).filter(opt => opt.id !== 'antenne');
            setOptionSets(options);
            if (options.length > 0 && !selectedSet) await handleSelectOptionSet(options[0].id, options);
        } catch (err) { setError('Erreur de chargement'); } finally { setLoading(false); }
    };

    const handleSelectOptionSet = async (id: string, sets = optionSets) => {
        if (selectedSet?.id === id) return;
        const set = sets.find(s => s.id === id);
        if (set) {
            setSelectedSet(set); setLoading(true);
            try { setDetailedOptions(await getOptionsByCategoryAPI(id)); } catch { setError('Erreur'); } finally { setLoading(false); }
        }
    };

    const reload = async () => { if (selectedSet) setDetailedOptions(await getOptionsByCategoryAPI(selectedSet.id)); };

    const addOption = async (val: string) => { if (selectedSet) { await addOptionAPI(selectedSet.id, val); await reload(); } };
    const updateOption = async (id: string, val: string) => { if (selectedSet) { await updateOptionAPI(selectedSet.id, id, val); await reload(); } };
    const deleteOption = async (id: string) => { if (selectedSet) { await deleteOptionAPI(selectedSet.id, id); await reload(); } };

    const resetToDefault = async () => {
        if (selectedSet && confirm(`Réinitialiser "${selectedSet.name}" ?`)) {
            setLoading(true);
            try {
                for (const o of detailedOptions) await deleteOptionAPI(selectedSet.id, o.id);
                if (selectedSet.id === 'prestation_motifs') {
                    const defaults = ['Présence', 'Télétravail', 'Congé VA', 'Congé CH', 'Maladie', '1 jour sans certificat', 'Jour férié', 'Formation', 'Réunion externe', 'Heures supp'];
                    for (const m of defaults) await addOptionAPI(selectedSet.id, m);
                }
                await reload();
            } finally { setLoading(false); }
        }
    };

    return { optionSets, selectedSet, detailedOptions, loading, error, handleSelectOptionSet, addOption, updateOption, deleteOption, resetToDefault };
}
