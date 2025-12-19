/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

const sharp = require('sharp');
const path = require('path');

const inputImage = '/Users/abdelchatar/.gemini/antigravity/brain/e08a08b8-9e09-4d0d-aeda-6303680521b7/uploaded_image_1764066018011.png';
const outputImage = '/Users/abdelchatar/Desktop/TEST/Test-gestion-usagers/public/socialconnect-logo-extracted.png';

async function extractLogo() {
    try {
        // On récupère les métadonnées pour avoir la taille
        const metadata = await sharp(inputImage).metadata();
        console.log(`Image dimensions: ${metadata.width}x${metadata.height}`);

        // D'après la capture, le logo est en haut à gauche.
        // La barre d'adresse du navigateur prend environ 80-100px de haut.
        // Le logo commence juste en dessous.
        // Essayons de cibler la zone précise.

        // Zone estimée (à ajuster si besoin)
        // Left: ~50px
        // Top: ~110px (sous la barre d'adresse)
        // Width: ~250px (SC + SocialConnect)
        // Height: ~60px

        await sharp(inputImage)
            .extract({ left: 40, top: 110, width: 280, height: 70 })
            .toFile(outputImage);

        console.log('Logo extrait avec succès !');
    } catch (error) {
        console.error('Erreur lors de l\'extraction:', error);
    }
}

extractLogo();
