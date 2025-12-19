/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { User } from '@/types/user'; // Utilise uniquement le type User centralisé

interface ExportButtonProps {
  users: User[];
  className?: string;
  children?: React.ReactNode;
}

const ExportButton: React.FC<ExportButtonProps> = ({ users, className = '', children }) => {
  const handleExport = async () => {
    try {
      const response = await fetch('/api/users/export/excel');

      if (!response.ok) {
        let errorMessage = 'Erreur lors de l\'exportation Excel';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Si la réponse n'est pas du JSON, utiliser le statut textuel
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'export-usagers.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i); // Rend le guillemet optionnel et insensible à la casse
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/"/g, ''); // Enlève les guillemets s'ils sont présents
        }
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error during Excel export:', error);
      alert(`Erreur lors de l'exportation Excel: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Le bouton utilise maintenant la className passée et rend les enfants
  // Les styles spécifiques au bouton vert ont été enlevés pour permettre la surcharge par le menu
  return (
    <button
      onClick={handleExport}
      className={className} // Utilise directement la className fournie par UserList.tsx
    >
      {children} {/* Rend l'icône et le texte passés par UserList.tsx */}
    </button>
  );
};

export default ExportButton;
