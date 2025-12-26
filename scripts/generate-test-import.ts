import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

async function generateTestExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usagers Test');

    // Define columns with non-standard headers
    worksheet.columns = [
        { header: 'Nom de famille', key: 'nom', width: 20 },
        { header: 'Prénom Usager', key: 'prenom', width: 20 },
        { header: 'Date de naissance', key: 'dateNaissance', width: 25 },
        { header: 'Ouverture dossier', key: 'dateOuverture', width: 25 },
        { header: 'Sexe usager', key: 'sexe', width: 15 },
        { header: 'Notes/Commentaires', key: 'notes', width: 30 }
    ];

    // Sample data with various date formats
    const data = [
        {
            nom: 'Dupont',
            prenom: 'Jean',
            dateNaissance: '15/05/1985', // DD/MM/YYYY
            dateOuverture: '01/12/2023',
            sexe: 'M',
            notes: 'Test format DD/MM/YYYY'
        },
        {
            nom: 'Martin',
            prenom: 'Alice',
            dateNaissance: '1990-10-25', // YYYY-MM-DD
            dateOuverture: '2024-01-10',
            sexe: 'F',
            notes: 'Test format YYYY-MM-DD'
        },
        {
            nom: 'Lefebvre',
            prenom: 'Robert',
            dateNaissance: '05-08-1975', // DD-MM-YYYY
            dateOuverture: '15-11-2023',
            sexe: 'M',
            notes: 'Test format DD-MM-YYYY'
        },
        {
            nom: 'Durand',
            prenom: 'Sophie',
            dateNaissance: new Date(1982, 2, 12), // JS Date (Excel Serial)
            dateOuverture: new Date(2023, 5, 20),
            sexe: 'F',
            notes: 'Test format Excel Serial (Numeric)'
        },
        {
            nom: 'Moreau',
            prenom: 'Pierre',
            dateNaissance: '1965/12/31', // YYYY/MM/DD
            dateOuverture: '2022/06/15',
            sexe: 'M',
            notes: 'Test format YYYY/MM/DD'
        },
        {
            nom: 'Simon',
            prenom: 'Lucie',
            dateNaissance: '', // Missing birth date
            dateOuverture: '2024.02.01', // Unusual dot format
            sexe: 'F',
            notes: 'Test missing data and dot separator'
        }
    ];

    // Add rows
    data.forEach(item => {
        worksheet.addRow(item);
    });

    // Style the header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };

    const filePath = path.join(process.cwd(), 'test-import-flexible.xlsx');
    await workbook.xlsx.writeFile(filePath);

    console.log(`✅ Fichier Excel de test généré : ${filePath}`);
}

generateTestExcel().catch(err => {
    console.error('❌ Erreur lors de la génération du fichier Excel :', err);
    process.exit(1);
});
