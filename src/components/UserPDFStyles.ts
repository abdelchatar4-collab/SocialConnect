/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Styles pour la génération PDF des fiches usager
*/

import { StyleSheet } from '@react-pdf/renderer';

// Styles pour le document PDF
export const pdfStyles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        paddingBottom: 20,
        borderBottomWidth: 3,
        borderBottomColor: '#3b82f6',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    logo: {
        width: 70,
        height: 50,
        marginRight: 20,
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 3,
    },
    etatBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    section: {
        marginBottom: 20,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    sectionHeader: {
        backgroundColor: '#f8fafc',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'left',
    },
    sectionContent: {
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    col: {
        flex: 1,
        marginRight: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4b5563',
        marginBottom: 4,
    },
    value: {
        fontSize: 13,
        color: '#111827',
        lineHeight: 1.4,
    },
    problematiqueItem: {
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#ffffff',
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#374151',
        borderLeftWidth: 6,
        borderLeftColor: '#000000',
    },
    actionItem: {
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#ffffff',
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#6b7280',
        borderLeftWidth: 6,
        borderLeftColor: '#4b5563',
    },
    itemTitleProblematique: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
        textDecoration: 'underline',
    },
    itemTitleAction: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 4,
    },
    typeIndicator: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000000',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: '#000000',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 10,
        color: '#9ca3af',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    itemContent: {
        fontSize: 12,
        color: '#111827',
        marginTop: 4,
    },
});

// Couleurs pour le badge d'état
export const etatColors: Record<string, { bg: string; text: string }> = {
    'actif': { bg: '#dcfce7', text: '#166534' },
    'en attente': { bg: '#fef3c7', text: '#92400e' },
    'suspendu': { bg: '#fed7d7', text: '#9b2c2c' },
    'clôturé': { bg: '#f3f4f6', text: '#374151' },
};

/**
 * Retourne le style du badge d'état
 */
export function getEtatStyle(etat: string) {
    const color = etatColors[etat?.toLowerCase() || ''] || etatColors['clôturé'];
    return {
        ...pdfStyles.etatBadge,
        backgroundColor: color.bg,
        color: color.text,
    };
}

/**
 * Fonction sécurisée pour afficher les valeurs
 */
export function safeValue(value: any): string {
    if (value === null || value === undefined || value === '') {
        return '—';
    }
    return String(value).trim() || '—';
}
