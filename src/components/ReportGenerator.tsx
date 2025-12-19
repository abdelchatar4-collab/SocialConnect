/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  MapPinIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

import {
  PieChartWidget,
  BarChartWidget
} from '@/features/dashboard/widgets';

import ReportAiAssistant from '@/components/ai/ReportAiAssistant';

// Types pour les modules dynamiques
let html2canvas: any = null;
let jsPDF: any = null;

export default function ReportGenerator({ users }: { users: any[] }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [modulesLoaded, setModulesLoaded] = useState(false);
  const [reportContent, setReportContent] = useState(`RAPPORT DE GESTION\nDate: ${new Date().toLocaleDateString('fr-FR')}\n\n1. CONTEXTE\n\n\n2. ANALYSE STATISTIQUE\n\n\n3. CONCLUSIONS\n`);

  // Charger les modules dynamiquement côté client
  useEffect(() => {
    const loadModules = async () => {
      try {
        if (typeof window !== 'undefined') {
          const [html2canvasModule, jsPDFModule] = await Promise.all([
            import('html2canvas'),
            import('jspdf')
          ]);

          html2canvas = html2canvasModule.default;
          jsPDF = jsPDFModule.jsPDF;
          setModulesLoaded(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des modules:', error);
      }
    };

    loadModules();
  }, []);

  // Fonction pour générer le PDF (simplifiée pour éviter les erreurs)
  const generatePDF = async () => {
    if (!modulesLoaded) {
      alert('Les modules de génération PDF ne sont pas encore chargés. Veuillez réessayer dans un moment.');
      return;
    }

    setIsGenerating(true);

    try {
      // Pour l'instant, on génère juste un PDF simple
      const doc = new jsPDF();
      doc.text('Rapport de Gestion des Usagers', 20, 20);
      doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 30);
      doc.text(`Nombre total d'usagers: ${users.length}`, 20, 40);

      doc.save('rapport-usagers.pdf');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  // Fonction d'impression
  const handlePrint = () => {
    window.print();
  };

  // Calcul des données pour les graphiques
  const statusData = React.useMemo(() => {
    const stats: Record<string, number> = {};
    users.forEach(u => {
      const status = u.etat || 'Inconnu';
      stats[status] = (stats[status] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [users]);

  const antennaData = React.useMemo(() => {
    const stats: Record<string, number> = {};
    users.forEach(u => {
      const antenna = u.antenne || 'Non assignée';
      stats[antenna] = (stats[antenna] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [users]);

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* LEFT COLUMN: Canvas / Editor */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <DocumentArrowDownIcon className="w-5 h-5 mr-2 text-blue-500" />
            Éditeur de Rapport
          </h3>
          <div className="flex space-x-2">

            <button
              onClick={generatePDF}
              disabled={isGenerating || !modulesLoaded}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white font-medium rounded-md hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? '...' : <><PrinterIcon className="w-4 h-4 mr-1" /> PDF</>}
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-6 overflow-auto bg-white relative">
          <textarea
            className="w-full h-full p-4 resize-none focus:outline-none text-gray-800 leading-relaxed font-mono text-sm"
            placeholder="Commencez à rédiger votre rapport ici..."
            value={reportContent}
            onChange={(e) => setReportContent(e.target.value)}
          />
        </div>
      </div>

      {/* RIGHT COLUMN: Data Source (Stats & Charts) */}
      <div className="w-[400px] flex flex-col bg-gray-50/50 rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-teal-600" />
            Données & Statistiques
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* AI Report Assistant */}
          <ReportAiAssistant
            users={users}
            reportContent={reportContent}
            onInsertText={(text) => setReportContent(prev => prev + text)}
            onReplaceText={(text) => setReportContent(text)}
          />

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-blue-100 bg-blue-600 rounded-lg p-1.5" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Total Usagers</p>
                  <p className="text-lg font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center">
                <ClipboardDocumentCheckIcon className="h-8 w-8 text-green-100 bg-green-600 rounded-lg p-1.5" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Dossiers Actifs</p>
                  <p className="text-lg font-bold text-gray-900">{users.filter(u => u.etat === 'Actif').length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center">
                <CalendarDaysIcon className="h-8 w-8 text-purple-100 bg-purple-600 rounded-lg p-1.5" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500">Nouveaux (Ce mois)</p>
                  <p className="text-lg font-bold text-gray-900">
                    {users.filter(u => {
                      if (!u.dateOuverture) return false;
                      const date = new Date(u.dateOuverture);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Répartition par Statut</h4>
            <div className="h-48">
              {/* @ts-ignore */}
              <PieChartWidget data={statusData} height={180} showLabels={false} />
            </div>
          </div>
        </div>
      </div>

      {
        !modulesLoaded && (
          <div className="fixed bottom-4 right-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg z-50">
            <p className="text-sm text-yellow-800 flex items-center">
              <span className="animate-spin mr-2">↻</span>
              Chargement des modules PDF...
            </p>
          </div>
        )
      }
    </div >
  );
}
