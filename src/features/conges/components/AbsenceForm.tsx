'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function AbsenceForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        type: 'Vacances',
        reason: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const res = await fetch('/api/conges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.details || errorData.error || 'Erreur lors de la création');
            }

            setSuccess(true);
            setFormData({
                startDate: format(new Date(), 'yyyy-MM-dd'),
                endDate: format(new Date(), 'yyyy-MM-dd'),
                type: 'Vacances',
                reason: '',
            });
            router.refresh(); // Refresh to show in list if present

            // Auto-hide success message
            setTimeout(() => setSuccess(false), 5000);

        } catch (error: any) {
            console.error(error);
            alert(`Erreur : ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span>📅</span> Encoder une absence
                </h2>
                <p className="text-sm text-gray-500">
                    Remplissez ce formulaire pour notifier l'équipe. Un email sera envoyé automatiquement.
                </p>
            </div>

            {success && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <strong>Absence enregistrée et email envoyé !</strong>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                        <input
                            type="date"
                            required
                            className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                        <input
                            type="date"
                            required
                            className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type d'absence</label>
                    <select
                        className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="Vacances">Vacances Annuelles</option>
                        <option value="Maladie">Maladie</option>
                        <option value="Force Majeure">Force Majeure</option>
                        <option value="Récupération">Récupération</option>
                        <option value="Formation">Formation</option>
                        <option value="Télétravail">Télétravail</option>
                        <option value="Autre">Autre</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motif (Optionnel)</label>
                    <textarea
                        className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        rows={3}
                        placeholder="Précisions si nécessaire..."
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Envoi en cours...</span>
                            </>
                        ) : (
                            <>
                                <span>Valider et notifier</span>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
