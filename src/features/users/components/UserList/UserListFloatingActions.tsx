/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React, { Fragment, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui';
import { Trash2, X } from 'lucide-react';
import { Transition } from '@headlessui/react';

interface UserListFloatingActionsProps {
    selectedCount: number;
    onClearSelection: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
}

export const UserListFloatingActions: React.FC<UserListFloatingActionsProps> = ({
    selectedCount,
    onClearSelection,
    onDelete,
    isDeleting = false
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <Transition
            show={selectedCount > 0}
            as={Fragment}
            enter="transition ease-out duration-300"
            enterFrom="transform translate-y-full opacity-0"
            enterTo="transform translate-y-0 opacity-100"
            leave="transition ease-in duration-200"
            leaveFrom="transform translate-y-0 opacity-100"
            leaveTo="transform translate-y-full opacity-0"
        >
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4 pointer-events-none"> {/* Added z-[100] and pointer-events-none to container */}
                <div className="pointer-events-auto bg-white rounded-full shadow-2xl border border-gray-200 p-2 pl-6 flex items-center justify-between gap-4 ring-1 ring-black/5 mx-auto backdrop-blur-sm bg-white/90">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                            {selectedCount}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                            {selectedCount} usager{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearSelection}
                            className="rounded-full h-9 px-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                            <span className="sr-only">Annuler</span>
                            <X className="w-4 h-4 mr-2" />
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={onDelete}
                            disabled={isDeleting}
                            className="rounded-full h-9 px-4 shadow-sm"
                        >
                            {isDeleting ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full"></span>
                                    Suppression...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Supprimer
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </Transition>,
        document.body
    );
};
