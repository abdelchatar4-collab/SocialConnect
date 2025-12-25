/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Sector & Problematic Analysis Charts
Extracted from DashboardCharts.tsx
*/

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    ResponsiveContainer
} from 'recharts';
import { safeArrayAccess, getPasqBarColors } from '../../../utils/dashboardUtils';

interface SectorAndProblemChartsProps {
    parSecteur: any[];
    parProblematique: any[];
}

export const SectorAndProblemCharts: React.FC<SectorAndProblemChartsProps> = ({ parSecteur, parProblematique }) => {
    const tooltipStyle = {
        backgroundColor: 'white',
        border: '1px solid rgba(0, 180, 167, 0.2)',
        borderRadius: '8px',
        boxShadow: 'var(--pasq-shadow-md)',
        fontFamily: 'Source Sans Pro, sans-serif'
    };

    return (
        <>
            {/* Répartition par secteur */}
            <div className="pasq-chart-box pasq-hover-lift">
                <h2 className="pasq-h2 mb-4">Répartition par secteur</h2>
                <div style={{ height: `${Math.max(450, parSecteur.length * 40)}px` }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={safeArrayAccess(parSecteur)}
                            margin={{ top: 20, right: 30, left: 160, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                            <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} stroke="#e5e7eb" tickLine={false} axisLine={false} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={150}
                                interval={0}
                                tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 500 }}
                                stroke="#e5e7eb"
                                tickLine={false}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <Tooltip
                                formatter={(value) => [`${value} usagers`, 'Nombre']}
                                contentStyle={tooltipStyle}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {safeArrayAccess(parSecteur).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getPasqBarColors(safeArrayAccess(parSecteur).length)[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Répartition par problématique */}
            <div className="pasq-chart-box lg:col-span-2 pasq-hover-lift">
                <h2 className="pasq-h2 mb-4">Répartition par problématique (filtrée)</h2>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={safeArrayAccess(parProblematique).slice(0, 10)}
                            margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                interval={0}
                                tick={{ fill: '#6B7280', fontSize: 11 }}
                                stroke="#e5e7eb"
                                tickLine={false}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} stroke="#e5e7eb" tickLine={false} axisLine={false} />
                            <Tooltip
                                formatter={(value) => [`${value} occurrences`, 'Nombre']}
                                contentStyle={{
                                    ...tooltipStyle,
                                    backgroundColor: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    maxWidth: '300px'
                                }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {safeArrayAccess(parProblematique).slice(0, 10).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getPasqBarColors(Math.min(10, safeArrayAccess(parProblematique).length))[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {safeArrayAccess(parProblematique).length > 10 && (
                    <p className="text-base text-gray-600 mt-2 text-center font-medium">
                        Affichage des 10 problématiques les plus fréquentes sur {parProblematique.length} au total
                    </p>
                )}
            </div>
        </>
    );
};
