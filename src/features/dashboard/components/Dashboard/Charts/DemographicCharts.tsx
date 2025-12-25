/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Demographic Charts (Antenne & Genre)
Extracted from DashboardCharts.tsx
*/

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { safeArrayAccess } from '../../../utils/dashboardUtils';

interface DemographicChartsProps {
    parAntenne: any[];
    parGenre: any[];
    colors: readonly string[];
}

export const DemographicCharts: React.FC<DemographicChartsProps> = ({ parAntenne, parGenre, colors }) => {
    const tooltipStyle = {
        backgroundColor: 'white',
        border: '1px solid rgba(0, 180, 167, 0.2)',
        borderRadius: '8px',
        boxShadow: 'var(--pasq-shadow-md)',
        fontFamily: 'Source Sans Pro, sans-serif'
    };

    return (
        <>
            {/* Répartition par antenne (Pie) */}
            <div className="pasq-chart-box pasq-hover-lift">
                <h2 className="pasq-h2 mb-4">Répartition par antenne</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={safeArrayAccess(parAntenne)}
                                cx="50%"
                                cy="45%"
                                labelLine={false}
                                outerRadius={90}
                                innerRadius={30}
                                fill="#00B4A7"
                                dataKey="value"
                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            >
                                {safeArrayAccess(parAntenne).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => [`${value} usagers`, 'Nombre']}
                                contentStyle={tooltipStyle}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '16px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Répartition par genre */}
            <div className="pasq-chart-box pasq-hover-lift">
                <h2 className="pasq-h2 mb-4">Répartition par genre</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={safeArrayAccess(parGenre)}
                                cx="50%"
                                cy="45%"
                                labelLine={false}
                                outerRadius={90}
                                innerRadius={30}
                                fill="#33C7B6"
                                dataKey="value"
                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            >
                                {safeArrayAccess(parGenre).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => [`${value} usagers`, 'Nombre']}
                                contentStyle={tooltipStyle}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '16px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
};
