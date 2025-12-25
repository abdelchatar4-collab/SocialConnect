/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - RGPD Attestation PDF Generator
Extracted from app/users/new/page.tsx for maintainability
*/

import jsPDF from 'jspdf';

/**
 * Generates a RGPD attestation PDF document for a user
 */
export const generateRgpdAttestationPDF = async (
    userId: string,
    userFullName: string,
    userFullAddress: string,
    userPostalCode: string,
    userCity: string
): Promise<void> => {
    const doc = new jsPDF();

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = pageWidth - 2 * margin;
    let yPos = margin;
    const lineHeight = 7;

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

    // Header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("ANDERLECHT PRÉVENTION", margin, yPos);
    yPos += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.text("Rue du Chapelin 2 / Kapelaanstraat", margin, yPos);
    yPos += lineHeight;
    doc.text("1070 ANDERLECHT", margin, yPos);
    yPos += lineHeight * 2;

    // Main title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const title = "FORMULAIRE DE CONSENTEMENT POUR LE TRAITEMENT ET L'ÉCHANGE DE DONNÉES PERSONNELLES DANS LE CADRE DU TRAITEMENT D'UN DOSSIER SOCIAL.";
    const splitTitle = doc.splitTextToSize(title, textWidth);
    doc.text(splitTitle, pageWidth / 2, yPos, { align: 'center' });
    yPos += splitTitle.length * lineHeight + lineHeight;

    // RGPD Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const rgpdIntro = "Le RGPD, ou Règlement Général sur la Protection des Données, est un règlement européen qui est entré en vigueur le 25 mai 2018. Il a été conçu pour renforcer la protection des données personnelles des citoyens de l'Union européenne et pour harmoniser les règles de protection des données à travers l'Europe.\nLes principaux principes du RGPD sont les suivants : le consentement éclairé des personnes pour le traitement de leurs données, la limitation de la collecte et de l'utilisation des données au strict nécessaire, la transparence dans le traitement des données, la garantie de la sécurité et de l'intégrité des données, et la responsabilité des entreprises en cas de violation de données.";
    const splitRgpdIntro = doc.splitTextToSize(rgpdIntro, textWidth);
    doc.text(splitRgpdIntro, margin, yPos);
    yPos += splitRgpdIntro.length * lineHeight + lineHeight;

    // Section: Why data collection
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("POURQUOI COLLECTE-T-ON VOS DONNÉES ?", margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const pourquoiText = "Dans le cadre de la mission que vous souhaitez nous confier, notre service doit recueillir un certain nombre d'informations vous concernant. Vos données collectées pourraient être utilisées pour toute démarche sociale nécessaire à la résolution ou déblocage de certaines situations. Toutes les actions de collecte ou de partage de vos données personnelles seront réalisées dans le seul et unique contexte de votre dossier social.\nLes données collectées sont vos données d'identité, vos adresses de correspondance (postale et e-mail), numéro de téléphone, numéro national ou équivalent, votre situation sociale, ainsi que toutes les données strictement nécessaires et utiles à accomplir les tâches indispensables à la résolution ou déblocage de votre situation sociale.\nCes données peuvent, si cela est nécessaire au traitement de votre dossier, être des données sensibles, telles que des lettres ou correspondances et des rapports rédigés par d'autres services qui vous ont suivis. Il est à noter que la demande vous sera explicitement adressée pour chacun des documents et que votre accord oral est systématiquement nécessaire.\nCes données sont collectées et sont utilisées avec votre accord et conformément aux règles européennes et nationales sur la protection des données. Même si vous décidez de ne pas donner votre accord, notre service s'occupera de votre dossier, le mieux possible.";
    const splitPourquoiText = doc.splitTextToSize(pourquoiText, textWidth);
    doc.text(splitPourquoiText, margin, yPos);
    yPos += splitPourquoiText.length * lineHeight + lineHeight;

    // Section: How data is stored
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("COMMENT SONT STOCKÉES VOS DONNÉES ?", margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const commentText = "Vos informations sont conservées sous forme de dossiers papier ou électroniques qui sont sous la responsabilité de votre référent de dossier. Celui-ci prend toutes les mesures nécessaires pour garantir leur sécurité. Si vos données sont stockées électroniquement, elles le seront sur un serveur communal dédié et protégé. Seules les personnes habilitées à visionner et traiter vos données auront accès à votre dossier électronique. Vos données peuvent cependant transiter d'un référent social ou professionnel dans le cadre du secret professionnel partagé, toujours dans l'intérêt premier d'avancer sur votre dossier social.";
    const splitCommentText = doc.splitTextToSize(commentText, textWidth);
    doc.text(splitCommentText, margin, yPos);
    yPos += splitCommentText.length * lineHeight + lineHeight;

    // Section: How long data is stored
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("COMBIEN DE TEMPS SONT STOCKÉES VOS DONNÉES ?", margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const combienText = "La durée de stockage de vos données correspond à celle du traitement de votre dossier, et une fois ce dernier clôturé, vos données seront conservées pendant une durée maximale de 10 ans à partir de la fin de votre prise en charge. Cette période de conservation permettra notamment à votre référent de respecter ses obligations en matière de responsabilité.\nVous pouvez également demander à « récupérer » votre dossier. Les données qu'il comporte sont à vous et resteront à vous. Seules les informations professionnelles et confidentielles (réunions de concertation, PV professionnels ou d'autres données privées utiles pendant votre prise en charge) seront retirées de votre dossier.";
    const splitCombienText = doc.splitTextToSize(combienText, textWidth);
    doc.text(splitCombienText, margin, yPos);
    yPos += splitCombienText.length * lineHeight + lineHeight;

    // Section: Who has access
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("QUI A ACCÈS À VOS DONNÉES ?", margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const quiText = "Votre référent social aura accès à votre dossier afin de le traiter. Tout autre travailleur social du service peut être désigné comme back-up et, le cas échéant, pourra avoir accès à votre dossier pour assurer le bon suivi de ce dernier. Si le traitement de votre dossier le nécessite, ce formulaire de consentement permettra à votre référent partager toutes les données de votre dossier avec d'autres collègues et professionnels qui peuvent voir un rôle dans la résolution ou le déblocage de situations dans votre dossier. ";
    const splitQuiText = doc.splitTextToSize(quiText, textWidth);
    doc.text(splitQuiText, margin, yPos);
    yPos += splitQuiText.length * lineHeight + lineHeight;

    // Section: Beneficiary agreement
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("ACCORD DU BÉNÉFICIAIRE", margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("[ ] Je suis le bénéficiaire.", margin, yPos);
    yPos += lineHeight;
    doc.text("[ ] Je déclare avoir lu ce document et que son contenu m'a été expliqué oralement dans des termes compréhensibles.", margin, yPos);
    yPos += lineHeight;
    doc.text("[ ] J'ai disposé de suffisamment de temps pour prendre en considération le fait de confier mes données personnelles à mon référent de dossier, pour le traitement de mon dossier.", margin, yPos);
    yPos += lineHeight;
    doc.text("[ ] J'ai pu poser toutes les questions que je souhaitais.", margin, yPos);
    yPos += lineHeight * 2;

    const accordText = "[ ] J'autorise le traitement et l'échange de mes données personnelles dans les conditions et pour les finalités listées ci-dessus, qui m'ont été expliquées par mon référent de dossier, étant précisé que je sais que d'autres intervenants pertinents dans la résolution ou le déblocage de situations dans votre dossier social pourront y accéder lorsque cela sera nécessaire, et que mes données pourront être échangées avec d'autres services et partenaires pour le traitement de mon dossier et j'y consens.\nLe présent consentement est valide tant et aussi longtemps que j'aurai recours à l'aide sociale du service prévention.\n[ ] Je comprends également que je ne suis pas obligé(e) de donner ce consentement et que je peux le retirer par écrit en tout ou en partie, et ce à tout moment.";
    const splitAccordText = doc.splitTextToSize(accordText, textWidth);
    doc.text(splitAccordText, margin, yPos);
    yPos += splitAccordText.length * lineHeight + lineHeight * 2;

    // Beneficiary info and signature
    doc.setFontSize(10);
    doc.text("Personne bénéficiaire de l'accompagnement sociale", margin, yPos);
    yPos += lineHeight;
    doc.text(`NOM - PRÉNOM : ${userFullName || ''}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Adresse postale : ${userFullAddress || ''}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Code postale : ${userPostalCode || ''} ${userCity || ''}`, margin, yPos);
    yPos += lineHeight * 2;

    doc.text(`Date : ${formattedDate}`, margin, yPos);
    yPos += lineHeight;
    doc.text("Lieu : Anderlecht, Bruxelles", margin, yPos);
    yPos += lineHeight * 2;

    doc.setFont('helvetica', 'bold');
    doc.text("SIGNATURE", margin, yPos);
    yPos += lineHeight;
    doc.line(margin, yPos, margin + 80, yPos);
    yPos += lineHeight * 2;

    const fileName = `Attestation_RGPD_${userFullName.replace(/\s+/g, '_')}_${userId}.pdf`;
    doc.save(fileName);

    // API call to record RGPD trace
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`Échec de l'enregistrement de la trace RGPD: ${response.statusText} - ${errorData}`);
            alert("Erreur lors de l'enregistrement de la trace RGPD en base de données.");
        } else {
            console.log("Trace RGPD enregistrée avec succès en base de données.");
        }
    } catch (apiError) {
        console.error("Erreur lors de l'appel API pour la trace RGPD:", apiError);
        alert("Erreur réseau ou inattendue lors de l'enregistrement de la trace RGPD.");
    }
};
