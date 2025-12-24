'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Service {
    id: string;
    name: string;
    slug: string;
}

export default function ServiceSwitcher() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Charger la liste des services
    useEffect(() => {
        // Sécurité : on ne charge pas si pas admin
        if (session?.user?.role !== 'SUPER_ADMIN') return;

        const fetchServices = async () => {
            try {
                // On utilise une route admin pour lister
                const res = await fetch('/api/admin/services');
                if (res.ok) {
                    const data = await res.json();
                    setServices(data);
                }
            } catch (e) {
                console.error("Erreur chargement services", e);
            }
        };
        fetchServices();
    }, [session]); // Ajout de session en dépendance

    const handleSwitch = async (serviceId: string) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/switch-service', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetServiceId: serviceId })
            });

            if (res.ok) {
                // Force update session and reload
                await update();
                window.location.href = '/dashboard'; // Hard reload to ensure clean state
            }
        } catch (e) {
            console.error("Erreur switch", e);
            setIsLoading(false);
        }
    };

    // Ne rien afficher si pas super admin
    // IMPORTANT: Ceci est fait APRES les hooks pour respecter les règles de React
    if (session?.user?.role !== 'SUPER_ADMIN') {
        return null;
    }

    // Trouver le service actuel (nom)
    const currentService = services.find(s => s.id === (session?.user as any)?.serviceId);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                {isLoading ? (
                    <span className="animate-pulse">Basculement...</span>
                ) : (
                    <>
                        <span>🏢 {currentService ? currentService.name : 'Service...'}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b bg-gray-50">
                            Changer de contexte
                        </div>
                        {services.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => {
                                    handleSwitch(service.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left block px-4 py-2 text-sm ${(session?.user as any)?.serviceId === service.id
                                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {service.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
