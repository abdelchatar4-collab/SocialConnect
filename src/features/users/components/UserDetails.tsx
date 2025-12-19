/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";
import React, { useState, useCallback } from "react";
import { User, Gestionnaire, ActionSuivi } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/contexts/AdminContext";
import { formatDate } from "@/utils/formatters";
// import { PDFDownloadLink } from "@react-pdf/renderer"; // Supprimé car déplacé dans LazyPDFDownloadButton
import UserPDFDocument from "@/components/UserPDFView";
import LazyPDFDownloadButton from "@/components/LazyPDFDownloadButton";
import { extractActionsFromNotes, getActionsForUser, getLastThreeActions, deduplicateActions, deduplicateActionsSuivi, deduceActionType } from '@/utils/actionUtils';

// --- Icônes SVG modernes ---
const EditIcon = ({ className = "h-5 w-5 mr-2" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6" />
  </svg>
);

const TrashIcon = ({ className = "h-5 w-5 mr-2" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2zm0 0V3m0 2v2" />
  </svg>
);

const ExcelIcon = ({ className = "h-5 w-5 mr-2" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const PrintIcon = ({ className = "h-5 w-5 mr-2" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const PdfIcon = ({ className = "h-5 w-5 mr-2" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

// Fonction pour déterminer la classe du badge selon l'état
const getEtatBadgeClass = (etat?: string) => {
  switch (etat?.toLowerCase()) {
    case "actif":
      return "badge-success";
    case "en attente":
      return "badge-warning";
    case "suspendu":
      return "badge-warning";
    case "clôturé":
      return "badge-error";
    default:
      return "badge bg-gray-100 text-gray-800";
  }
};



// Composant d'affichage des détails utilisateur
const UserDetailDisplay = React.memo(
  ({ user, gestionnaires }: { user: User | null; gestionnaires: Gestionnaire[] }) => {
    if (!user) return null;

    // Ajoute ce log ici :
    console.log("PROBLEMATIQUES RECUES", user.problematiques);

    const displayValue = (value: string | number | null | undefined) =>
      value ? <span className="font-medium text-gray-900">{value}</span> : <span className="text-gray-600 italic font-medium">N/A</span>;
    const displayDate = (date: string | Date | null | undefined) =>
      date ? <span className="font-medium text-gray-900">{formatDate(date)}</span> : <span className="text-gray-600 italic">N/A</span>;

    // --- Extraction automatique des actions depuis les notes si actions vide ---
    let actionsToDisplay = user.actions && user.actions.length > 0 ? user.actions : [];
    if ((!user.actions || user.actions.length === 0) && user.notesGenerales) {
      const extractedActions = extractActionsFromNotes(user.notesGenerales);
      actionsToDisplay = extractedActions;
    }
    // Appliquer la déduplication dans TOUS les cas
    // Remplacer cette ligne :
    // actionsToDisplay = deduplicateActions(actionsToDisplay);

    // Par :
    actionsToDisplay = deduplicateActionsSuivi(actionsToDisplay);

    return (
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Informations Personnelles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Nom :</span> {displayValue(user.nom)}
            </div>
            <div>
              <span className="font-medium text-gray-700">Prénom :</span> {displayValue(user.prenom)}
            </div>
            <div>
              <span className="font-medium text-gray-700">Date de naissance :</span> {displayDate(user.dateNaissance)}
            </div>
            <div>
              <span className="font-medium text-gray-700">Genre :</span> {displayValue(user.genre)}
            </div>
            <div>
              <span className="font-medium text-gray-700">Nationalité :</span> {displayValue(user.nationalite)}
            </div>
            <div>
              <span className="font-medium text-gray-700">Email :</span> {displayValue(user.email)}
            </div>
            <div>
              <span className="font-medium text-gray-700">Téléphone :</span> {displayValue(user.telephone)}
            </div>
            <div>
              <span className="font-medium text-gray-700">Langue d&apos;entretien :</span> {displayValue(user.langue)}
            </div>
            <div>
              <span className="font-medium text-gray-700">Statut de séjour :</span> {displayValue(user.statutSejour)}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Coordonnées / Adresse</h2>
          {user.adresse ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Rue :</span> {displayValue(user.adresse.rue)}
              </div>
              <div>
                <span className="font-medium text-gray-700">Numéro :</span> {displayValue(user.adresse.numero)}
              </div>
              <div>
                <span className="font-medium text-gray-700">Boîte :</span> {displayValue(user.adresse.boite)}
              </div>
              <div>
                <span className="font-medium text-gray-700">Code Postal :</span> {displayValue(user.adresse.codePostal)}
              </div>
              <div>
                <span className="font-medium text-gray-700">Ville :</span> {displayValue(user.adresse.ville)}
              </div>
              {/* Remove Pays field */}
            </div>
          ) : (
            <div className="text-gray-600 italic text-sm">Aucune adresse enregistrée.</div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Dossier Administratif</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">État du dossier :</span>{" "}
              <span
                className={`font-medium inline-flex items-center px-2 py-0.5 rounded text-xs ${getEtatBadgeClass(
                  user.etat as string
                )}`}
              >
                {displayValue(user.etat)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Antenne :</span> {displayValue(user.antenne)}
            </div>
            <div>
              <span className="font-medium text-gray-700">Gestionnaire :</span> {
                (() => {
                  const gestionnaireValue = user.gestionnaire;

                  // Si la valeur est null ou undefined
                  if (!gestionnaireValue) {
                    return <span className="text-gray-600 italic">N/A</span>;
                  }

                  // Si c'est un objet avec nom et prénom
                  if (typeof gestionnaireValue === 'object' && gestionnaireValue !== null && 'nom' in gestionnaireValue) {
                    const gestObj = gestionnaireValue as { prenom?: string | null; nom?: string | null; id?: string };
                    const fullName = `${gestObj.prenom || ''} ${gestObj.nom || ''}`.trim();
                    return fullName ? <span className="font-medium text-gray-900">{fullName}</span> : <span className="text-gray-600 italic">N/A</span>;
                  }

                  // Si c'est un ID, chercher dans la liste des gestionnaires
                  if (typeof gestionnaireValue === 'string') {
                    const foundGestionnaire = gestionnaires?.find(g => g.id === gestionnaireValue);
                    if (foundGestionnaire) {
                      const fullName = `${foundGestionnaire.prenom || ''} ${foundGestionnaire.nom || ''}`.trim();
                      return fullName ? <span className="font-medium text-gray-900">{fullName}</span> : <span className="text-gray-600 italic">N/A</span>;
                    }
                    // Si on ne trouve pas, afficher l'ID
                    return <span className="font-medium text-gray-900">{gestionnaireValue}</span>;
                  }

                  // Cas par défaut
                  return <span className="text-gray-600 italic">Format inconnu</span>;
                })()
              }
            </div>
            {/* Secteur */}
            <div>
              <span className="font-medium text-gray-700">Secteur :</span> {displayValue(user.secteur)}
            </div>
            <div>
              <span className="font-medium text-gray-700">Date d&apos;ouverture :</span> {displayDate(user.dateOuverture)}
            </div>
            <div>
              <span className="font-medium text-gray-700">Date de clôture :</span> {displayDate(user.dateCloture)}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Notes Générales</h2>
          {user.notesGenerales ? (
            <div className="text-gray-800 text-sm whitespace-pre-wrap">{user.notesGenerales}</div>
          ) : (
            <div className="text-gray-600 italic text-sm">Aucune note générale.</div>
          )}
        </div>

        {/* Nouvelle section pour les Problématiques */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Problématiques</h2>
          {user.problematiques && user.problematiques.length > 0 ? (
            <ul className="space-y-4">
              {user.problematiques.map((problematique, index) => (
                <li key={index} className="text-sm border-l-4 border-yellow-500 pl-3 bg-yellow-50 p-2 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    {problematique.dateSignalement && (
                      <span className="font-semibold text-gray-900">
                        {displayDate(problematique.dateSignalement)}
                      </span>
                    )}
                    <span className="font-medium text-gray-900">
                      {displayValue(problematique.type)}
                    </span>
                  </div>
                  {problematique.description && (
                    <div className="mt-1 text-gray-800 whitespace-pre-wrap">{problematique.description}</div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-600 italic text-sm">Aucune problématique enregistrée.</div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Actions et suivi</h2>
          {/* Message d'information si actions extraites des notes */}
          {(!user.actions || user.actions.length === 0) && actionsToDisplay.length > 0 && (
            <div className="text-xs text-amber-600 mb-2 flex items-center gap-1">
              <svg className="inline h-4 w-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" d="M12 8v4m0 4h.01" /></svg>
              Ajouté automatiquement depuis les notes
            </div>
          )}
          {actionsToDisplay && actionsToDisplay.length > 0 ? (
            <ul className="space-y-4">
              {actionsToDisplay.map((action, index) => (
                <li key={index} className="text-sm border-l-4 border-green-500 pl-3 bg-green-50 p-2 rounded">
                  <div className="font-medium text-gray-900">
                    {deduceActionType(action)}
                    {(!action.type || action.type.trim() === '') && <span className="text-gray-400"> (déduit)</span>}
                    {action.date && (
                      <span className="ml-2 text-gray-700">
                        {formatDate(action.date)}
                      </span>
                    )}
                    {action.partenaire && (
                      <span className="text-gray-800 ml-2 font-medium">(Partenaire: {action.partenaire})</span>
                    )}
                  </div>
                  {action.description && (
                    <div className="mt-1 text-gray-800 whitespace-pre-wrap">{action.description}</div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-600 italic text-sm">Aucune action enregistrée.</div>
          )}
        </div>
      </div>
    );
  }
);

UserDetailDisplay.displayName = "UserDetailDisplay";

interface UserDetailsProps {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  gestionnaires: Gestionnaire[]; // Ajoutez cette prop
}

const UserDetails: React.FC<UserDetailsProps> = ({ user, isLoading, error, gestionnaires }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { isAdmin } = useAdmin();

  const handleDeleteClick = () => setShowDeleteConfirm(true);
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!user?.id) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Erreur ${res.status}: La suppression a échoué.`);
      }

      window.location.href = "/users";
    } catch (err: any) {
      console.error("Erreur lors de la suppression:", err);
      setDeleteError(err.message);
      setIsDeleting(false);
    }
  };

  const handleExcelExport = (currentUser: User | null) => {
    if (!currentUser) return;

    const userData = [
      ["ID", currentUser.id],
      ["Nom", currentUser.nom || ""],
      ["Prénom", currentUser.prenom || ""],
      ["Date de naissance", formatDate(currentUser.dateNaissance)],
      ["Genre", currentUser.genre || ""],
      ["Email", currentUser.email || ""],
      ["Téléphone", currentUser.telephone || ""],
      ["Adresse", currentUser.adresse ?
        `${currentUser.adresse.numero || ''} ${currentUser.adresse.rue || ''}, ${currentUser.adresse.codePostal || ''} ${currentUser.adresse.ville || ''}`.trim() :
        ""],
      ["Date d'ouverture", formatDate(currentUser.dateOuverture)],
      ["État du dossier", currentUser.etat || ""],
      ["Nationalité", currentUser.nationalite || ""],
      ["Gestionnaire", currentUser.gestionnaire || ""],
      ["Secteur", currentUser.secteur || ""],
      ["Notes", currentUser.notesGenerales || ""],
    ];

    let csvContent = "data:text/csv;charset=utf-8,";

    userData.forEach((row) => {
      const escapedRow = row.map((cell) => {
        const cellStr = String(cell).replace(/"/g, '""');
        return cell && cellStr.includes(",") ? `"${cellStr}"` : cellStr;
      });

      const rowString = escapedRow.join(",");
      csvContent += rowString + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `fiche-${currentUser.nom?.toLowerCase() || "usager"}-${currentUser.prenom?.toLowerCase() || ""}.csv`
    );
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Utilisateur non trouvé</h3>
            <div className="mt-2 text-sm text-yellow-700">
              L&apos;utilisateur avec l&apos;ID spécifié n&apos;existe pas ou a été supprimé.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg overflow-hidden sm:rounded-lg my-8 max-w-5xl mx-auto">
      <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl leading-8 font-bold text-gray-900 mb-1">
            Fiche Usager : {user.prenom} {user.nom}
          </h1>
          <p className="text-base text-gray-600">
            Dossier N°: <span className="font-medium text-gray-800">{user.id}</span> | État:
            <span
              className={`ml-1 font-medium inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${getEtatBadgeClass(
                user.etat as string
              )}`}
            >
              {user.etat || "Inconnu"}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Bouton MODIFIER - BLEU (primary) */}
          <Link href={`/users/${user.id}/edit`} className="flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm text-white bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            <EditIcon /> Modifier
          </Link>

          {/* Bouton PDF - VERT (accent) - OPTIMISÉ LAZY LOADING */}
          {user && gestionnaires && (
            <LazyPDFDownloadButton
              user={user}
              gestionnaires={gestionnaires}
              className="flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm text-white bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            />
          )}

          {/* Bouton EXCEL - BLEU (secondary positive, alternance) */}
          <button
            onClick={() => handleExcelExport(user)}
            className="flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm text-white bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ExcelIcon className="h-5 w-5 mr-2" /> Exporter Excel
          </button>

          {/* Bouton IMPRIMER - VERT (secondary positive) */}
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm text-white bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <PrintIcon className="h-5 w-5 mr-2" /> Imprimer
          </button>

          {/* Bouton SUPPRIMER - ROUGE (destructive) */}
          {isAdmin && (
            <button
              onClick={handleDeleteClick}
              className="flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm text-white bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <TrashIcon className="h-5 w-5 mr-2" /> Supprimer
            </button>
          )}
        </div>
      </div>

      <div className="p-6 bg-gray-50">
        <UserDetailDisplay user={user} gestionnaires={gestionnaires} />
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end sm:items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">​</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Confirmer la suppression
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous certain de vouloir supprimer définitivement le dossier de{" "}
                        <strong>
                          {user.prenom} {user.nom}
                        </strong>{" "}
                        (ID: {user.id}) ? Cette action ne peut pas être annulée.
                      </p>
                      {deleteError && (
                        <p className="mt-3 text-sm text-red-700 bg-red-100 p-3 rounded border border-red-300">
                          {deleteError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className={`flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm text-white ${isDeleting
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    } transition-colors`}
                >
                  {isDeleting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Suppression...
                    </>
                  ) : (
                    "Oui, supprimer"
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm text-gray-700 bg-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
