/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React, { useState } from 'react';
import { getTruncatedSummary } from '../../utils/dashboardUtils';

interface DashboardHeaderProps {
    fullSummary: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ fullSummary }) => {
    const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);

    const { text: displayText, isTruncated } = isAnalysisExpanded
        ? { text: fullSummary, isTruncated: false }
        : getTruncatedSummary(fullSummary, 300);

    return (
        <div className="pasq-glass-box mb-8" style={{ background: 'var(--pasq-gradient-soft)', border: '1px solid rgba(102, 209, 201, 0.2)' }}>
            <h3 className="pasq-h2 flex items-center">
                <span className="mr-3">📈</span>
                Synthèse analytique
            </h3>
            <div className="pasq-body-text max-w-none">
                <div dangerouslySetInnerHTML={{
                    __html: displayText.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }} />
                {(isTruncated || isAnalysisExpanded) && (
                    <>
                        {!isAnalysisExpanded && <span>...</span>}
                        <button
                            onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                            className="ml-2 inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        >
                            {isAnalysisExpanded ? (
                                <>
                                    <span>Voir moins</span>
                                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                </>
                            ) : (
                                <>
                                    <span>Voir plus</span>
                                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default DashboardHeader;
