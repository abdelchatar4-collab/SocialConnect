/*
Copyright (C) 2025 ABDEL KADER CHATAR
*/

import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

const AiHeader: React.FC = () => {
    return (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                    <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-purple-900">Intelligence Artificielle</h3>
                    <p className="text-sm text-purple-700">Configuration du fournisseur et du modèle IA</p>
                </div>
            </div>
        </div>
    );
};

export default AiHeader;
