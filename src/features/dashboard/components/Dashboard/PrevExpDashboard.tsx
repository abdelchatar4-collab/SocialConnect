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
import { PrevExpStats } from '../../types/dashboard';
import { getPasqBarColors } from '../../utils/dashboardUtils';
import { getGestionnaireDisplayName } from '../../utils/dashboardCalculations';
import { Gestionnaire } from '@/types';
import { RECHARTS_COLORS } from '../../constants/pasqTheme';

interface PrevExpDashboardProps {
    prevExpStats: PrevExpStats;
    urgentActions: any[];
    gestionnaires: Gestionnaire[];
}

const COLORS = RECHARTS_COLORS;

const PrevExpDashboard: React.FC<PrevExpDashboardProps> = ({
    prevExpStats,
    urgentActions,
    gestionnaires
}) => {
    const getDisplayName = (id: string | null | undefined) => getGestionnaireDisplayName(id, gestionnaires);

    return (
        <div className="pasq-glass-box mb-8 pasq-hover-lift" style={{ borderTop: '4px solid #008C7A', boxShadow: 'var(--pasq-shadow-lg)' }}>
            <h2 className="pasq-h2 mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <span className="mr-2 text-3xl">🏠</span>
                    <div className="flex flex-col">
                        <span className="leading-tight text-[#008C7A]">Analyse Prévention Expulsion</span>
                        <span className="text-base font-normal text-[#009F8D] mt-1">Suivi des procédures et du maintien dans le logement</span>
                    </div>
                </div>
                <span className="px-4 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                    {prevExpStats.totalPrevExp} dossiers suivis
                </span>
            </h2>

            {/* Table Actions Requises */}
            {urgentActions.length > 0 && (
                <div className="mb-8 overflow-hidden rounded-xl shadow-sm pasq-glass-box" style={{ border: '1px solid rgba(0, 180, 167, 0.2)' }}>
                    <div className="pasq-table-header px-6 py-4 border-b flex items-center justify-between">
                        <h3 className="font-bold flex items-center" style={{ color: '#008C7A' }}>
                            <span className="mr-2">🚨</span>
                            Actions Requises (Top 5 Urgences)
                        </h3>
                        <span className="pasq-badge">Priorité Haute</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y" style={{ borderColor: 'rgba(0, 180, 167, 0.1)' }}>
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usager</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dossier Ouvert ?</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Expulsion</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gestionnaire</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-red-50">
                                {urgentActions.map((action) => (
                                    <tr key={action.id} className="pasq-table-row">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{action.nom} {action.prenom}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {action.dossierOuvert === 'OUI' ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">OUI</span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">NON</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {action.dateExpulsion ? (
                                                <span className="font-bold text-red-600">
                                                    {new Date(action.dateExpulsion).toLocaleDateString('fr-FR')}
                                                </span>
                                            ) : <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {getDisplayName(typeof action.gestionnaire === 'string' ? action.gestionnaire : action.gestionnaire?.id)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <a href={`/users/${action.id}/edit`} className="text-indigo-600 hover:text-indigo-900 font-bold">Gérer →</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="pasq-stat-card pasq-animate-in">
                    <h4 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#008C7A' }}>Dossiers Ouverts</h4>
                    <div className="flex items-center justify-center">
                        <span className="pasq-stat-number">{prevExpStats.dossiersOuvertsCount}</span>
                    </div>
                    <p className="pasq-stat-label">actifs</p>
                </div>
                <div className="pasq-stat-card pasq-animate-in" style={{ animationDelay: '0.1s' }}>
                    <h4 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#00B4A7' }}>Expulsions Évitées</h4>
                    <div className="flex items-center justify-center">
                        <span className="pasq-stat-number">{prevExpStats.expulsionsEviteesCount}</span>
                    </div>
                    <p className="pasq-stat-label">familles</p>
                </div>
                <div className="pasq-stat-card pasq-animate-in" style={{ animationDelay: '0.2s' }}>
                    <h4 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#009F8D' }}>Taux de Maintien</h4>
                    <div className="flex items-center justify-center">
                        <span className="pasq-stat-number">{prevExpStats.tauxMaintien.toFixed(0)}%</span>
                    </div>
                    <p className="pasq-stat-label">réussite</p>
                </div>
                <div className="pasq-stat-card pasq-animate-in" style={{ animationDelay: '0.3s' }}>
                    <h4 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: '#008C7A' }}>Expulsions à venir</h4>
                    <div className="flex items-center justify-center">
                        <span className="pasq-stat-number">{prevExpStats.funnelStats.expulsionFuture}</span>
                    </div>
                    <p className="pasq-stat-label">dossiers</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Motifs d'Expulsion Principaux */}
                <div className="pasq-chart-box">
                    <h3 className="pasq-h3 mb-4 flex items-center">
                        <span className="mr-2">📋</span>
                        Motifs d&apos;Expulsion Principaux
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={prevExpStats.motifsData} margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fill: '#4B5563' }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} cursor={{ fill: '#F3F4F6' }} />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                                    {prevExpStats.motifsData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={getPasqBarColors(prevExpStats.motifsData.length)[index]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Calendrier des Expulsions */}
                <div className="pasq-chart-box">
                    <h3 className="pasq-h3 mb-4 flex items-center">
                        <span className="mr-2">📅</span>
                        Calendrier des Expulsions (3 mois)
                    </h3>
                    <div className="h-72">
                        {prevExpStats.expulsionTimeline.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={prevExpStats.expulsionTimeline}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip
                                        labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        formatter={(value: number) => [`${value} expulsion(s)`, 'Nombre']}
                                    />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                        {prevExpStats.expulsionTimeline.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={getPasqBarColors(prevExpStats.expulsionTimeline.length)[index]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 italic">Aucune expulsion prévue</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Issue des Dossiers */}
                <div className="pasq-chart-box lg:col-span-1">
                    <h3 className="pasq-h3 mb-4 text-center !mt-0">Issue des Dossiers</h3>
                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={prevExpStats.solutionData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                                    {prevExpStats.solutionData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.group === 'positive' ? '#34D399' : entry.group === 'negative' ? '#F87171' : '#FBBF24'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Entonnoir Juridique */}
                <div className="pasq-chart-box lg:col-span-2">
                    <h3 className="pasq-h3 mb-4 !mt-0">Entonnoir Juridique</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Audience Passée', value: prevExpStats.funnelStats.audiencePassed, color: 'indigo' },
                            { label: 'Jugement Rendu', value: prevExpStats.funnelStats.jugementPassed, color: 'purple' }
                        ].map((item, idx) => (
                            <div key={idx} className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div><span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-${item.color}-600 bg-${item.color}-100`}>{item.label}</span></div>
                                    <div className="text-right"><span className={`text-xs font-semibold inline-block text-${item.color}-600`}>{item.value} dossiers</span></div>
                                </div>
                                <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded bg-${item.color}-100`}>
                                    <div style={{ width: `${(item.value / prevExpStats.totalPrevExp) * 100}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-${item.color}-500`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Profil du Public */}
            <div className="pasq-glass-box mt-8" style={{ borderTop: '4px solid #8B5CF6' }}>
                <h3 className="pasq-h2 mb-6 flex items-center"><span className="mr-2">👥</span>Profil du Public Concerné</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="pasq-chart-box">
                        <h4 className="text-sm font-bold text-purple-800 mb-3 text-center">Répartition par Âge</h4>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={prevExpStats.profilPublic.parAge} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                                        {prevExpStats.profilPublic.parAge.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="pasq-chart-box">
                        <h4 className="text-sm font-bold text-purple-800 mb-3 text-center">Répartition par Genre</h4>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={prevExpStats.profilPublic.parGenre}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {prevExpStats.profilPublic.parGenre.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={getPasqBarColors(prevExpStats.profilPublic.parGenre.length)[index]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrevExpDashboard;
