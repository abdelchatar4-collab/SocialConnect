import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Gestionnaire } from './types';

interface GestionnaireListProps {
    gestionnaires: Gestionnaire[];
    onEdit: (g: Gestionnaire) => void;
    onDelete: (id: string) => void;
}

export const GestionnaireList: React.FC<GestionnaireListProps> = ({
    gestionnaires,
    onEdit,
    onDelete
}) => {
    return (
        <div className="divide-y divide-gray-100">
            {gestionnaires.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                    Aucun gestionnaire disponible
                </div>
            ) : (
                gestionnaires.map((gestionnaire) => (
                    <div key={gestionnaire.id} className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg transition-colors group">
                        <div className="flex items-center space-x-3">
                            {/* Médaillon */}
                            <div
                                className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm border-2 border-white ring-1 ring-gray-100"
                                style={{
                                    background: gestionnaire.couleurMedaillon
                                        ? (() => {
                                            try {
                                                const couleur = typeof gestionnaire.couleurMedaillon === 'string'
                                                    ? JSON.parse(gestionnaire.couleurMedaillon)
                                                    : gestionnaire.couleurMedaillon;
                                                return `linear-gradient(135deg, ${couleur.from}, ${couleur.to})`;
                                            } catch (e) {
                                                return 'linear-gradient(135deg, #64748b, #475569)';
                                            }
                                        })()
                                        : 'linear-gradient(135deg, #64748b, #475569)',
                                    opacity: gestionnaire.isActive === false ? 0.6 : 1,
                                    filter: gestionnaire.isActive === false ? 'grayscale(0.5)' : 'none'
                                }}
                            >
                                {(gestionnaire.prenom?.[0] || '').toUpperCase()}{(gestionnaire.nom?.[0] || '').toUpperCase()}
                            </div>

                            <div className={gestionnaire.isActive === false ? 'opacity-60' : ''}>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-800">{gestionnaire.prenom} {gestionnaire.nom}</p>
                                    {gestionnaire.role === 'ADMIN' && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">
                                            ADMIN
                                        </span>
                                    )}
                                    {gestionnaire.isActive === false && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 italic">
                                            INACTIF
                                        </span>
                                    )}
                                </div>
                                {gestionnaire.email && <p className="text-sm text-gray-500">{gestionnaire.email}</p>}
                            </div>
                        </div>

                        <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onEdit(gestionnaire)}
                                className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                title="Modifier"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onDelete(gestionnaire.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
export default GestionnaireList;
