/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserListFilters } from '@/features/users/components/UserList/UserListFilters';
import { describe, it, expect, vi } from 'vitest';

describe('UserListFilters Component', () => {
    const defaultProps = {
        searchTerm: '',
        searchField: 'all' as const,
        onSearchTermChange: vi.fn(),
        onSearchFieldChange: vi.fn(),
        problematiqueFilter: '',
        onProblematiqueFilterChange: vi.fn(),
        problematiquesOptions: [{ value: 'p1', label: 'Prob 1' }],
        showImportantInfoOnly: false,
        onShowImportantInfoOnlyChange: vi.fn(),
        showDonneesConfidentielles: false,
        onShowDonneesConfidentiellesChange: vi.fn(),
        showMissingBirthDate: false,
        onShowMissingBirthDateChange: vi.fn(),
        showDuplicates: false,
        onShowDuplicatesChange: vi.fn(),
        importantInfoCount: 0,
        donneesConfidentiellesCount: 0,
        missingBirthDateCount: 0,
        duplicatesCount: 0,
        totalUsersCount: 10,
        lastAddedUser: null,
        myDossiersCount: 2,
        showProblematiques: false,
        onShowProblematiquesChange: vi.fn(),
        showActions: false,
        onShowActionsChange: vi.fn(),
        showDossier: false,
        onShowDossierChange: vi.fn(),
        showPhone: false,
        onShowPhoneChange: vi.fn(),
        showAdresse: false,
        onShowAdresseChange: vi.fn(),
        showDateNaissance: false,
        onShowDateNaissanceChange: vi.fn(),
        viewMode: 'table' as const,
        onViewModeChange: vi.fn(),
        includeDateInDuplicates: true,
        onIncludeDateInDuplicatesChange: vi.fn(),
    };

    it('renders search input correctly', () => {
        render(<UserListFilters {...defaultProps} />);
        const input = screen.getByPlaceholderText('Rechercher...');
        expect(input).toBeInTheDocument();
    });

    it('calls onSearchTermChange when typing', () => {
        render(<UserListFilters {...defaultProps} />);
        const input = screen.getByPlaceholderText('Rechercher...');
        fireEvent.change(input, { target: { value: 'Dupont' } });
        expect(defaultProps.onSearchTermChange).toHaveBeenCalledWith('Dupont');
    });

    it('displays total users count', () => {
        render(<UserListFilters {...defaultProps} />);
        expect(screen.getByText('Total des dossiers')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
    });
});
