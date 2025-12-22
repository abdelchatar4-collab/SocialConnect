/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, but SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { ActionStatsByAntenneItem } from '../../types/dashboard';

interface DashboardAntenneStatsProps {
    actionStatsByAntenne: ActionStatsByAntenneItem[];
    averageActionsPerAntenne: number;
    averageActionsPerMonth: number;
    averageActionsPerYear: number;
}

const DashboardAntenneStats: React.FC<DashboardAntenneStatsProps> = ({
    actionStatsByAntenne,
    averageActionsPerAntenne,
    averageActionsPerMonth,
    averageActionsPerYear
}) => {
    return (
        <div className="pasq-glass-box mb-8 pasq-hover-lift">
            <h2 className="pasq-h2 mb-6">
                Statistiques des actions par antenne
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
                <div className="pasq-stat-card pasq-hover-lift">
                    <p className="text-sm font-medium" style={{ color: '#008C7A' }}>Moyenne par antenne</p>
                    <p className="pasq-stat-number">{(averageActionsPerAntenne || 0).toFixed(1)}</p>
                    <p className="pasq-stat-label">actions par antenne</p>
                </div>
                <div className="pasq-stat-card pasq-hover-lift" style={{ animationDelay: '0.1s' }}>
                    <p className="text-sm font-medium" style={{ color: '#00B4A7' }}>Moyenne mensuelle</p>
                    <p className="pasq-stat-number">{(averageActionsPerMonth || 0).toFixed(1)}</p>
                    <p className="pasq-stat-label">actions par mois</p>
                </div>
                <div className="pasq-stat-card pasq-hover-lift" style={{ animationDelay: '0.2s' }}>
                    <p className="text-sm font-medium" style={{ color: '#009F8D' }}>Moyenne annuelle</p>
                    <p className="pasq-stat-number">{(averageActionsPerYear || 0).toFixed(0)}</p>
                    <p className="pasq-stat-label">actions par an</p>
                </div>
            </div>
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={actionStatsByAntenne}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                        <XAxis
                            dataKey="antenne"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                            fontSize={12}
                            tick={{ fill: '#374151', fontSize: 12 }}
                        />
                        <YAxis
                            fontSize={12}
                            tick={{ fill: '#6B7280' }}
                        />
                        <Tooltip
                            formatter={(value, name) => {
                                if (name === 'totalActions') return [`${value} actions`, 'Total des actions'];
                                if (name === 'numberOfTSR') return [`${value} TSR`, 'Nombre de TSR'];
                                if (name === 'numberOfUsers') return [`${value} utilisateurs`, 'Nombre d\'utilisateurs'];
                                return [value, name];
                            }}
                            labelFormatter={(label) => `Antenne: ${label}`}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid rgba(0, 180, 167, 0.2)',
                                borderRadius: '8px',
                                boxShadow: 'var(--pasq-shadow-md)',
                                fontFamily: 'Source Sans Pro, sans-serif'
                            }}
                        />
                        <Bar dataKey="totalActions" fill="#008C7A" name="totalActions" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="numberOfTSR" fill="#00B4A7" name="numberOfTSR" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="numberOfUsers" fill="#33C7B6" name="numberOfUsers" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DashboardAntenneStats;
