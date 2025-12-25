'use client';

import React from 'react';

interface PrintLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ children, title }) => {
    return (
        <div className="print-layout min-h-screen bg-gray-100 print:bg-white p-8 print:p-0 font-sans">
            <style jsx global>{`
        @media print {
            @page {
                size: A4;
                margin: 0;
            }
            body {
                background: white;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .no-print {
                display: none !important;
            }
            .print-content {
                width: 100% !important;
                margin: 0 !important;
                padding: 15mm !important; /* Marge interne pour l'impression */
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
            }
            /* Assurer que les textes sont bien noirs */
            p, h1, h2, h3, h4, li, span {
                color: black !important;
            }
        }

        .print-content {
            width: 210mm;
            min-height: 297mm;
            background: white;
            padding: 20mm;
            margin: auto;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            position: relative;
        }
      `}</style>

            {/* Control Bar (No Print) */}
            <div className="no-print fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm z-50">
                <div className="flex items-center">
                    <div className="mr-4 p-2 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">{title || 'Aperçu du document'}</h1>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.close()}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium transition-colors"
                        title="Fermer l'aperçu"
                    >
                        Fermer
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md hover:shadow-lg flex items-center font-bold transition-all transform hover:-translate-y-0.5"
                        title="Imprimer ou Enregistrer en PDF"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Imprimer / PDF
                    </button>
                </div>
            </div>

            {/* Spacer for fixed header */}
            <div className="h-20 no-print"></div>

            {/* A4 Content Preview Wrapper */}
            <div className="flex justify-center pb-20 no-print-padding">
                <div className="print-content text-left text-black">
                    {children}
                </div>
            </div>
        </div>
    );
};
