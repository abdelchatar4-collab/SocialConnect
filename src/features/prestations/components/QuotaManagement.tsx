
import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui';

interface QuotaData {
    gestionnaireId: string;
    gestionnaireName: string;
    vacancesAnnuelles: number; // Minutes
    heuresSupplementaires: number; // Minutes
    creditHeures: number; // Minutes
    // Champs fixes (informatifs ou modifiables si besoin)
    consultationMedicale: number;
    forceMajeure: number;
    congesReglementaires: number;
}

// Composant interne pour la saisie de durée (Heures : Minutes) sans limite de 24h
const DurationInput = ({ minutes, onChange }: { minutes: number, onChange: (val: number) => void }) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return (
        <div className="flex items-center gap-1">
            <input
                type="number"
                min="0"
                className="border border-gray-300 rounded-lg px-3 py-2 w-24 text-center font-mono text-lg font-bold"
                value={h}
                onFocus={(e) => e.target.select()}
                onChange={e => {
                    const newH = Math.max(0, parseInt(e.target.value) || 0);
                    onChange(newH * 60 + m);
                }}
                placeholder="HH"
            />
            <span className="text-gray-500 font-bold">:</span>
            <input
                type="number"
                min="0"
                max="59"
                className="border border-gray-300 rounded-lg px-3 py-2 w-20 text-center font-mono text-lg font-bold"
                value={m.toString().padStart(2, '0')}
                onFocus={(e) => e.target.select()}
                onChange={e => {
                    let newM = parseInt(e.target.value) || 0;
                    if (newM > 59) newM = 59; // Cap minutes
                    if (newM < 0) newM = 0;
                    onChange(h * 60 + newM);
                }}
                placeholder="MM"
            />
        </div>
    )
}

export const QuotaManagement: React.FC = () => {
    const { primaryColor } = useAdmin();
    // On va récupérer la liste des gestionnaires via une API dédiée ou existante
    const [gestionnaires, setGestionnaires] = useState<any[]>([]);
    const [quotas, setQuotas] = useState<Record<string, QuotaData>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Fonction utilitaire pour convertir HH:MM en minutes
    const timeToMinutes = (time: string): number => {
        if (!time) return 0;
        const [h, m] = time.split(':').map(Number);
        return (h * 60) + m;
    };

    // Fonction utilitaire pour convertir minutes en HH:MM
    const minutesToTime = (minutes: number): string => {
        if (isNaN(minutes)) return "00:00";
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Récupérer les gestionnaires
            const resGest = await fetch('/api/gestionnaires'); // Assumons que cette route existe
            const gestData = await resGest.json();
            setGestionnaires(gestData);

            // 2. Récupérer les soldes existants pour 2026 pour tous
            // On pourrait faire un appel par gestionnaire, ou une route bulk.
            // Pour simplifier ici, on va itérer (pas optimal mais ok pour < 50 users)
            const newQuotas: Record<string, QuotaData> = {};

            await Promise.all(gestData.map(async (g: any) => {
                const resSolde = await fetch(`/api/prestations/soldes?annee=2026&gestionnaireId=${g.id}`);
                const data = await resSolde.json();

                // Valeurs par défaut si pas de solde (Quota standard)
                const solde = data.quotas || {};

                newQuotas[g.id] = {
                    gestionnaireId: g.id,
                    gestionnaireName: `${g.prenom} ${g.nom || ''}`,
                    vacancesAnnuelles: solde.vacancesAnnuelles || 0,
                    creditHeures: solde.creditHeures || 4500, // 75h par défaut
                    heuresSupplementaires: solde.heuresSupplementaires || 0,
                    consultationMedicale: solde.consultationMedicale || 240, // 4h
                    forceMajeure: solde.forceMajeure || 2250, // 37h30
                    congesReglementaires: solde.congesReglementaires || 900, // 15h
                };
            }));

            setQuotas(newQuotas);

        } catch (error) {
            console.error(error);
            setNotification({ type: 'error', text: "Erreur lors du chargement des données" });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (gId: string) => {
        setSaving(gId);
        setNotification(null);
        const q = quotas[gId];
        try {
            const res = await fetch('/api/prestations/soldes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    annee: 2026,
                    ...q
                })
            });

            if (res.ok) {
                setNotification({ type: 'success', text: `Quotas mis à jour pour ${q.gestionnaireName}` });
            } else {
                setNotification({ type: 'error', text: "Erreur lors de la sauvegarde" });
            }
        } catch (e) {
            setNotification({ type: 'error', text: "Erreur réseau" });
        } finally {
            setSaving(null);
        }
    };

    const handleQuotaChange = (gId: string, field: keyof QuotaData, minutes: number) => {
        setQuotas(prev => ({
            ...prev,
            [gId]: {
                ...prev[gId],
                [field]: minutes
            }
        }));
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement des quotas...</div>;

    return (
        <div className="space-y-6">
            {notification && (
                <div className={`p-4 rounded-xl font-medium ${notification.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                    {notification.text}
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-800 mb-6">
                ℹ️ Les quotas "Consultation Médicale" (04:00), "Force Majeure" (37:30) et "Congés Règlementaires" (15:00) sont initialisés par défaut. Vous pouvez ajuster les variables (VA, Crédit Heures, HS) ci-dessous.
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                            <th className="p-4">Collaborateur</th>
                            <th className="p-4">Vacances Annuelles</th>
                            <th className="p-4">Crédit Heures</th>
                            <th className="p-4">Heures Sup. (Stock)</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {gestionnaires.map(g => {
                            const q = quotas[g.id];
                            if (!q) return null;

                            return (
                                <tr key={g.id} className="hover:bg-gray-50/50">
                                    <td className="p-4 font-medium text-gray-900">
                                        {q.gestionnaireName}
                                    </td>
                                    <td className="p-4">
                                        <DurationInput
                                            minutes={q.vacancesAnnuelles}
                                            onChange={(val) => handleQuotaChange(g.id, 'vacancesAnnuelles', val)}
                                        />
                                        <div className="text-xs text-gray-400 mt-1 ml-1">{minutesToTime(q.vacancesAnnuelles)}</div>
                                    </td>
                                    <td className="p-4">
                                        <DurationInput
                                            minutes={q.creditHeures}
                                            onChange={(val) => handleQuotaChange(g.id, 'creditHeures', val)}
                                        />
                                        <div className="text-xs text-gray-400 mt-1 ml-1">{minutesToTime(q.creditHeures)}</div>
                                    </td>
                                    <td className="p-4">
                                        <DurationInput
                                            minutes={q.heuresSupplementaires}
                                            onChange={(val) => handleQuotaChange(g.id, 'heuresSupplementaires', val)}
                                        />
                                        <div className="text-xs text-gray-400 mt-1 ml-1">{minutesToTime(q.heuresSupplementaires)}</div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button
                                            size="sm"
                                            onClick={() => handleSave(g.id)}
                                            disabled={saving === g.id}
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            {saving === g.id ? '...' : 'Enregistrer'}
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
