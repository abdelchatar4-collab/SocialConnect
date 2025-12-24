/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserForm from '@/features/users/components/UserForm';
import { UserSearch } from '@/components/UserSearch';
import { useAdmin } from '@/contexts/AdminContext';
import type { UserFormRef } from '@/types';
import { UserFormData, Adresse, User } from '@/types/user';
import jsPDF from 'jspdf';

// Type pour les gestionnaires tel qu'attendu par UserForm
interface GestionnaireForForm {
  id: string;
  prenom: string;
  nom: string | null;
}

// Définir un type pour l'utilisateur sauvegardé avec les champs nécessaires, y compris l'adresse
interface SavedUser {
  id: string;
  nom: string;
  prenom: string;
  adresse?: Adresse | null; // Ajouter l'adresse
}

// Définir un objet initial complet correspondant à UserFormData
const initialNewUserData: Partial<User> = {
  nom: '',
  prenom: '',
  genre: '',
  telephone: '',
  email: '',
  statutSejour: '',
  gestionnaire: '',
  nationalite: '',
  trancheAge: '',
  remarques: '',
  secteur: '',
  langue: '',
  premierContact: '',
  notesGenerales: '',
  etat: 'Actif',
  antenne: '',
  dateNaissance: '',
  dateOuverture: new Date().toISOString().split('T')[0],
  dateCloture: '',
  partenaire: null, // ✅ Utiliser null au lieu d'un tableau pour le type User
  adresse: {
    rue: '',
    numero: '',
    boite: '',
    codePostal: '',
    ville: '',
    quartier: '',
    pays: '',
    secteur: '',
  },
  hasPrevExp: false,
  prevExpDateReception: '',
  prevExpDateRequete: '',
  prevExpDateVad: '',
  prevExpDecision: '',
  prevExpCommentaire: '',
  logementDetails: {
    type: '',
    statut: '',
    nombrePieces: 0,
    bailleur: '',
    commentaires: '',
    typeLogement: '',
    dateEntree: '',
    dateSortie: '',
    motifSortie: '',
    destinationSortie: '',
    proprietaire: '',
    loyer: '',
    charges: '',
    commentaire: '',
    hasLitige: false,
    // Ajouter les nouveaux champs
    bailEnregistre: '',
    dateContrat: '',
    dureeContrat: '',
    garantieLocative: '',
    statutGarantie: '',
    typeLitige: '',
    dateLitige: '',
    descriptionLitige: '',
    actionsPrises: '',
    datePreavis: '',
    dureePreavis: ''
  },
  problematiques: [],
  problematiquesDetails: '',
  actions: [],
  informationImportante: '',
};

