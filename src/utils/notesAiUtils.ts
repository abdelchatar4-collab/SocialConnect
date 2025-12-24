/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

/**
 * Utility functions and constants for Notes AI (Reformulation and Analysis)
 */

export const REFORMULATION_SYSTEM_PROMPT = `
Tu es un assistant social professionnel. Reformule cette note en un texte rédigé, clair et professionnel.

OBJECTIF : Transformer des notes brutes ou des listes en phrases bien rédigées.

RÈGLES :
1. Rédiger des phrases complètes et fluides (pas de listes avec | ou :)
2. Améliorer la lisibilité et le style
3. Corriger l'orthographe et la grammaire
4. NE JAMAIS INVENTER de dates, noms, lieux ou faits absents du texte original
5. Conserver EXACTEMENT les informations présentes, sans en ajouter ni en retirer
6. Longueur similaire à l'original (un peu plus long si nécessaire pour la fluidité)

Réponds UNIQUEMENT avec le texte reformulé.
`;

export const getAnalysisSystemPrompt = (validActions: string, validProblematiques: string) => `
Tu es un assistant social expert en Belgique, spécialisé dans l'accompagnement social en Région de Bruxelles-Capitale. Ta mission est de structurer les notes de suivi dans un contexte institutionnel belge (communes, CPAS, SPF, sociétés de logement social, médiations locales, etc.).

**CORRESPONDANCE LEXICALE BELGE OBLIGATOIRE** (Ne jamais confondre avec les termes français) :
- AER = Avertissement-Extrait de Rôle (SPF Finances Belgique)
- RIF = Relevé d'Identité Fiscale (France uniquement - ignorer en Belgique)
- RIS = Revenu d'Intégration Sociale (CPAS Belgique)
- RCD = Recommandation de Crédit (Belgique)
- AIS = Agence Immobilière Sociale (Belgique)
- SLRB = Société du Logement de la Région de Bruxelles-Capitale
- SISP = Société Immobilière de Service Public
- Vierge Noire = Allocation pour l'aide aux personnes âgées (Belgique)
- ONEM = Office National de l'Emploi (Belgique)
- Actiris = Forem bruxellois (Bruxelles)
- PMS = Psycho-Médico-Social (écoles Belgique)
- SPF = Service Public Fédéral (Belgique)
- Pro deo = Aide juridique gratuite (Belgique)

ANALYSE SÉMANTIQUE ET RÈGLES DE CLASSEMENT :
1. [Endettement/Surendettement]
2. [Logement]
3. [Santé (physique; handicap; autonomie)]
4. [Energie (eau; gaz; électricité)]
5. [CPAS]
6. [Juridique]
7. [Scolarité]
8. [Fiscalité]
9. [ISP]

INSTRUCTIONS DE SORTIE :
- Extrais les ACTIONS et PROBLÉMATIQUES en te basant sur ces règles.
- Réponds UNIQUEMENT avec un objet JSON valide.
- Si un terme correspond à une règle ci-dessus, tu DOIS cocher la catégorie correspondante.

VOCABULAIRE AUTORISÉ pour les actions: ${validActions}
VOCABULAIRE AUTORISÉ pour les problématiques: ${validProblematiques}
`;

export const ANALYSIS_USER_PROMPT = `Analyse ce texte et extrais les actions et problématiques.
Réponds UNIQUEMENT en JSON avec ce format exact:
{"actions":[{"type":"NomAction","description":"contexte","date":"YYYY-MM-DD"}],"problematiques":[{"type":"NomProbleme","detail":"detail"}]}
`;

/**
 * Fuzzy match helper to map AI output or rules to existing dropdown options
 */
export const findBestMatch = (candidate: string, options: { label: string }[]) => {
    if (!candidate) return null;
    const norm = candidate.toString().toLowerCase().trim();
    const exact = options.find(o => o.label.toLowerCase() === norm);
    if (exact) return exact.label;

    const partials = options.filter(o => {
        const l = o.label.toLowerCase();
        return norm.includes(l) || l.includes(norm);
    });

    if (partials.length > 0) {
        partials.sort((a, b) => b.label.length - a.label.length);
        return partials[0].label;
    }
    return null;
};

/**
 * Rule-based detection using keywords
 */
export const detectCategoriesFromRules = (text: string, problematiqueOptions: { label: string }[]) => {
    const detected: { type: string, description: string }[] = [];
    const textLower = text.toLowerCase();

    const rules = [
        { key: 'CPAS', labels: ['CPAS', 'RIS', 'revenu d\'intégration', 'aide sociale'] },
        { key: 'Logement', labels: ['loyer', 'bail', 'propriétaire', 'préavis', 'insalubrité'] },
        { key: 'Endettement/Surendettement', labels: ['dette', 'huissier', 'facture impayée', 'rappel', 'mise en demeure'] },
        { key: 'Energie (eau;gaz;électricité)', labels: ['engie', 'sibelga', 'vivaqua', 'totalenergies', 'compteur'] },
        { key: 'Santé (physique; handicap; autonomie)', labels: ['médecin', 'hôpital', 'mutuelle', 'pharmacie', 'traitement'] },
        { key: 'Médiation/Conflits', labels: ['conflit', 'voisin', 'voisinage', 'nuisance', 'bruit', 'tapage', 'médiation', 'conciliation', 'dispute', 'litige', 'différend', 'altercation', 'tension', 'plainte voisin', 'copropriété', 'syndic', 'parties', 'accord', 'négociation'] },
        { key: 'Famille', labels: ['famille', 'conjoint', 'divorce', 'séparation', 'garde', 'enfant', 'pension alimentaire', 'violence conjugale', 'parentalité'] },
    ];

    rules.forEach(rule => {
        const realLabel = findBestMatch(rule.key, problematiqueOptions);
        if (realLabel) {
            const matchedLabel = rule.labels.find(l => {
                const lowL = l.toLowerCase();
                // Match exact for short words to avoid false positives (e.g., "apa" vs "apaisement")
                const regex = lowL.length <= 3
                    ? new RegExp(`\\b${lowL}\\b`, 'i')
                    : new RegExp(`\\b${lowL}\\w*`, 'i');
                return regex.test(textLower);
            });

            if (matchedLabel) {
                detected.push({
                    type: realLabel,
                    description: `Détecté via mot-clé ("${matchedLabel}")`,
                });
            }
        }
    });

    return detected;
};
