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
    ChevronDown
} from 'lucide-react';

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

    const userRole = user.role || 'USER';
    const displayName = user.name || user.email || 'Utilisateur';
    const initials = displayName.slice(0, 2).toUpperCase();

    const menuItems = [
        { href: '/', label: 'Accueil', icon: Home },
        { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { href: '/users', label: 'Liste des usagers', icon: Users },
    ];

    return (
        <Menu as="div" className="relative inline-block text-left font-sans">
            <div>
                <Menu.Button className="flex items-center gap-3 p-1.5 pl-3 pr-2 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-sm font-semibold text-slate-700 leading-tight">
                            {displayName}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                            {isAdmin ? 'Admin' : 'Utilisateur'}
                        </span>
                    </div>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm
            ${isAdmin
                            ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                            : 'bg-gradient-to-br from-blue-500 to-blue-600'
                        }`}
                    >
                        {initials}
                    </div>

                    <ChevronDown className="w-4 h-4 text-slate-400" />
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
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">

                    {/* Header Mobile Only */}
                    <div className="px-4 py-3 sm:hidden">
                        <p className="text-sm font-medium text-gray-900">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    {/* Navigation */}
                    <div className="p-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Menu.Item key={item.href}>
                                    {({ active }) => (
                                        <Link
                                            href={item.href}
                                            className={`
                        group flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors
                        ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                        ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : ''}
                      `}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive || active ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
                                            {item.label}
                                        </Link>
                                    )}
                                </Menu.Item>
                            );
                        })}
                    </div>

                    {/* Admin & Settings */}
                    {userRole === 'ADMIN' && (
                        <div className="p-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={onOpenSettings}
                                        className={`
                      group flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors
                      ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                    `}
                                    >
                                        <Settings className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
                                        Paramètres
                                    </button>
                                )}
                            </Menu.Item>

                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={toggleAdmin}
                                        className={`
                      group flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors
                      ${active ? 'bg-amber-50 text-amber-700' : 'text-gray-700'}
                    `}
                                    >
                                        <Shield className={`w-4 h-4 ${active ? 'text-amber-600' : 'text-gray-400 group-hover:text-amber-600'}`} />
                                        <span>Mode Admin: {isAdmin ? 'Activé' : 'Désactivé'}</span>
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                    )}

                    {/* Logout */}
                    <div className="p-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className={`
                    group flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors
                    ${active ? 'bg-red-50 text-red-700' : 'text-gray-700'}
                  `}
                                >
                                    <LogOut className={`w-4 h-4 ${active ? 'text-red-600' : 'text-gray-400 group-hover:text-red-600'}`} />
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
