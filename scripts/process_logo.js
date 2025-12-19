/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

const sharp = require('sharp');
const path = require('path');

const inputImage = path.join(__dirname, '../public/socialconnect-logo-final.png');
const outputImage = path.join(__dirname, '../public/sc-symbol.png');

async function processLogo() {
    try {
        const image = sharp(inputImage);
        const metadata = await image.metadata();
        console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);

        // Assume the logo is on the left. The symbol is usually square-ish.
        // If height is H, width of symbol is likely around H or 1.2*H.
        // Let's try to crop a square based on height.
        const cropWidth = metadata.height;

        console.log(`Cropping to width: ${cropWidth}, height: ${metadata.height}`);

        await image
            .extract({ left: 0, top: 0, width: cropWidth, height: metadata.height })
            .toFile(outputImage);

        console.log(`Symbol saved to ${outputImage}`);
    } catch (error) {
        console.error('Error processing logo:', error);
    }
}

processLogo();