export default function NewUserPage() {
  const { selectedYear, setSelectedYear } = useAdmin();
  const [showSearch, setShowSearch] = useState(false);
  const [prefilledData, setPrefilledData] = useState<Partial<User>>(initialNewUserData);
  const [previousUserId, setPreviousUserId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser l'affichage de la recherche si on est dans une année FUTURE
  // (pour permettre la réinscription d'usagers existants d'années précédentes)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    // Afficher la recherche UNIQUEMENT si l'année sélectionnée est dans le futur
    if (selectedYear > currentYear) {
      setShowSearch(true);
    } else {
      setShowSearch(false);
    }
  }, [selectedYear]);

  const handleSelectUser = (user: User, options: { contact: boolean; adresse: boolean; nationalite: boolean; situationPro: boolean; gestion: boolean; logement: boolean; notes: boolean }) => {
    // Préparer les données pour la réinscription
    // On garde les infos stables (identité), et on importe selon les options sélectionnées
    const newData: Partial<User> = {
      ...initialNewUserData, // Repartir d'une base propre

      // Identité - toujours importée
      nom: user.nom || '',
      prenom: user.prenom || '',
      dateNaissance: user.dateNaissance,
      genre: user.genre,

      // Contact - selon option
      ...(options.contact && {
        telephone: user.telephone,
        email: user.email,
      }),

      // Adresse - selon option
      ...(options.adresse && {
        adresse: user.adresse,
      }),

      // Nationalité & Langues - selon option
      ...(options.nationalite && {
        nationalite: user.nationalite,
        langue: user.langue,
        statutSejour: user.statutSejour,
      }),

      // Situation professionnelle - selon option
      ...(options.situationPro && {
        situationProfessionnelle: user.situationProfessionnelle,
        revenus: user.revenus,
      }),

      // Gestion - selon option
      ...(options.gestion && {
        gestionnaire: user.gestionnaire,
        antenne: user.antenne,
      }),

      // Logement - selon option
      ...(options.logement && {
        logementDetails: user.logementDetails,
      }),

      // Notes & Remarques - selon option (TOUTES les notes)
      ...(options.notes && {
        remarques: user.remarques,
        notesGenerales: user.notesGenerales,
        informationImportante: user.informationImportante,
        problematiquesDetails: user.problematiquesDetails,
        donneesConfidentielles: user.donneesConfidentielles,
      }),
    };

    setPrefilledData(newData);
    setPreviousUserId(user.id);
    setShowSearch(false);
  };

  const handleCreateNew = () => {
    setPrefilledData(initialNewUserData);
    setPreviousUserId(null);
    setShowSearch(false);
  };
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showRgpdButton, setShowRgpdButton] = useState(false);
  const [savedUserId, setSavedUserId] = useState<string | null>(null);
  const [savedUserName, setSavedUserName] = useState<string | null>(null);
  const [savedUserFullData, setSavedUserFullData] = useState<SavedUser | null>(null); // Nouvel état pour les données complètes
  const router = useRouter();

  // Ref pour suivre si un utilisateur a déjà été créé avec succès dans cette session
  // Cela empêche la double création si l'utilisateur clique à nouveau sur "Enregistrer" après le succès
  const userCreatedRef = React.useRef(false);

  // États pour la liste des gestionnaires
  const [gestionnairesList, setGestionnairesList] = useState<GestionnaireForForm[]>([]);
  const [isLoadingGestionnaires, setIsLoadingGestionnaires] = useState(false); // Changed to false for testing

  // Charger les gestionnaires au montage du composant
  useEffect(() => {
    const fetchGestionnaires = async () => {
      setIsLoadingGestionnaires(true);
      try {
        const response = await fetch('/api/gestionnaires'); // Votre endpoint API pour les gestionnaires
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des gestionnaires');
        }
        const data = await response.json();
        setGestionnairesList(data);
      } catch (err) {
        console.error("Erreur fetchGestionnaires:", err);
        setError(err instanceof Error ? err.message : 'Impossible de charger les gestionnaires');
        // Use fallback gestionnaires for testing
        setGestionnairesList([
          { id: 'test-1', prenom: 'Test', nom: 'Gestionnaire 1' },
          { id: 'test-2', prenom: 'Test', nom: 'Gestionnaire 2' }
        ]);
      } finally {
        setIsLoadingGestionnaires(false);
      }
    };

    fetchGestionnaires();
  }, []); // Le tableau vide de dépendances signifie que cela s'exécute une fois après le montage initial

  const handleSave = async (userData: Partial<User>) => {
    // Si un utilisateur a déjà été créé, on empêche d'en créer un autre
    if (userCreatedRef.current) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Vérifier d'abord s'il existe des doublons potentiels
      const duplicateCheckResponse = await fetch('/api/users/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: userData.nom,
          prenom: userData.prenom,
          dateNaissance: userData.dateNaissance,
        }),
      });

      if (duplicateCheckResponse.ok) {
        const { hasDuplicate, duplicates } = await duplicateCheckResponse.json();

        if (hasDuplicate && duplicates.length > 0) {
          // Construire le message d'avertissement
          const duplicatesList = duplicates.map((d: any) =>
            `- ${d.prenom} ${d.nom} (ID: ${d.id}, Antenne: ${d.antenne || 'N/A'})`
          ).join('\n');

          const confirmMessage = `⚠️ ATTENTION : Un ou plusieurs usagers avec le même nom/prénom existent déjà :\n\n${duplicatesList}\n\nVoulez-vous quand même créer ce nouvel usager ?`;

          if (!window.confirm(confirmMessage)) {
            setIsSubmitting(false);
            return; // L'utilisateur a annulé
          }
        }
      }

      // L'année du dossier est strictement celle de l'exercice sélectionné
      const anneeDossier = selectedYear;

      // Ajouter l'année et le lien historique
      const payload = {
        ...userData,
        annee: anneeDossier,
        dossierPrecedentId: previousUserId
      };

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Échec de la création: ${response.statusText} - ${errorData}`);
      }

      const newUser: SavedUser = await response.json(); // newUser devrait maintenant contenir l'adresse

      // Marquer comme créé pour empêcher les doublons
      userCreatedRef.current = true;

      // Mettre à jour les états pour l'affichage post-sauvegarde
      setShowSuccessMessage(true);
      setShowRgpdButton(true);
      setSavedUserId(newUser.id);
      setSavedUserName(`${newUser.prenom} ${newUser.nom}`);
      setSavedUserFullData(newUser); // Stocker toutes les données de l'usager sauvegardé
      setIsSubmitting(false); // La soumission est terminée

    } catch (saveError: any) {
      console.error("Erreur lors de la création:", saveError);
      setError(`Erreur lors de la création: ${saveError.message}`);
      setIsSubmitting(false);
      throw saveError; // Relancer l'erreur pour que UserForm puisse la gérer
    }
  };

  const initiateRgpdAttestationGeneration = async (
    userId: string,
    userFullName: string,
    userFullAddress: string,
    userPostalCode: string,
    userCity: string
  ) => {
    const doc = new jsPDF();

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = pageWidth - 2 * margin;
    let yPos = margin;
    const lineHeight = 7; // Espacement entre les lignes

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
    yPos += lineHeight * 2; // Double espace après l'adresse

    // Titre principal
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const title = "FORMULAIRE DE CONSENTEMENT POUR LE TRAITEMENT ET L'ÉCHANGE DE DONNÉES PERSONNELLES DANS LE CADRE DU TRAITEMENT D'UN DOSSIER SOCIAL.";
    const splitTitle = doc.splitTextToSize(title, textWidth);
    doc.text(splitTitle, pageWidth / 2, yPos, { align: 'center' });
    yPos += splitTitle.length * lineHeight + lineHeight; // Ajouter un espace après le titre

    // Section RGPD explication
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const rgpdIntro = "Le RGPD, ou Règlement Général sur la Protection des Données, est un règlement européen qui est entré en vigueur le 25 mai 2018. Il a été conçu pour renforcer la protection des données personnelles des citoyens de l'Union européenne et pour harmoniser les règles de protection des données à travers l'Europe.\nLes principaux principes du RGPD sont les suivants : le consentement éclairé des personnes pour le traitement de leurs données, la limitation de la collecte et de l'utilisation des données au strict nécessaire, la transparence dans le traitement des données, la garantie de la sécurité et de l'intégrité des données, et la responsabilité des entreprises en cas de violation de données.";
    const splitRgpdIntro = doc.splitTextToSize(rgpdIntro, textWidth);
    doc.text(splitRgpdIntro, margin, yPos);
    yPos += splitRgpdIntro.length * lineHeight + lineHeight;

    // POURQUOI COLLECTE-T-ON VOS DONNÉES ?
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

    // COMMENT SONT STOCKÉES VOS DONNÉES ?
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

    // COMBIEN DE TEMPS SONT STOCKÉES VOS DONNÉES ?
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

    // QUI A ACCÈS À VOS DONNÉES ?
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

    // ACCORD DU BÉNÉFICIAIRE
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

    // Informations bénéficiaire et signature
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
    doc.line(margin, yPos, margin + 80, yPos); // Ligne pour la signature
    yPos += lineHeight * 2;

    const fileName = `Attestation_RGPD_${userFullName.replace(/\s+/g, '_')}_${userId}.pdf`;
    doc.save(fileName);

    // Appel API pour enregistrer la trace de génération RGPD
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // Pas besoin d'envoyer de corps de requête, l'API mettra à jour la date actuelle
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Échec de l'enregistrement de la trace RGPD: ${response.statusText} - ${errorData}`);
        alert("Erreur lors de l'enregistrement de la trace RGPD en base de données.");
      } else {
        console.log("Trace RGPD enregistrée avec succès en base de données.");
        // Optionnel: Afficher un message de succès plus discret ou mettre à jour un état
      }
    } catch (apiError) {
      console.error("Erreur lors de l'appel API pour la trace RGPD:", apiError);
      alert("Erreur réseau ou inattendue lors de l'enregistrement de la trace RGPD.");
    }
  };

  const handleFinish = () => {
    router.push('/users'); // Rediriger vers la liste des usagers
  };

  const handleCancel = () => {
    router.push('/users');
  };

  if (isLoadingGestionnaires) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Chargement des gestionnaires...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Créer un nouvel usager</h1>
      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

      {showSuccessMessage && savedUserFullData && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex flex-col gap-2">
          <p>Usager sauvegardé avec succès dans l'exercice {(savedUserFullData as any).annee || selectedYear} !</p>
          {(savedUserFullData as any).annee && (savedUserFullData as any).annee !== selectedYear && (
            <button
              onClick={() => {
                const newYear = (savedUserFullData as any).annee;
                // @ts-ignore - setSelectedYear est disponible dans le contexte mais peut-être pas dans l'interface exportée ici si elle n'est pas à jour
                if (typeof setSelectedYear === 'function') {
                  setSelectedYear(newYear);
                  router.push('/users');
                } else {
                  // Fallback si setSelectedYear n'est pas dispo (ne devrait pas arriver si le contexte est bon)
                  console.warn("setSelectedYear non disponible");
                  router.push(`/users?annee=${newYear}`); // Tentative de passage par URL si supporté
                }
              }}
              className="text-sm font-semibold underline hover:text-green-900 text-left"
            >
              Basculer vers l'exercice {(savedUserFullData as any).annee} pour voir ce dossier
            </button>
          )}
        </div>
      )}

      {showSearch ? (
        <UserSearch
          onSelectUser={handleSelectUser}
          onCreateNew={handleCreateNew}
          currentYear={selectedYear}
        />
      ) : (
        <UserForm
          key={previousUserId || "new"} // Forcer le remount si on change de contexte
          initialData={prefilledData}
          onSubmit={handleSave}
          onCancel={handleCancel}
          mode="create"
        />
      )}

      {showRgpdButton && savedUserFullData && ( // Utiliser savedUserFullData pour le rendu conditionnel
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => initiateRgpdAttestationGeneration(
              savedUserFullData.id,
              `${savedUserFullData.prenom} ${savedUserFullData.nom}`,
              `${savedUserFullData.adresse?.rue || ''} ${savedUserFullData.adresse?.numero || ''} ${savedUserFullData.adresse?.boite ? `Boîte ${savedUserFullData.adresse.boite}` : ''}`.trim(),
              savedUserFullData.adresse?.codePostal || '',
              savedUserFullData.adresse?.ville || ''
            )}
            className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Générer Attestation RGPD
          </button>
          <button
            onClick={handleFinish}
            className="px-6 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Terminer
          </button>
        </div>
      )}
    </div>
  );
}
