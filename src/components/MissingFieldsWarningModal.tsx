/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';

interface MissingFieldsWarningModalProps {
    isOpen: boolean;
    missingFields: string[];
    onClose: () => void;
    onContinue: () => void;
    onGoBack: () => void;
}

const FIELD_LABELS: Record<string, string> = {
    nom: 'Nom',
    prenom: 'Prénom',
    dateNaissance: 'Date de naissance',
    adresse: 'Adresse complète',
    antenne: 'Antenne',
    gestionnaire: 'Gestionnaire',
};

export const MissingFieldsWarningModal: React.FC<MissingFieldsWarningModalProps> = ({
    isOpen,
    missingFields,
    onClose,
    onContinue,
    onGoBack,
}) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                                            <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" aria-hidden="true" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-semibold leading-6 text-gray-900"
                                        >
                                            Informations essentielles manquantes
                                        </Dialog.Title>
                                        <div className="mt-3">
                                            <p className="text-sm text-gray-600">
                                                Les champs suivants sont essentiels pour assurer la qualité des données :
                                            </p>
                                            <ul className="mt-3 space-y-2">
                                                {missingFields.map((field) => (
                                                    <li
                                                        key={field}
                                                        className="flex items-center gap-2 text-sm text-gray-700"
                                                    >
                                                        <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                        <span className="font-medium">{FIELD_LABELS[field] || field}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <p className="mt-4 text-sm text-gray-600">
                                                Souhaitez-vous compléter ces informations maintenant ou enregistrer quand même ?
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3 justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={onContinue}
                                        className="text-sm"
                                    >
                                        Enregistrer quand même
                                    </Button>
                                    <Button
                                        variant="default"
                                        onClick={onGoBack}
                                        className="text-sm"
                                    >
                                        Compléter les informations
                                    </Button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default MissingFieldsWarningModal;
