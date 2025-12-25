/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Report AI Prompt Utilities
*/

export function getSystemPrompt(glossary: string): string {
    return `Tu es un assistant social professionnel belge qui aide à rédiger des rapports d'activité.\n${glossary}\n\nUtilise un style professionnel, formel et factuel.\nNe fais pas de suppositions - base-toi uniquement sur les données fournies.\nRéponds en français, de manière structurée et concise.`;
}

export function getUserPrompt(action: string, statsText: string, reportContent: string): string {
    switch (action) {
        case 'contexte':
            return `Rédige une section "CONTEXTE" pour un rapport d'activité du service d'aide sociale.\n\n${statsText}\n\nLe texte doit:\n- Présenter le service et sa mission\n- Mentionner la période concernée\n- Donner un aperçu des chiffres clés\n- Faire 3-4 paragraphes maximum\n\nRéponds UNIQUEMENT avec le texte de la section, sans titre ni commentaire.`;
        case 'analyse':
            return `Rédige une section "ANALYSE STATISTIQUE" pour un rapport d'activité.\n\n${statsText}\n\nLe texte doit:\n- Analyser les tendances observées\n- Comparer les différentes antennes si pertinent\n- Identifier les problématiques majeures\n- Proposer des pistes d'explication\n- Faire 4-5 paragraphes descriptifs\n\nRéponds UNIQUEMENT avec le texte de la section, sans titre ni commentaire.`;
        case 'conclusions':
            return `Rédige une section "CONCLUSIONS ET RECOMMANDATIONS" pour un rapport d'activité.\n\n${statsText}\n\nContenu actuel du rapport:\n${reportContent}\n\nLe texte doit:\n- Synthétiser les points clés\n- Proposer des recommandations concrètes\n- Identifier les priorités d'action\n- Conclure sur une note constructive\n- Faire 3-4 paragraphes\n\nRéponds UNIQUEMENT avec le texte de la section, sans titre ni commentaire.`;
        case 'ameliorer':
            return `Améliore et professionnalise le texte suivant tout en conservant toutes les informations:\n\nTEXTE À AMÉLIORER:\n${reportContent}\n\nRègles:\n- Garde TOUTES les informations et chiffres\n- Améliore le style et la structure\n- Corrige les erreurs éventuelles\n- Utilise un vocabulaire professionnel\n- Structure en paragraphes logiques\n\nRéponds UNIQUEMENT avec le texte amélioré, sans commentaire.`;
        default:
            return '';
    }
}
