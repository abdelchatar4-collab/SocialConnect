"use client";
import React, { useState } from "react";
import { User, Gestionnaire } from "@/types";
import { useAdmin } from "@/contexts/AdminContext";
import { formatDate } from "@/utils/formatters";

// Modular UI components
import { UserDetailsActions } from "./UserDetailsActions";
import { UserDetailDisplay } from "./UserDetailDisplay";

interface UserDetailsProps {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  gestionnaires: Gestionnaire[];
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
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
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

  const handleExcelExport = () => {
    if (!user) return;
    const userData = [
      ["ID", user.id],
      ["Nom", user.nom || ""],
      ["Prénom", user.prenom || ""],
      ["Date de naissance", formatDate(user.dateNaissance)],
      ["Genre", user.genre || ""],
      ["Email", user.email || ""],
      ["Téléphone", user.telephone || ""],
      ["Adresse", user.adresse ? `${user.adresse.numero || ''} ${user.adresse.rue || ''}, ${user.adresse.codePostal || ''} ${user.adresse.ville || ''}`.trim() : ""],
      ["Date d'ouverture", formatDate(user.dateOuverture)],
      ["État du dossier", user.etat || ""],
      ["Nationalité", user.nationalite || ""],
      ["Gestionnaire", typeof user.gestionnaire === 'object' && user.gestionnaire ? `${(user.gestionnaire as any).prenom || ''} ${(user.gestionnaire as any).nom || ''}`.trim() : (user.gestionnaire || "")],
      ["Secteur", user.secteur || ""],
      ["Notes", user.notesGenerales || ""],
    ];

    let csvContent = "data:text/csv;charset=utf-8,";
    userData.forEach((row) => {
      const escapedRow = row.map((cell) => {
        const cellStr = String(cell).replace(/"/g, '""');
        return cell && cellStr.includes(",") ? `"${cellStr}"` : cellStr;
      });
      csvContent += escapedRow.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fiche-${user.nom?.toLowerCase() || "usager"}-${user.prenom?.toLowerCase() || ""}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (error) return <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4"><div className="flex"><div className="ml-3"><h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3><div className="mt-2 text-sm text-red-700">{error}</div></div></div></div>;
  if (!user) return <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4"><div className="flex"><div className="ml-3"><h3 className="text-sm font-medium text-yellow-800">Utilisateur non trouvé</h3><div className="mt-2 text-sm text-yellow-700">L'utilisateur spécifié n'existe pas.</div></div></div></div>;

  return (
    <div className="backdrop-blur-xl bg-white/70 shadow-2xl overflow-hidden sm:rounded-3xl my-8 max-w-5xl mx-auto border border-white/40 ring-1 ring-black/5">
      <UserDetailsActions
        user={user}
        gestionnaires={gestionnaires}
        isAdmin={isAdmin}
        onDelete={handleDeleteClick}
        onExcelExport={handleExcelExport}
      />

      <div className="p-6 bg-gray-50">
        <UserDetailDisplay user={user} gestionnaires={gestionnaires} />
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end sm:items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" aria-hidden="true" onClick={cancelDelete}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">​</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Confirmer la suppression</h3>
                    <div className="mt-2 text-sm text-gray-500">
                      Voulez-vous supprimer le dossier de <strong>{user.prenom} {user.nom}</strong> ? Cette action est irréversible.
                      {deleteError && <p className="mt-3 text-red-700 bg-red-100 p-3 rounded border border-red-300">{deleteError}</p>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                <button type="button" onClick={confirmDelete} disabled={isDeleting} className={`flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm text-white ${isDeleting ? "bg-red-400" : "bg-red-600 hover:bg-red-700"}`}>
                  {isDeleting ? "Suppression..." : "Oui, supprimer"}
                </button>
                <button type="button" onClick={cancelDelete} className="rounded-md px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-100">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
