/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import jsPDF from 'jspdf';
// Fonction de génération RGPD centralisée
export const initiateRgpdAttestationGeneration = async (
  userId: string,
  userFullName: string | null | undefined,
  userFullAddress: string | null | undefined,
  userPostalCode: string | null | undefined,
  userCity: string | null | undefined,
  onCompleteCallback?: () => Promise<void> | void // Rendre le callback optionnel
) => {
  console.log("Génération RGPD pour:", userId, userFullName);
  const doc = new jsPDF();
  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`; // Définir formattedDate ici

  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const textWidth = pageWidth - 2 * margin;
  let yPos = margin;
  const lineHeight = 7;
  const sectionSpacing = lineHeight * 1.5;

  // Helper pour ajouter du texte - AMÉLIORÉ pour éviter les erreurs
  const addProcessedText = (text: string, size: number, style?: 'bold' | 'normal', options?: {align?: 'left' | 'center' | 'right', indent?: number}) => {
    // Vérifier si on a besoin d'une nouvelle page
    if (yPos > doc.internal.pageSize.getHeight() - margin - 20) {
        doc.addPage();
        yPos = margin;
    }
    
    // S'assurer que le texte n'est pas vide ou seulement des espaces
    const cleanText = (text || '').trim();
    if (!cleanText) return; // Ne pas ajouter de texte vide
    
    doc.setFontSize(size);
    doc.setFont('helvetica', style || 'normal');
    const x = margin + (options?.indent || 0);
    const effectiveWidth = textWidth - (options?.indent || 0);
    const splitText = doc.splitTextToSize(cleanText, effectiveWidth);
    doc.text(splitText, options?.align === 'center' ? pageWidth / 2 : x, yPos, { align: options?.align || 'left' });
    yPos += splitText.length * (size * 0.45);
    yPos += 3;
  };

  // --- Contenu du PDF ---
  addProcessedText("ANDERLECHT PRÉVENTION", 12, 'bold');
  addProcessedText("Rue du Chapelin 2 / Kapelaanstraat", 10);
  addProcessedText("1070 ANDERLECHT", 10);
  yPos += sectionSpacing;

  addProcessedText("FORMULAIRE DE CONSENTEMENT POUR LE TRAITEMENT ET L'ÉCHANGE DE DONNÉES PERSONNELLES DANS LE CADRE DU TRAITEMENT D'UN DOSSIER SOCIAL.", 14, 'bold', { align: 'center' });
  yPos += sectionSpacing;

  addProcessedText("POURQUOI COLLECTE-T-ON VOS DONNÉES ?", 11, 'bold');
  addProcessedText("Dans le cadre de la mission que vous souhaitez nous confier, notre service doit recueillir un certain nombre d'informations vous concernant afin de vous fournir un accompagnement social adapté à votre situation.", 10);
  yPos += sectionSpacing;

  addProcessedText("QUELLES DONNÉES COLLECTONS-NOUS ?", 11, 'bold');
  addProcessedText("Nous collectons uniquement les données strictement nécessaires à l'accomplissement de nos missions d'accompagnement social. Ces données incluent vos informations personnelles, votre situation familiale, sociale et économique.", 10);
  yPos += sectionSpacing;

  addProcessedText("AVEC QUI PARTAGEONS-NOUS VOS DONNÉES ?", 11, 'bold');
  addProcessedText("Vos données peuvent être partagées uniquement avec nos partenaires institutionnels dans le cadre strict de votre accompagnement et avec votre consentement préalable.", 10);
  yPos += sectionSpacing;

  addProcessedText("VOS DROITS", 11, 'bold');
  addProcessedText("Vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données personnelles. Vous pouvez également vous opposer au traitement de vos données dans certaines circonstances.", 10);
  yPos += sectionSpacing;

  addProcessedText("ACCORD DU BÉNÉFICIAIRE", 11, 'bold');
  addProcessedText("☐ Je suis le bénéficiaire.", 10);
  addProcessedText("☐ Je donne mon accord pour le traitement de mes données personnelles.", 10);
  addProcessedText("☐ J'accepte que mes données soient partagées avec les partenaires nécessaires.", 10);
  yPos += sectionSpacing / 2;
  
  const finalUserFullName = (userFullName || '').trim();
  const finalUserFullAddress = (userFullAddress || '').trim();
  const finalUserPostalCode = (userPostalCode || '').trim();
  const finalUserCity = (userCity || '').trim();

  addProcessedText("Personne bénéficiaire de l'accompagnement social", 10, 'bold');
  addProcessedText(`NOM - PRÉNOM : ${finalUserFullName}`, 10);
  addProcessedText(`Adresse postale : ${finalUserFullAddress}`, 10);
  addProcessedText(`Code postal : ${finalUserPostalCode} ${finalUserCity}`, 10);
  yPos += sectionSpacing / 2;
  addProcessedText(`Date : ${formattedDate}`, 10);
  addProcessedText("Lieu : Anderlecht, Bruxelles", 10);
  yPos += sectionSpacing;
  addProcessedText("SIGNATURE", 10, 'bold');
  yPos += lineHeight / 2;
  doc.line(margin, yPos, margin + 80, yPos);
  // Nom de fichier sécurisé
  const safeUserName = finalUserFullName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
  const fileName = `Attestation_RGPD_${safeUserName || 'Usager'}_${userId || 'ID_INCONNU'}.pdf`;
  doc.save(fileName);

  // Mise à jour de l'API
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Échec PATCH RGPD: ${response.status} ${response.statusText} - ${errorData}`);
    }
    console.log("Trace RGPD enregistrée.");
    // Appeler le callback uniquement en cas de succès du PATCH
    if (onCompleteCallback) {
      await onCompleteCallback();
    }
  } catch (apiError: any) {
    console.error("Erreur API trace RGPD:", apiError);
    alert(`Erreur mise à jour statut RGPD: ${apiError.message}`);
  }
};
