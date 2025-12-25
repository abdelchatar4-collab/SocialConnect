/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import React from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useImportDossiers } from '@/hooks/useImportDossiers';

interface ImportModalProps { isOpen: boolean; onClose: () => void; onImportSuccess?: () => void; }

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const { selectedYear } = useAdmin();
  const { file, loading, message, isError, handleFileChange, handleImport } = useImportDossiers(onImportSuccess);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Importer des usagers</h2>
        <p className="mb-6 text-slate-500">Sélectionnez un fichier CSV ou Excel pour importer des dossiers vers {selectedYear || 'l\'année en cours'}.</p>
        <div className="mb-6">
          <label className="block text-slate-700 text-sm font-bold mb-2">Fichier CSV / Excel</label>
          <input type="file" onChange={handleFileChange} className="w-full p-3 border-2 border-slate-100 rounded-lg focus:border-blue-500 outline-none" accept=".csv,.xlsx,.xls" />
          {file && <p className="mt-2 text-sm text-slate-400">Prêt : {file.name}</p>}
        </div>
        {message && <div className={`mb-6 p-4 rounded-lg border ${isError ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>{message}</div>}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors" disabled={loading}>Annuler</button>
          <button onClick={() => handleImport(selectedYear || new Date().getFullYear())} disabled={!file || loading} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50">
            {loading ? <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Traitement...</span> : 'Importer les dossiers'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
