/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Report AI Stats Utilities
*/

export interface ReportStats {
    total: number;
    actifs: number;
    clotures: number;
    nouveauxCeMois: number;
    parAntenne: Record<string, number>;
    parProblematique: Record<string, number>;
    parStatutSejour: Record<string, number>;
}

export function computeStats(users: any[]): ReportStats {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const parAntenne: Record<string, number> = {};
    const parProblematique: Record<string, number> = {};
    const parStatutSejour: Record<string, number> = {};

    let actifs = 0, clotures = 0, nouveauxCeMois = 0;

    users.forEach(u => {
        if (u.etat === 'Actif') actifs++;
        if (u.etat === 'Cloturé' || u.etat === 'Clôturé') clotures++;
        if (u.dateOuverture) {
            const d = new Date(u.dateOuverture);
            if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) nouveauxCeMois++;
        }
        const ant = u.antenne || 'Non assignée';
        parAntenne[ant] = (parAntenne[ant] || 0) + 1;
        if (u.problematiques && Array.isArray(u.problematiques)) {
            u.problematiques.forEach((p: any) => {
                const type = p.type || 'Autre';
                parProblematique[type] = (parProblematique[type] || 0) + 1;
            });
        }
        if (u.statutSejour) parStatutSejour[u.statutSejour] = (parStatutSejour[u.statutSejour] || 0) + 1;
    });

    return { total: users.length, actifs, clotures, nouveauxCeMois, parAntenne, parProblematique, parStatutSejour };
}

export function formatStatsForPrompt(stats: ReportStats): string {
    const antennes = Object.entries(stats.parAntenne).map(([k, v]) => `  - ${k}: ${v}`).join('\n');
    const problematiques = Object.entries(stats.parProblematique).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `  - ${k}: ${v}`).join('\n');

    return `STATISTIQUES DU SERVICE (${new Date().toLocaleDateString('fr-FR')}):\n- Total dossiers: ${stats.total}\n- Dossiers actifs: ${stats.actifs}\n- Dossiers clôturés: ${stats.clotures}\n- Nouveaux ce mois: ${stats.nouveauxCeMois}\n\nRÉPARTITION PAR ANTENNE:\n${antennes}\n\nTOP PROBLÉMATIQUES:\n${problematiques}\n`;
}
