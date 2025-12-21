/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to handle global keyboard shortcuts for navigation.
 *
 * Shortcuts:
 * - Alt + N: New User
 * - Alt + D: Dashboard
 * - Alt + U: User List
 * - Alt + H: Help / Documentation
 * - Alt + A: Home / Accueil
 */
export const useKeyboardShortcuts = () => {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check if Alt key is pressed
            if (event.altKey) {
                switch (event.key.toLowerCase()) {
                    case 'n':
                        event.preventDefault();
                        router.push('/users/new');
                        break;
                    case 'd':
                        event.preventDefault();
                        router.push('/dashboard');
                        break;
                    case 'u':
                        event.preventDefault();
                        router.push('/users');
                        break;
                    case 'h':
                        event.preventDefault();
                        router.push('/help');
                        break;
                    case 'a':
                        event.preventDefault();
                        router.push('/');
                        break;
                    case 'p':
                        {
                            const isHelpPage = window.location.pathname.includes('/help') ||
                                window.location.pathname.includes('MANUEL_UTILISATEUR.html');
                            if (isHelpPage) {
                                event.preventDefault();
                                window.print();
                            }
                        }
                        break;
                    case 's':
                        {
                            const searchInput = document.querySelector('input[type="search"], input[placeholder*="rechercher" i]') as HTMLInputElement;
                            if (searchInput) {
                                event.preventDefault();
                                searchInput.focus();
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [router]);
};
