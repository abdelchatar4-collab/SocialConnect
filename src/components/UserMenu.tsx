/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import {
    User,
    LogOut,
    Settings,
    Shield,
    Home,
    LayoutDashboard,
    Users,
    ChevronDown,
    Clock,
    Building2
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface UserMenuProps {
    user: {
        name?: string | null;
        email?: string | null;
        role?: string | null;
        image?: string | null;
    };
    onOpenSettings: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onOpenSettings }) => {
    const { isAdmin, toggleAdmin } = useAdmin();
    const pathname = usePathname();
    const { data: session, update } = useSession();
    const [services, setServices] = useState<{ id: string; name: string }[]>([]);
    const [switchingTo, setSwitchingTo] = useState<string | null>(null);

    const userRole = user.role || 'USER';
    const displayName = user.name || user.email || 'Utilisateur';
    const initials = displayName.slice(0, 2).toUpperCase();

    // Load services for Super Admin
    useEffect(() => {
        if (userRole !== 'SUPER_ADMIN') return;
        fetch('/api/admin/services').then(r => r.ok ? r.json() : []).then(setServices).catch(() => { });
    }, [userRole]);

    const handleSwitchService = async (serviceId: string) => {
        setSwitchingTo(serviceId);
        try {
            const res = await fetch('/api/admin/switch-service', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetServiceId: serviceId })
            });
            if (res.ok) {
                await update();
                window.location.href = '/dashboard';
            }
        } catch { }
        setSwitchingTo(null);
    };

    const currentServiceId = (session?.user as any)?.serviceId;
    const currentService = services.find(s => s.id === currentServiceId);

    const menuItems = [
        { href: '/', label: 'Accueil', icon: Home },
        { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { href: '/prestations', label: 'Mes Prestations', icon: Clock },
        { href: '/users', label: 'Liste des usagers', icon: Users },
    ];

    return (
        <Menu as="div" className="relative inline-block text-left font-sans">
            <div>
                <Menu.Button className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    {/* User Info */}
                    <div className="flex flex-col items-end hidden sm:flex min-w-0">
                        <span className="text-sm font-semibold text-slate-800 leading-tight truncate max-w-[140px]">
                            {displayName}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${userRole === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : userRole === 'ADMIN'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                            {userRole === 'SUPER_ADMIN' ? 'Super Admin' : (userRole === 'ADMIN' ? 'Admin' : 'Utilisateur')}
                        </span>
                    </div>

                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ring-2 ring-white
                        ${isAdmin
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        }`}
                    >
                        {initials}
                    </div>

                    <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 mt-3 w-72 max-h-[80vh] overflow-y-auto origin-top-right bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">

                    {/* Profile Header */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200/50">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg
                                ${isAdmin
                                    ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                    : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                }`}
                            >
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                <span className={`inline-flex items-center mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${userRole === 'SUPER_ADMIN'
                                    ? 'bg-purple-500/10 text-purple-600'
                                    : userRole === 'ADMIN'
                                        ? 'bg-amber-500/10 text-amber-600'
                                        : 'bg-slate-500/10 text-slate-600'
                                    }`}>
                                    {userRole === 'SUPER_ADMIN' ? '✨ Super Admin' : (userRole === 'ADMIN' ? '⚡ Admin' : 'Utilisateur')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="p-2">
                        <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Navigation</p>
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Menu.Item key={item.href}>
                                    {({ active }) => (
                                        <Link
                                            href={item.href}
                                            className={`group flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl transition-all duration-150
                                                ${active ? 'bg-blue-50 text-blue-700 translate-x-1' : 'text-slate-700'}
                                                ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'font-medium'}
                                            `}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                                ${isActive || active ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-blue-100'}`}>
                                                <Icon className={`w-4 h-4 ${isActive || active ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`} />
                                            </div>
                                            {item.label}
                                        </Link>
                                    )}
                                </Menu.Item>
                            );
                        })}
                    </div>

                    {/* Settings & Actions */}
                    <div className="p-2 border-t border-slate-100">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={onOpenSettings}
                                    className={`group flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl transition-all duration-150 font-medium
                                        ${active ? 'bg-slate-100 text-slate-900 translate-x-1' : 'text-slate-700'}
                                    `}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                        ${active ? 'bg-slate-200' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                                        <Settings className={`w-4 h-4 ${active ? 'text-slate-600' : 'text-slate-500'}`} />
                                    </div>
                                    Paramètres
                                </button>
                            )}
                        </Menu.Item>
                    </div>

                    {/* Service Switcher for Super Admin */}
                    {userRole === 'SUPER_ADMIN' && services.length > 0 && (
                        <div className="p-2 border-t border-slate-100 bg-gradient-to-br from-purple-50/50 to-white">
                            <p className="px-3 py-1.5 text-[10px] font-semibold text-purple-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Building2 className="w-3 h-3" />
                                Changer de contexte
                            </p>
                            <div className="max-h-28 overflow-y-auto space-y-0.5">
                                {services.map(service => (
                                    <Menu.Item key={service.id}>
                                        {({ active }) => (
                                            <button
                                                onClick={() => handleSwitchService(service.id)}
                                                disabled={switchingTo !== null}
                                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-150 flex items-center justify-between font-medium
                                                    ${currentServiceId === service.id
                                                        ? 'bg-purple-100 text-purple-700 shadow-sm'
                                                        : active ? 'bg-purple-50 text-purple-600' : 'text-slate-600 hover:bg-purple-50'}
                                                    ${switchingTo === service.id ? 'opacity-50 animate-pulse' : ''}
                                                `}
                                            >
                                                <span className="truncate">{service.name}</span>
                                                {currentServiceId === service.id && (
                                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">✓</span>
                                                )}
                                            </button>
                                        )}
                                    </Menu.Item>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Admin Toggle */}
                    {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                        <div className="p-2 border-t border-slate-100">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={toggleAdmin}
                                        className={`group flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl transition-all duration-150 font-medium
                                            ${active ? 'bg-amber-50 text-amber-700 translate-x-1' : 'text-slate-700'}
                                        `}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                            ${isAdmin ? 'bg-amber-100' : 'bg-slate-100'}`}>
                                            <Shield className={`w-4 h-4 ${isAdmin ? 'text-amber-600' : 'text-slate-500'}`} />
                                        </div>
                                        <span className="flex-1">Mode Admin</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {isAdmin ? 'ON' : 'OFF'}
                                        </span>
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                    )}

                    {/* Logout */}
                    <div className="p-2 border-t border-slate-100">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className={`group flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl transition-all duration-150 font-medium
                                        ${active ? 'bg-red-50 text-red-700 translate-x-1' : 'text-slate-700'}
                                    `}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                        ${active ? 'bg-red-100' : 'bg-slate-100 group-hover:bg-red-100'}`}>
                                        <LogOut className={`w-4 h-4 ${active ? 'text-red-600' : 'text-slate-500 group-hover:text-red-600'}`} />
                                    </div>
                                    Se déconnecter
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};
