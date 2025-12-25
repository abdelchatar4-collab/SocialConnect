/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Category List (Master)
*/

import React from 'react';
import { LayoutList, Shield, Home, List, MoreHorizontal, ChevronRight } from 'lucide-react';
import { DropdownOptionSetAPI } from '@/services/optionsServiceAPI';

interface CategoryListProps {
    optionSets: DropdownOptionSetAPI[];
    selectedId?: string;
    onSelect: (id: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ optionSets, selectedId, onSelect }) => {
    const prevExp = optionSets.filter(s => s.id.startsWith('prevExp'));
    const housingIds = ['typeLogement', 'statutOccupation', 'statutGarantie', 'bailEnregistre', 'dureeContrat', 'typeLitige', 'dureePreavis', 'preavisPour'];
    const housing = optionSets.filter(s => !s.id.startsWith('prevExp') && housingIds.includes(s.id));
    const prestation = optionSets.filter(s => s.id === 'prestation_motifs');
    const others = optionSets.filter(s => !s.id.startsWith('prevExp') && !housingIds.includes(s.id) && s.id !== 'prestation_motifs');

    const Item = ({ set }: { set: DropdownOptionSetAPI }) => (
        <button onClick={() => onSelect(set.id)} className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-all ${selectedId === set.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <span className="truncate">{set.name}</span> {selectedId === set.id && <ChevronRight className="w-4 h-4 text-blue-500" />}
        </button>
    );

    const Group = ({ title, icon: Icon, items }: { title: string, icon: any, items: DropdownOptionSetAPI[] }) => items.length > 0 ? (
        <div className="mb-6"><div className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1.5 px-2"><Icon className="w-3 h-3" />{title}</div><div className="space-y-0.5">{items.map(s => <Item key={s.id} set={s} />)}</div></div>
    ) : null;

    return (
        <div className="md:w-1/3 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="p-4 bg-gray-50 border-b border-gray-200"><h3 className="font-semibold text-gray-800 flex items-center gap-2"><LayoutList className="w-4 h-4" />Catégories</h3></div>
            <div className="flex-1 overflow-y-auto p-3">
                <Group title="Prévention Expulsion" icon={Shield} items={prevExp} />
                <Group title="Logement" icon={Home} items={housing} />
                <Group title="Prestations" icon={List} items={prestation} />
                <Group title="Autres" icon={MoreHorizontal} items={others} />
            </div>
        </div>
    );
};
