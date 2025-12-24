# Standards de Développement SocialConnect

Ce document définit les règles de développement pour assurer la maintenabilité et la qualité du code de SocialConnect.

## 1. Modularité des Composants UI
- **Limite de taille** : Aucun fichier de composant UI ne doit dépasser **300 lignes**.
- **Extraction** : Si un composant dépasse cette limite, il doit être décomposé en sous-composants plus petits ou sa logique doit être extraite dans un hook personnalisé.
- **Organisation** : Les composants complexes doivent être regroupés dans des dossiers dédiés (ex: `features/users/components/`).

## 2. Logique Métier & Hooks
- **Hooks personnalisés** : Toute logique d'état complexe, appels API ou calculs métier doit être extraite dans des hooks (`use...`).
- **Composants "Purs"** : Les composants UI doivent se concentrer sur l'affichage et déléguer la logique aux hooks ou aux fonctions utilitaires.

## 3. Gestion de l'État & API
- **Contexte** : Utiliser les Contexts React (`AdminContext`, `UserContext`) pour l'état global et les paramètres partagés.
- **API Routes** : Favoriser les routes API Next.js pour toutes les interactions avec la base de données via Prisma.
- **Validation** : Toujours valider les données côté serveur (API) et côté client (Formulaires).

## 4. Design & Esthétique (Premium)
- **Design System** : Utiliser les variables CSS définies dans `globals.css`.
- **Aesthetics** : Privilégier les designs épurés, les micro-animations et une hiérarchie visuelle claire (Glassmorphism, Gradients subtils).
- **Responsive** : Tous les composants doivent être "Mobile First" ou au moins parfaitement réactifs.

## 5. Documentation
- **Commentaires** : Documenter les fonctions complexes et les décisions d'architecture non triviales.
- **Checklists** : Maintenir le fichier `task.md` à jour pour suivre l'avancement des développements.
