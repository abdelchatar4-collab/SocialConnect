# État Actuel du Projet - Décembre 2025

## Architecture & Organisation du Code
Le projet a été refactorisé vers une architecture orientée **Features** située dans `src/features`. Cette approche permet une meilleure isolation des composants et une maintenance simplifiée.

### Modules Principaux :
- **Dashboard** (`src/features/dashboard`) : Gestion des widgets, pivot tables et exports Excel.
- **Users** (`src/features/users`) : Gestion complète des fiches usagers, formulaires multi-étapes et filtres avancés.
- **Settings** (`src/features/settings`) : Configuration centralisée des antennes, gestionnaires et paramètres de l'application.

## Points Clés de l'Implémentation
1. **Système d'IDs Dynamique** : Les IDs usagers sont générés selon le format `[ANTENNE]-[CUID]` (ex: CEN-ABC123), s'adaptant automatiquement aux nouvelles antennes.
2. **Design System Premium** : Utilisation d'une palette de couleurs sophistiquée, de dégradés pour les médaillons des gestionnaires et d'animations fluides (Tailwind CSS).
3. **Audit & Conformité** :
   - Traçabilité complète des modifications (`createdBy`, `updatedAt`).
   - Génération de documents RGPD automatisée.
   - Validation stricte des données selon le contexte administrateur.

## Stack Technique
- **Framework** : Next.js 14 (App Router)
- **Base de données** : MariaDB via Prisma ORM
- **Authentification** : NextAuth (Google OAuth)
- **UI** : Tailwind CSS, Headless UI, Heroicons, Lucide
- **Rapports** : Chart.js, Recharts, JsPDF, ExcelJS (via exports API)

## Prochaines Étapes
- Finalisation du déploiement multi-tenant.
- Optimisation des performances sur la liste des usagers (> 500 dossiers).
- Intégration accrue des fonctionnalités IA pour la saisie des notes.
