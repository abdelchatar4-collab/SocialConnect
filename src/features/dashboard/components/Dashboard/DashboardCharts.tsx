/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { DashboardStats } from '../../types/dashboard';
import { RECHARTS_COLORS } from '../../constants/pasqTheme';

// Sub-components
import { EvolutionChart } from './Charts/EvolutionChart';
import { DemographicCharts } from './Charts/DemographicCharts';
import { StaffAndAgeCharts } from './Charts/StaffAndAgeCharts';
import { SectorAndProblemCharts } from './Charts/SectorAndProblemCharts';

interface DashboardChartsProps {
    stats: DashboardStats;
}

const COLORS = RECHARTS_COLORS;

const DashboardCharts: React.FC<DashboardChartsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <EvolutionChart data={stats.actionTimelineData} />

            <DemographicCharts
                parAntenne={stats.parAntenne}
                parGenre={stats.parGenre}
                colors={COLORS}
            />

            <StaffAndAgeCharts
                gestionnaireData={stats.gestionnaireData}
                parAge={stats.parAge}
            />

            <SectorAndProblemCharts
                parSecteur={stats.parSecteur}
                parProblematique={stats.parProblematique}
            />
        </div>
    );
};

export default DashboardCharts;
