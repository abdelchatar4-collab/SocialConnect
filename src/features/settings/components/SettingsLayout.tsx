/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

'use client';

import React, { useState, useMemo } from 'react';
import { X, Search, Check, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { SETTINGS_SECTIONS } from './SettingsLayout/settingsSections';
import { SettingsContent } from './SettingsLayout/SettingsContent';
import '../styles/settings-modern.css';

interface SettingsLayoutProps { isOpen: boolean; onClose: () => void; defaultSection?: string; }

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ isOpen, onClose, defaultSection }) => {
    const { data: session } = useSession();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes((session?.user as any)?.role || '');
    const [activeSection, setActiveSection] = useState(defaultSection || (isAdmin ? 'customization' : 'mon-horaire'));
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });

    const filteredSections = useMemo(() => {
        const sId = (session?.user as any)?.serviceId || 'default';
        let sections = isAdmin ? SETTINGS_SECTIONS : SETTINGS_SECTIONS.filter(s => ['mon-horaire', 'equipe'].includes(s.id));
        if (sId !== 'default') sections = sections.filter(s => s.id !== 'antennes');
        if (!searchQuery.trim()) return sections;
        const q = searchQuery.toLowerCase();
        return sections.filter(s => s.label.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.keywords.some(k => k.includes(q)));
    }, [searchQuery, session, isAdmin]);

    if (!isOpen) return null;
    const activeS = SETTINGS_SECTIONS.find(s => s.id === activeSection);

    return (
        <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 md:p-6 pointer-events-none">
                <div className="settings-container w-full h-full shadow-2xl overflow-hidden bg-white sm:rounded-xl ring-1 ring-black/10 pointer-events-auto settings-animate-in" onClick={e => e.stopPropagation()}>
                    <aside className="settings-sidebar">
                        <div className="settings-sidebar-header">
                            <div className="flex items-center justify-between"><span className="settings-sidebar-title">Paramètres</span><button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors md:hidden"><X className="w-4 h-4 text-gray-500" /></button></div>
                            <div className="settings-search"><Search className="settings-search-icon" /><input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="settings-search-input" /></div>
                        </div>
                        <nav className="settings-nav">
                            {filteredSections.map(s => <button key={s.id} onClick={() => setActiveSection(s.id)} className={`settings-nav-item ${activeSection === s.id ? 'settings-nav-item--active' : ''}`}><span className="settings-nav-icon">{s.icon}</span><span className="settings-nav-label">{s.label}</span></button>)}
                            {!filteredSections.length && <div className="text-sm text-gray-500 text-center py-4">Aucun résultat</div>}
                        </nav>
                    </aside>
                    <main className="settings-content">
                        <header className="settings-content-header"><h2 className="settings-content-title"><span className="settings-content-title-icon">{activeS?.icon}</span>{activeS?.label}</h2><button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden md:flex"><X className="w-5 h-5 text-gray-500" /></button></header>
                        <div className="settings-content-body settings-animate-in" key={activeSection}>
                            {activeS && <p className="text-sm text-gray-500 mb-4">{activeS.description}</p>}
                            <SettingsContent activeId={activeSection} />
                        </div>
                    </main>
                </div>
            </div>
            {toast.show && <div className={`settings-toast settings-toast--${toast.type}`}>{toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{toast.message}</div>}
        </>
    );
};

export default SettingsLayout;
