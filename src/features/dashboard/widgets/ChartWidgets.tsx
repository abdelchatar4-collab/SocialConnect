/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Chart Widgets - Reusable chart components for dashboard
 */

"use client";

import React from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';

// Color palette for charts (PASQ theme)
export const CHART_COLORS = [
    '#008C7A', // Primary teal
    '#00B4A7', // Light teal
    '#33C7B6', // Lighter teal
    '#22D3EE', // Cyan
    '#0EA5E9', // Blue
    '#6366F1', // Indigo
    '#A855F7', // Purple
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#10B981', // Green
];

// Common chart configuration
const tooltipStyle = {
    backgroundColor: 'white',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    fontSize: '12px',
};

// ============ Line Chart Widget ============
interface LineChartWidgetProps {
    data: { name: string; value: number }[];
    dataKey?: string;
    color?: string;
    height?: number;
    showGrid?: boolean;
    showArea?: boolean;
}

export const LineChartWidget: React.FC<LineChartWidgetProps> = ({
    data,
    dataKey = 'value',
    color = '#008C7A',
    height = 300,
    showGrid = true,
    showArea = true,
}) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                {showGrid && (
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                )}
                <XAxis
                    dataKey="name"
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    stroke="#E5E7EB"
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    stroke="#E5E7EB"
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={3}
                    fill={showArea ? "url(#lineGradient)" : "none"}
                    dot={{ fill: color, stroke: '#ffffff', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#00B4A7', stroke: '#ffffff', strokeWidth: 2 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

// ============ Bar Chart Widget ============
interface BarChartWidgetProps {
    data: { name: string; value: number }[];
    layout?: 'horizontal' | 'vertical';
    height?: number;
    showGradient?: boolean;
}

export const BarChartWidget: React.FC<BarChartWidgetProps> = ({
    data,
    layout = 'horizontal',
    height = 300,
    showGradient = true,
}) => {
    const isVertical = layout === 'vertical';

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                data={data}
                layout={isVertical ? 'vertical' : 'horizontal'}
                margin={{
                    top: 20,
                    right: 30,
                    left: isVertical ? 100 : 20,
                    bottom: isVertical ? 20 : 60
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                {isVertical ? (
                    <>
                        <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={90}
                            tick={{ fill: '#4B5563', fontSize: 12 }}
                        />
                    </>
                ) : (
                    <>
                        <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            tick={{ fill: '#6B7280', fontSize: 11 }}
                        />
                        <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                    </>
                )}
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                    dataKey="value"
                    radius={isVertical ? [0, 6, 6, 0] : [6, 6, 0, 0]}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={showGradient ? CHART_COLORS[index % CHART_COLORS.length] : '#008C7A'}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

// ============ Pie Chart Widget ============
interface PieChartWidgetProps {
    data: { name: string; value: number }[];
    height?: number;
    innerRadius?: number;
    showLabels?: boolean;
}

export const PieChartWidget: React.FC<PieChartWidgetProps> = ({
    data,
    height = 300,
    innerRadius = 40,
    showLabels = true,
}) => {
    // Custom legend formatter to show name and value
    const renderLegend = (value: string, entry: { payload?: { value?: number } }) => {
        const itemValue = entry.payload?.value || 0;
        return (
            <span style={{ color: '#374151', fontSize: '13px', fontWeight: 500 }}>
                {value} ({itemValue})
            </span>
        );
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie
                    data={data}
                    cx="40%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={showLabels ? ({ percent }) => `${(percent * 100).toFixed(0)}%` : false}
                    labelLine={showLabels}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => [`${value} usagers`, '']}
                />
                <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{
                        paddingLeft: '20px',
                        fontSize: '13px',
                        lineHeight: '24px'
                    }}
                    formatter={renderLegend}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default { LineChartWidget, BarChartWidget, PieChartWidget };
