/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Dashboard Skeleton Loader
Extracted from DashboardLayout.tsx
*/

import React from 'react';

export const DashboardSkeleton: React.FC = () => (
    <div className="dashboard-container">
        <div className="dashboard-header">
            <div className="skeleton skeleton--title" />
            <div className="flex gap-3">
                <div className="skeleton" style={{ width: 100, height: 36 }} />
                <div className="skeleton" style={{ width: 36, height: 36 }} />
            </div>
        </div>

        <div className="dashboard-grid">
            {/* KPI Skeletons */}
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="widget-card widget-card--small">
                    <div className="kpi-card">
                        <div className="skeleton skeleton--text" />
                        <div className="skeleton" style={{ height: 48, width: '60%', marginTop: 12 }} />
                        <div className="skeleton skeleton--text" style={{ width: '40%', marginTop: 12 }} />
                    </div>
                </div>
            ))}

            {/* Chart Skeletons */}
            <div className="widget-card widget-card--full">
                <div className="widget-header">
                    <div className="skeleton skeleton--text" />
                </div>
                <div className="widget-content">
                    <div className="skeleton skeleton--chart" />
                </div>
            </div>
        </div>
    </div>
);
