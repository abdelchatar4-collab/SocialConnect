/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Staff & Age Distribution Charts
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

interface StaffAndAgeChartsProps {
    gestionnaireData: any[];
    parAge: any[];
}

export const StaffAndAgeCharts: React.FC<StaffAndAgeChartsProps> = ({ gestionnaireData, parAge }) => {
    const tooltipStyle = {
        backgroundColor: 'white',
        border: '1px solid rgba(0, 180, 167, 0.2)',
        borderRadius: '8px',
        boxShadow: 'var(--pasq-shadow-md)',
        fontFamily: 'Source Sans Pro, sans-serif'
    };

    return (
        <>
            {/* Répartition par gestionnaire */}
            <div className="pasq-chart-box pasq-hover-lift">
                <h2 className="pasq-h2 mb-4">Répartition par gestionnaire</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={safeArrayAccess(gestionnaireData)}
                            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={70}
                                interval={0}
                                tick={{ fill: '#6B7280', fontSize: 11 }}
                                stroke="#e5e7eb"
                                tickLine={false}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} stroke="#e5e7eb" tickLine={false} axisLine={false} />
                            <Tooltip
                                formatter={(value) => [`${value} usagers`, 'Nombre']}
                                contentStyle={tooltipStyle}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {safeArrayAccess(gestionnaireData).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getPasqBarColors(safeArrayAccess(gestionnaireData).length)[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Répartition par tranche d'âge */}
            <div className="pasq-chart-box pasq-hover-lift">
                <h2 className="pasq-h2 mb-4">Répartition par tranche d'âge</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={safeArrayAccess(parAge)}
                            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                stroke="#e5e7eb"
                                tickLine={false}
                                axisLine={{ stroke: '#e5e7eb' }}
                                interval={0}
                                dy={5}
                            />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} stroke="#e5e7eb" tickLine={false} axisLine={false} />
                            <Tooltip
                                formatter={(value) => [`${value} usagers`, 'Nombre']}
                                contentStyle={tooltipStyle}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {safeArrayAccess(parAge).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getPasqBarColors(safeArrayAccess(parAge).length)[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
};
