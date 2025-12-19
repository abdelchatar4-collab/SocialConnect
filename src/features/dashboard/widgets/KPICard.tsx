/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * KPICard - Reusable KPI display component with animated counter
 */

"use client";

import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KPIData } from '../types/modernDashboard';

interface KPICardProps {
    data: KPIData;
    icon?: React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({ data, icon }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const countRef = useRef<number>(0);
    const animationRef = useRef<number | null>(null);

    // Animated counter effect
    useEffect(() => {
        const target = data.value;
        const duration = 1000; // 1 second
        const startTime = performance.now();
        const startValue = countRef.current;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (easeOutExpo)
            const easeProgress = 1 - Math.pow(2, -10 * progress);
            const current = Math.round(startValue + (target - startValue) * easeProgress);

            setDisplayValue(current);
            countRef.current = current;

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [data.value]);

    const getTrendIcon = () => {
        if (!data.trend) return null;

        switch (data.trend.direction) {
            case 'up':
                return <TrendingUp className="w-3 h-3" />;
            case 'down':
                return <TrendingDown className="w-3 h-3" />;
            default:
                return <Minus className="w-3 h-3" />;
        }
    };

    const getTrendClass = () => {
        if (!data.trend) return '';

        switch (data.trend.direction) {
            case 'up':
                return 'kpi-trend--up';
            case 'down':
                return 'kpi-trend--down';
            default:
                return 'kpi-trend--stable';
        }
    };

    return (
        <div className="kpi-card">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {data.label}
                </span>
                {icon && (
                    <span
                        className="text-2xl opacity-80"
                        style={{ color: data.color }}
                    >
                        {icon}
                    </span>
                )}
            </div>

            <div
                className="kpi-value animate-countUp"
                style={{ color: data.color }}
            >
                {displayValue.toLocaleString('fr-FR')}
            </div>

            {data.trend && (
                <div className={`kpi-trend ${getTrendClass()}`}>
                    {getTrendIcon()}
                    <span>
                        {data.trend.direction === 'up' ? '+' : ''}{data.trend.value}
                        {typeof data.trend.value === 'number' && data.trend.value > 1 ? '%' : ''}
                    </span>
                    <span className="opacity-70">{data.trend.period}</span>
                </div>
            )}
        </div>
    );
};

export default KPICard;
