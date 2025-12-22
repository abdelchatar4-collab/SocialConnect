/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { HousingStats } from '../../types/dashboard';
import { getPasqBarColors } from '../../utils/dashboardUtils';
import { RECHARTS_COLORS } from '../../constants/pasqTheme';

interface HousingDashboardProps {
    housingStats: HousingStats;
}

const COLORS = RECHARTS_COLORS;

const HousingDashboard: React.FC<HousingDashboardProps> = ({ housingStats }) => {
    return (
        <div className="pasq-glass-box mb-8 pasq-hover-lift" style={{ borderTop: '4px solid #00B4A7', boxShadow: 'var(--pasq-shadow-lg)' }}>
            <h2 className="pasq-h2 mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <span className="mr-2 text-3xl">🏙️</span>
                    <div className="flex flex-col">
                        <span className="leading-tight text-[#008C7A]">Analyse Logement</span>
                        <span className="text-base font-normal text-[#009F8D] mt-1">Données sur le parc locatif et les conditions de logement</span>
                    </div>
                </div>
                <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                    {housingStats.totalLogement} logements renseignés
                </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* KPI Cards */}
                <div className="pasq-stat-card flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium mb-2" style={{ color: '#00B4A7' }}>Logement Social</p>
                        <p className="pasq-stat-number">{housingStats.partLogementSocial.toFixed(1)}%</p>
                        <p className="pasq-stat-label">Part du parc social / AIS</p>
                    </div>
                    <span className="text-5xl" style={{ color: 'rgba(0, 180, 167, 0.2)' }}>🏢</span>
                </div>
                <div className="pasq-stat-card flex items-center justify-between" style={{ animationDelay: '0.1s' }}>
                    <div>
                        <p className="text-sm font-medium mb-2" style={{ color: '#008C7A' }}>Loyer Moyen</p>
                        <p className="pasq-stat-number">{housingStats.loyerMoyen.toFixed(2)}€</p>
                        <p className="pasq-stat-label">Par mois hors charges</p>
                    </div>
                    <span className="text-5xl" style={{ color: 'rgba(0, 140, 122, 0.2)' }}>💶</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart: Type de Logement */}
                <div className="pasq-chart-box">
                    <h3 className="pasq-h3 mb-4 flex items-center">
                        <span className="mr-2">🏘️</span>
                        Typologie des Logements
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={housingStats.typeLogementData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {housingStats.typeLogementData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart: Répartition des Loyers */}
                <div className="pasq-chart-box">
                    <h3 className="pasq-h3 mb-4 flex items-center">
                        <span className="mr-2">📊</span>
                        Distribution des Loyers
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={housingStats.loyerRangeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                                    {housingStats.loyerRangeData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={getPasqBarColors(housingStats.loyerRangeData.length)[index]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HousingDashboard;
