# Standards de Développement SocialConnect

Ce document définit les règles de codage et de structure pour garantir la maintenabilité à long terme de l'application SocialConnect.

## 1. Modularité des Composants (Règle des 300 lignes)

Pour éviter la création de fichiers "monolithes" difficiles à déboguer et à tester, nous appliquons la règle suivante :

> [!IMPORTANT]
> **Tout composant React dépassant 300 lignes doit être refactorisé.**

### Stratégies de Refactorisation :
- **Extraction de la Logique** : Déplacer la gestion d'état complexe et les effets dans des hooks personnalisés (`useMyFeatureLogic.ts`).
- **Sous-composants** : Découper l'interface en petits composants fonctionnels spécialisés (ex: `UserFormHeader`, `UserFormActions`).
- **Utilitaires** : Déplacer les fonctions de formatage ou de calcul pur dans des fichiers `utils/`.

## 2. Gestion des Paramètres

- Aucun paramètre métier (années, noms de services, adresses légales) ne doit être codé en dur ("hardcoded").
- Utilisez le `AdminContext` pour accéder aux réglages stockés en base de données.
- Pour les nouveaux réglages, mettez à jour le modèle `Settings` dans `prisma/schema.prisma`.

## 3. Typage TypeScript

- Utilisez des interfaces explicites pour toutes les données provenant de l'API.
- Évitez l'utilisation du type `any`. Préférer `unknown` si le type est réellement incertain, ou définir des types partiaux.

## 4. Performance

- Utilisez `React.memo` pour les gros composants de liste ou de formulaire (ex: `UserDetailDisplay`).
- Utilisez `useCallback` pour les fonctions passées en "props" aux composants mémoïsés.

---
*Dernière mise à jour : 22 Décembre 2025*
