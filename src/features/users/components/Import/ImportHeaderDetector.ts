const commonHeaderKeywords = [
    'nom', 'prénom', 'prenom', 'email', 'mail', 'date', 'téléphone', 'telephone',
    'titulaire', 'sexe', 'genre', 'age', 'commune', 'ville', 'statut', 'adresse',
    'd.n.', 'ddn', 'naissance', 'gsm', 'source', 'origine', 'ouverture'
];

export interface DetectedResult {
    headerRowIndex: number;
    headers: string[];
    sampleRow: Record<string, any>;
}

export const detectHeaders = (rawSheetData: any[][]): DetectedResult => {
    let headerRowIndex = 0;
    let maxScore = -1;

    for (let i = 0; i < Math.min(rawSheetData.length, 50); i++) {
        const row = rawSheetData[i];
        if (!row || !Array.isArray(row)) continue;

        const rowText = row.map(cell => String(cell || '').toLowerCase().trim());

        const matchCount = rowText.filter(text =>
            commonHeaderKeywords.some(keyword => {
                const cleanText = text.replace(/[^a-z]/g, '');
                const cleanK = keyword.replace(/[^a-z]/g, '');
                return cleanText === cleanK || (cleanText.length > 3 && cleanK.includes(cleanText));
            })
        ).length;

        const filledCells = row.filter(c => c !== null && String(c).trim() !== '').length;
        const textCells = row.filter(c => typeof c === 'string' && c.trim().length > 1).length;

        let currentScore = (matchCount * 20) + (textCells * 2) + filledCells;

        if (rowText.some(t => t.includes('nom')) && (rowText.some(t => t.includes('prénom')) || rowText.some(t => t.includes('prenom')))) {
            currentScore += 100;
        }

        const positionPenalty = i * 0.5;
        currentScore -= positionPenalty;

        if (currentScore > maxScore && filledCells >= 2) {
            maxScore = currentScore;
            headerRowIndex = i;
        }
    }

    const headerRow = rawSheetData[headerRowIndex] as any[];
    const detectedHeaders = headerRow
        .map((h, idx) => (h && String(h).trim() !== '') ? String(h).trim() : `Colonne ${idx + 1}`)
        .filter(h => h);

    let firstDataRow: any[] = [];
    for (let i = headerRowIndex + 1; i < rawSheetData.length; i++) {
        const row = rawSheetData[i];
        if (row && row.some(c => c !== null && c !== undefined && String(c).trim() !== '')) {
            firstDataRow = row;
            break;
        }
    }

    const sampleRow: Record<string, any> = {};
    detectedHeaders.forEach((h, idx) => {
        const originalIdx = h.startsWith('Colonne ') ? parseInt(h.replace('Colonne ', '')) - 1 : headerRow.indexOf(h);
        sampleRow[h] = firstDataRow[originalIdx] || '';
    });

    return { headerRowIndex, headers: detectedHeaders, sampleRow };
};
