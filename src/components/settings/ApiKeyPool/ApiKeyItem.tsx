/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - API Key Item Component
*/

import React from 'react';
import { TrashIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { DbApiKey } from './useApiKeyPool';

const mask = (k: string) => k.length < 12 ? '****' : (k.includes('...') ? k : `${k.substring(0, 8)}...${k.substring(k.length - 4)}`);

export const ApiKeyItem: React.FC<{ apiKey: DbApiKey; onRemove: (id: string) => void }> = ({ apiKey, onRemove }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${apiKey.isRateLimited ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center">
            {apiKey.isRateLimited ? <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mr-2" /> : <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />}
            <div>
                <p className="font-medium text-gray-900">{apiKey.label}</p>
                <p className="text-xs text-gray-500 font-mono">{mask(apiKey.key)}</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{apiKey.requestsToday}</p>
                <p className="text-xs text-gray-400">req/jour</p>
            </div>
            <button onClick={() => onRemove(apiKey.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
        </div>
    </div>
);
