/*
Copyright (C) 2025 ABDEL KADER CHATAR
*/

import React from 'react';
import { ArrowPathIcon, ShareIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface AiFooterActionsProps {
    isSaving: boolean;
    isSyncing: boolean;
    isSuperAdmin: boolean;
    onSave: () => void;
    onSync: () => void;
}

const AiFooterActions: React.FC<AiFooterActionsProps> = ({
    isSaving,
    isSyncing,
    isSuperAdmin,
    onSave,
    onSync
}) => {
    return (
        <div className="flex justify-end gap-3">
            {/* Sync button for SUPER_ADMIN */}
            {isSuperAdmin && (
                <button
                    onClick={onSync}
                    disabled={isSyncing}
                    className={`px-4 py-2 rounded-lg font-medium text-white transition-all flex items-center gap-2 ${isSyncing ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    title="Synchroniser vers tous les services"
                >
                    {isSyncing ? (
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    ) : (
                        <ShareIcon className="w-4 h-4" />
                    )}
                    {isSyncing ? 'Synchronisation...' : 'Sync tous services'}
                </button>
            )}

            {/* Save button */}
            <button
                onClick={onSave}
                disabled={isSaving}
                className={`px-6 py-2 rounded-lg font-medium text-white transition-all ${isSaving ? 'bg-green-500' : 'bg-purple-600 hover:bg-purple-700'
                    }`}
            >
                {isSaving ? (
                    <>
                        <CheckCircleIcon className="w-4 h-4 inline mr-2" />
                        Sauvegardé !
                    </>
                ) : (
                    'Sauvegarder'
                )}
            </button>
        </div>
    );
};

export default AiFooterActions;
