/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Demo Stats Component
Extracted from UserManagementDemo.tsx
*/

import React from 'react';

interface UserManagementStatsProps {
    stats: {
        total: number;
        recentlyAdded: number;
        recentlyUpdated: number;
        byGestionnaire: Record<string, number>;
        byStatus: Record<string, number>;
    };
    insights: string[];
}

export const UserManagementStats: React.FC<UserManagementStatsProps> = ({ stats, insights }) => {
    return (
        <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Statistiques</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-100 p-4 rounded-lg">
                    <h3 className="font-semibold">Total Utilisateurs</h3>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                    <h3 className="font-semibold">Ajoutés Récemment</h3>
                    <p className="text-2xl font-bold text-green-600">{stats.recentlyAdded}</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg">
                    <h3 className="font-semibold">Mis à jour récemment</h3>
                    <p className="text-2xl font-bold text-yellow-600">{stats.recentlyUpdated}</p>
                </div>
            </div>

            {insights.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Suggestions d&apos;amélioration:</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {insights.map((insight, index) => (
                            <li key={index} className="text-purple-700">{insight}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
