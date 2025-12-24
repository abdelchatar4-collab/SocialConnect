import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useSession } from 'next-auth/react';
import { formatDurationHuman } from '@/utils/prestationUtils';
import { usePrestations } from '@/contexts/PrestationContext';

import { SunIcon, ClockIcon, HeartIcon, PlusCircleIcon, BoltIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline'; // Add ChartBarIcon
interface SoldeData {
    quotas: {
        vacancesAnnuelles: number;
        consultationMedicale: number;
        forceMajeure: number;
        congesReglementaires: number;
        creditHeures: number;
        heuresSupplementaires?: number;
    };
    consomme: {
        vacancesAnnuelles: number;
        consultationMedicale: number;
        forceMajeure: number;
        congesReglementaires: number;
        creditHeures: number;
    };
    restant: {
        vacancesAnnuelles: number;
        consultationMedicale: number;
        forceMajeure: number;
        congesReglementaires: number;
        creditHeures: number;
        heuresSupplementaires?: number;
    };
}

export const SoldeCongeDisplay: React.FC = () => {
    const { data: session } = useSession();
    const { prestations } = usePrestations(); // Listen to changes
    const [data, setData] = useState<SoldeData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.gestionnaire?.id) {
            setLoading(true);
            fetch(`/api/prestations/soldes?annee=2026`)
                .then(res => res.json())
                .then(setData)
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [session, prestations]); // Re-fetch when prestations change

    if (loading) return <div className="animate-pulse h-40 bg-gray-100 rounded-xl"></div>;
    if (!data) return null;



    // ... inside component ...

    const Gauge = ({ label, total, used, colorFrom, colorTo, Icon, bgClass }: { label: string, total: number, used: number, colorFrom: string, colorTo: string, Icon: React.ElementType, bgClass: string }) => {
        const remaining = total - used;
        const percentage = total > 0 ? Math.min(100, (used / total) * 100) : 0;

        return (
            <div className={`mb-6 last:mb-0 rounded-xl p-3 border border-gray-100/50 hover:border-gray-200 transition-all shadow-sm hover:shadow-md group ${bgClass}`}>
                <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-gray-800 flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors text-primary-600">
                            <Icon className="w-5 h-5" />
                        </span>
                        {label}
                    </span>
                    <div className="text-right text-xs text-gray-500">
                        <span className="block mb-0.5">Quota : <strong>{formatDurationHuman(total)}</strong></span>
                        <span className={`block px-2 py-0.5 rounded-md ${remaining < 0 ? 'bg-red-100 text-red-700 font-bold' : 'bg-gray-100 text-gray-700'}`}>
                            Restant : <strong>{formatDurationHuman(remaining)}</strong>
                        </span>
                    </div>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner relative ring-1 ring-black/5">
                    <div
                        className={`h-full rounded-full bg-gradient-to-r ${colorFrom} ${colorTo} shadow-lg relative overflow-hidden transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-[pulse_3s_infinite]" />
                    </div>
                </div>
                <div className="flex justify-between items-center mt-1.5">
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Consommation</span>
                    <span className={`text-xs font-bold ${percentage > 90 ? 'text-red-500' : 'text-gray-500'}`}>
                        {formatDurationHuman(used)} ({Math.round(percentage)}%)
                    </span>
                </div>
            </div>
        );
    };

    return (
        <Card className="p-6 bg-gradient-to-br from-white to-gray-50/50">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <ChartBarIcon className="w-6 h-6" />
                    </span>
                    <div>
                        <span className="block">Soldes & Compteurs 2026</span>
                        <span className="text-xs font-normal text-gray-500 block">Suivi de votre consommation annuelle</span>
                    </div>
                </h3>
                <div className="text-xs font-medium px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                    Année 2026
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <div>
                    <Gauge
                        label="Vacances Annuelles"
                        total={data.quotas.vacancesAnnuelles}
                        used={data.consomme.vacancesAnnuelles}
                        colorFrom="from-emerald-400"
                        colorTo="to-emerald-600"
                        Icon={SunIcon}
                        bgClass="bg-emerald-50/50 hover:bg-emerald-50"
                    />

                    <Gauge
                        label="Crédit d'Heures"
                        total={data.quotas.creditHeures}
                        used={data.consomme.creditHeures}
                        colorFrom="from-blue-400"
                        colorTo="to-blue-600"
                        Icon={ClockIcon}
                        bgClass="bg-blue-50/50 hover:bg-blue-50"
                    />

                    {(data.quotas.heuresSupplementaires || 0) > 0 && (
                        <Gauge
                            label="Heures Supplémentaires (Stock)"
                            total={data.quotas.heuresSupplementaires || 0}
                            used={0}
                            colorFrom="from-rose-400"
                            colorTo="to-rose-600"
                            Icon={PlusCircleIcon}
                            bgClass="bg-rose-50/50 hover:bg-rose-50"
                        />
                    )}
                </div>

                <div>
                    <Gauge
                        label="Force Majeure"
                        total={data.quotas.forceMajeure}
                        used={data.consomme.forceMajeure}
                        colorFrom="from-amber-400"
                        colorTo="to-amber-600"
                        Icon={BoltIcon}
                        bgClass="bg-amber-50/50 hover:bg-amber-50"
                    />
                    <Gauge
                        label="Consultation Médicale"
                        total={data.quotas.consultationMedicale}
                        used={data.consomme.consultationMedicale}
                        colorFrom="from-purple-400"
                        colorTo="to-purple-600"
                        Icon={HeartIcon}
                        bgClass="bg-purple-50/50 hover:bg-purple-50"
                    />
                    <Gauge
                        label="Congés Réglementaires"
                        total={data.quotas.congesReglementaires}
                        used={data.consomme.congesReglementaires}
                        colorFrom="from-cyan-400"
                        colorTo="to-cyan-600"
                        Icon={DocumentTextIcon}
                        bgClass="bg-cyan-50/50 hover:bg-cyan-50"
                    />
                </div>
            </div>
        </Card>
    );
};
