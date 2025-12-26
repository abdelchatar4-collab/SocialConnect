/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User List Skeleton
*/

import React from 'react';
import { UserListHeader } from './index';
import { TableSkeleton, GridSkeleton } from '@/components/ui/Skeleton';

export const UserListSkeleton: React.FC<{ isAdmin: boolean; viewMode: 'table' | 'grid' }> = ({ isAdmin, viewMode }) => (
    <div className="space-y-6">
        <UserListHeader users={[]} title="Liste des usagers" subtitle="Chargement..." isAdmin={isAdmin} loading={true} onRefresh={() => { }} onExport={() => { }} onBulkDelete={() => Promise.resolve()} selectedCount={0} />
        <div className="bg-white rounded-lg shadow border p-6 space-y-4">
            <div className="flex gap-4"><div className="h-10 w-1/3 bg-gray-100 rounded animate-pulse" /><div className="h-10 w-full bg-gray-100 rounded animate-pulse" /></div>
            <div className="grid grid-cols-3 gap-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />)}</div>
        </div>
        <div className="bg-white rounded-lg shadow border overflow-hidden p-6">
            {viewMode === 'table' ? <TableSkeleton rows={5} /> : <GridSkeleton cards={8} />}
        </div>
    </div>
);
