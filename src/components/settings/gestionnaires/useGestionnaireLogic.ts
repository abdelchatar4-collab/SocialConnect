import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Gestionnaire, SessionUserWithRole } from './types';
import { PREDEFINED_COLORS } from './constants';

export const useGestionnaireLogic = () => {
    const { data: session, status: sessionStatus } = useSession();
    const userRole = (session?.user as SessionUserWithRole)?.role;

    const [gestionnaires, setGestionnaires] = useState<Gestionnaire[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [currentGestionnaire, setCurrentGestionnaire] = useState<Gestionnaire>({
        id: '',
        nom: '',
        prenom: '',
        email: '',
        role: 'USER',
        couleurMedaillon: null,
        isActive: true
    });

    useEffect(() => {
        if (sessionStatus === "loading") {
            setIsLoading(true);
            return;
        }

        const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

        if (sessionStatus === "authenticated" && isAdmin) {
            fetchGestionnaires();
        } else if (sessionStatus === "authenticated" && !isAdmin) {
            setError("Accès refusé. Droits administrateur requis.");
            setGestionnaires([]);
            setIsLoading(false);
        } else if (sessionStatus === "unauthenticated") {
            setError("Veuillez vous connecter en tant qu'administrateur.");
            setGestionnaires([]);
            setIsLoading(false);
        }
    }, [sessionStatus, userRole]);

    const fetchGestionnaires = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/gestionnaires');
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Accès API refusé. Droits administrateur requis.');
                }
                throw new Error('Erreur lors du chargement des gestionnaires');
            }
            const data = await response.json();
            setGestionnaires(data);
            setError(null);
        } catch (err) {
            console.error('Erreur fetchGestionnaires:', err);
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveGestionnaire = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = currentGestionnaire.id ? 'PUT' : 'POST';
            const url = currentGestionnaire.id
                ? `/api/gestionnaires/${currentGestionnaire.id}`
                : '/api/gestionnaires';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentGestionnaire)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
            }

            await fetchGestionnaires();
            setEditMode(false);
            setCurrentGestionnaire({ id: '', nom: '', prenom: '', email: '', role: 'USER', isActive: true });
        } catch (err) {
            console.error('Erreur:', err);
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce gestionnaire?')) return;

        try {
            const response = await fetch(`/api/gestionnaires/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la suppression');
            }

            await fetchGestionnaires();
        } catch (err) {
            console.error('Erreur:', err);
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
    };

    const configureAutoColors = async () => {
        try {
            setIsLoading(true);
            const gestionnairesSansCouleur = gestionnaires.filter(g => !g.couleurMedaillon);

            if (gestionnairesSansCouleur.length === 0) {
                alert('Tous les gestionnaires ont déjà une couleur configurée !');
                return;
            }

            const gestionnairesAvecCouleur = gestionnaires.filter(g => g.couleurMedaillon);
            let assignedCount = 0;

            for (let i = 0; i < gestionnairesSansCouleur.length; i++) {
                const gestionnaire = gestionnairesSansCouleur[i];
                const colorIndex = (gestionnairesAvecCouleur.length + i) % PREDEFINED_COLORS.length;
                const selectedColor = PREDEFINED_COLORS[colorIndex];

                const response = await fetch(`/api/gestionnaires/${gestionnaire.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...gestionnaire,
                        couleurMedaillon: JSON.stringify({
                            from: selectedColor.from,
                            to: selectedColor.to
                        })
                    })
                });

                if (response.ok) {
                    assignedCount++;
                }
            }

            await fetchGestionnaires();
            alert(`✅ ${assignedCount} couleur(s) configurée(s) automatiquement !\n\nRafraîchissez la page des usagers pour voir les changements.`);

        } catch (err) {
            console.error('Erreur lors de la configuration automatique:', err);
            setError('Erreur lors de la configuration automatique des couleurs');
        } finally {
            setIsLoading(false);
        }
    };

    const isAdminEditingSelf = editMode && (session?.user as SessionUserWithRole)?.id === currentGestionnaire.id && currentGestionnaire.role === 'ADMIN';

    return {
        gestionnaires,
        isLoading,
        error,
        editMode,
        setEditMode,
        currentGestionnaire,
        setCurrentGestionnaire,
        handleSaveGestionnaire,
        handleDelete,
        configureAutoColors,
        isAdminEditingSelf
    };
};
