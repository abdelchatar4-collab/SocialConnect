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
    Legend,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import { DashboardStats } from '../../types/dashboard';
import { RECHARTS_COLORS } from '../../constants/pasqTheme';
import {
    getPasqBarColors,
    safeArrayAccess
} from '../../utils/dashboardUtils';

interface DashboardChartsProps {
    stats: DashboardStats;
}

const COLORS = RECHARTS_COLORS;

const DashboardCharts: React.FC<DashboardChartsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Évolution temporelle */}
            <div className="pasq-glass-box lg:col-span-2 pasq-hover-lift">
                <h2 className="pasq-h3 mb-4 flex items-center">
                    <span className="mr-2">📈</span>
                    Évolution des ouvertures de dossiers (2025)
                </h2>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={safeArrayAccess(stats.actionTimelineData)}
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

            {/* Répartition par antenne (Pie) */}
            <div className="pasq-chart-box pasq-hover-lift">
                <h2 className="pasq-h2 mb-4">
                    Répartition par antenne
                </h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={safeArrayAccess(stats.parAntenne)}
                                cx="50%"
                                cy="45%"
                                labelLine={false}
                                outerRadius={90}
                                innerRadius={30}
                                fill="#00B4A7"
                                dataKey="value"
                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            >
                                {safeArrayAccess(stats.parAntenne).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name) => [`${value} usagers`, 'Nombre']}
                                labelFormatter={(label) => `Antenne: ${label}`}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid rgba(0, 180, 167, 0.2)',
                                    borderRadius: '8px',
                                    boxShadow: 'var(--pasq-shadow-md)',
                                    fontFamily: 'Source Sans Pro, sans-serif'
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ fontSize: '16px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Répartition par gestionnaire */}
            <div className="pasq-chart-box pasq-hover-lift">
                <h2 className="pasq-h2 mb-4">
                    Répartition par gestionnaire
                </h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={safeArrayAccess(stats.gestionnaireData)}
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
                            <YAxis
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                stroke="#e5e7eb"
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                formatter={(value) => [`${value} usagers`, 'Nombre']}
                                labelFormatter={(label) => `Gestionnaire: ${label}`}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid rgba(0, 180, 167, 0.2)',
                                    borderRadius: '8px',
                                    boxShadow: 'var(--pasq-shadow-md)',
                                    fontFamily: 'Source Sans Pro, sans-serif'
                                }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {safeArrayAccess(stats.gestionnaireData).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getPasqBarColors(safeArrayAccess(stats.gestionnaireData).length)[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Répartition par tranche d'âge */}
            <div className="pasq-chart-box pasq-hover-lift">
                <h2 className="pasq-h2 mb-4">
                    Répartition par tranche d&apos;âge
                </h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={safeArrayAccess(stats.parAge)}
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
                            <YAxis
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                stroke="#e5e7eb"
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                formatter={(value) => [`${value} usagers`, 'Nombre']}
                                labelFormatter={(label) => `Tranche d'âge: ${label}`}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid rgba(102, 209, 201, 0.2)',
                                    borderRadius: '8px',
                                    boxShadow: 'var(--pasq-shadow-md)',
                                    fontFamily: 'Source Sans Pro, sans-serif'
                                }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {safeArrayAccess(stats.parAge).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getPasqBarColors(safeArrayAccess(stats.parAge).length)[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Répartition par genre */}
            <div className="pasq-chart-box pasq-hover-lift">
                <h2 className="pasq-h2 mb-4">
                    Répartition par genre
                </h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={safeArrayAccess(stats.parGenre)}
                                cx="50%"
                                cy="45%"
                                labelLine={false}
                                outerRadius={90}
                                innerRadius={30}
                                fill="#33C7B6"
                                dataKey="value"
                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            >
                                {safeArrayAccess(stats.parGenre).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => [`${value} usagers`, 'Nombre']}
                                labelFormatter={(label) => `Genre: ${label}`}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid rgba(0, 180, 167, 0.2)',
                                    borderRadius: '8px',
                                    boxShadow: 'var(--pasq-shadow-md)',
                                    fontFamily: 'Source Sans Pro, sans-serif'
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ fontSize: '16px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Répartition par secteur */}
            <div className="pasq-chart-box pasq-hover-lift">
                <h2 className="pasq-h2 mb-4">
                    Répartition par secteur
                </h2>
                <div style={{ height: `${Math.max(450, stats.parSecteur.length * 40)}px` }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={safeArrayAccess(stats.parSecteur)}
                            margin={{ top: 20, right: 30, left: 160, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                            <XAxis
                                type="number"
                                tick={{ fill: '#6B7280', fontSize: 11 }}
                                stroke="#e5e7eb"
                                tickLine={false}
                                axisLine={false}
                            />
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
                                labelFormatter={(label) => `Secteur: ${label}`}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid rgba(0, 180, 167, 0.2)',
                                    borderRadius: '8px',
                                    boxShadow: 'var(--pasq-shadow-md)',
                                    fontFamily: 'Source Sans Pro, sans-serif'
                                }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {safeArrayAccess(stats.parSecteur).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getPasqBarColors(safeArrayAccess(stats.parSecteur).length)[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Répartition par problématique */}
            <div className="pasq-chart-box lg:col-span-2 pasq-hover-lift">
                <h2 className="pasq-h2 mb-4">
                    Répartition par problématique (filtrée)
                </h2>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={safeArrayAccess(stats.parProblematique).slice(0, 10)}
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
                            <YAxis
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                stroke="#e5e7eb"
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                formatter={(value) => [`${value} occurrences`, 'Nombre']}
                                labelFormatter={(label) => `Problématique: ${label}`}
                                contentStyle={{
                                    backgroundColor: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: 'var(--pasq-shadow-md)',
                                    fontFamily: 'Source Sans Pro, sans-serif',
                                    maxWidth: '300px'
                                }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {safeArrayAccess(stats.parProblematique).slice(0, 10).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getPasqBarColors(Math.min(10, safeArrayAccess(stats.parProblematique).length))[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {safeArrayAccess(stats.parProblematique).length > 10 && (
                    <p className="text-base text-gray-600 mt-2 text-center font-medium">
                        Affichage des 10 problématiques les plus fréquentes sur {stats.parProblematique.length} au total
                    </p>
                )}
            </div>
        </div>
    );
};

export default DashboardCharts;
