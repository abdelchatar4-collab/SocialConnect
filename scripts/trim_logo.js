/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

const sharp = require('sharp');
const path = require('path');

const inputImage = path.join(__dirname, '../public/socialconnect-logo-final.png');
const outputImage = path.join(__dirname, '../public/socialconnect-trimmed.png');

async function trimLogo() {
    try {
        console.log('Processing:', inputImage);

        // Trim whitespace automatically
        await sharp(inputImage)
            .trim() // This removes the transparent border
            .toFile(outputImage);

        const metadata = await sharp(outputImage).metadata();
        console.log(`Trimmed logo saved to ${outputImage}`);
        console.log(`New dimensions: ${metadata.width}x${metadata.height}`);
    } catch (error) {
        console.error('Error trimming logo:', error);
    }
}

trimLogo();
