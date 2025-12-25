/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Evolution Timeline Chart
Extracted from DashboardCharts.tsx
*/

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { safeArrayAccess } from '../../../utils/dashboardUtils';

interface EvolutionChartProps {
    data: any[];
}

export const EvolutionChart: React.FC<EvolutionChartProps> = ({ data }) => {
    return (
        <div className="pasq-glass-box lg:col-span-2 pasq-hover-lift">
            <h2 className="pasq-h3 mb-4 flex items-center">
                <span className="mr-2">📈</span>
                Évolution des ouvertures de dossiers (2025)
            </h2>
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={safeArrayAccess(data)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            stroke="#e5e7eb"
                            tickLine={false}
                            axisLine={{ stroke: '#e5e7eb' }}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            stroke="#e5e7eb"
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            formatter={(value) => [`${value} ouvertures`, 'Nombre']}
                            labelFormatter={(label) => `Mois: ${label}`}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid rgba(0, 180, 167, 0.2)',
                                borderRadius: '8px',
                                boxShadow: 'var(--pasq-shadow-md)',
                                fontFamily: 'Source Sans Pro, sans-serif'
                            }}
                            labelStyle={{ color: '#008C7A', fontWeight: 600 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="actions"
                            stroke="#008C7A"
                            strokeWidth={3}
                            fill="rgba(0, 140, 122, 0.1)"
                            fillOpacity={1}
                            dot={{ fill: '#008C7A', stroke: '#ffffff', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: '#00B4A7', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
