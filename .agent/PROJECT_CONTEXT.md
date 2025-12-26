# SocialConnect - Project Context & Rules

## 📌 Vision du Projet
SocialConnect est une plateforme multi-tenant de gestion d'usagers pour les services sociaux (PASQ, Médiation Locale, Jeunesse, etc.). L'objectif est de garantir une intégrité parfaite des données, une isolation stricte entre les services, et une interface haut de gamme.

## 🛠️ Architecture & Technologies
- **Framework**: Next.js 14 (App Router)
- **Base de Données**: MySQL/MariaDB (Unraid 192.168.2.147) via Prisma
- **Multi-Tenant**: Isolation via `serviceId` gérée par `src/lib/prisma-clients.ts`.
- **Structure**: Modulaire par feature dans `src/features/`.

---

## 🛡️ SAFETY-FIRST : Règles Absolues (LIRE EN PREMIER)

> **AVANT TOUTE OPÉRATION RISQUÉE, L'IA DOIT :**

### 1. BACKUP OBLIGATOIRE avant :
- Toute migration Prisma
- Toute modification de schéma
- Toute suppression de données
- Toute opération DELETE en masse

**Commande backup :**
```bash
ssh root@192.168.2.147
docker exec mariadb mariadb-dump -u root -p'MOT_DE_PASSE' gestion_usagers_db > /mnt/user/appdata/backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. VÉRIFICATION EXHAUSTIVE :
- Ne JAMAIS dire "c'est OK" sans avoir vérifié TOUS les fichiers concernés
- Si l'utilisateur demande une vérification, faire un audit COMPLET, pas partiel
- Utiliser grep/find pour s'assurer qu'aucun fichier n'est oublié

### 3. EXPLICATIONS CLAIRES :
- Expliquer chaque commande AVANT exécution
- Indiquer les paramètres à adapter
- Avertir des risques potentiels

### 4. PAS DE RACCOURCIS :
- Ne pas utiliser `prisma db push` en production
- Ne pas créer de routes destructives (delete-all, truncate, etc.)
- Ne pas ignorer les erreurs ou warnings

---

## 🚨 Règles de Développement Strictes (Critical)
1. **Légèreté des Fichiers** :
   - Aucun fichier ne doit dépasser **300 lignes**.
   - Si un fichier approche cette limite, il DOIT être décomposé en sous-composants ou hooks.
2. **Gestion des Dates** :
   - Interface : Toujours utiliser le composant `<DateInput />` pour garantir le format `JJ/MM/AAAA`.
   - Logique : Utiliser `src/utils/dateUtils.ts` pour toute manipulation.
   - API : Normalisation systématique en ISO avant stockage.
3. **Sécurité & Isolation Multi-Tenant** :
   - Toutes les requêtes Prisma DOIVENT passer par `getServiceClient(serviceId)`.
   - NE JAMAIS utiliser le prisma global (`import prisma from '@/lib/prisma'`) dans les APIs users.
   - NE JAMAIS créer de routes `delete-all` ou opérations destructives massives.
   - Vérifier l'appartenance au service avant PUT/DELETE sur ressources individuelles.
4. **Git & Commit** :
   - Commit régulier des changements validés.
   - Respecter la stratégie de branche établie.

## 🗄️ Prisma & Base de Données (Critical)
1. **Migrations (JAMAIS db push en prod)** :
   - Modifier le schéma : `npx prisma migrate dev --name description`
   - Appliquer en prod : `npx prisma migrate deploy`
   - Vérifier statut : `npx prisma migrate status`
2. **Intégrité des données** :
   - Vérifier régulièrement les orphelins (adresses, settings sans serviceId)
   - Nettoyer avec prudence et APRÈS backup

## 📋 État du Refactoring
- [x] Structure `src/features` migrée.
- [x] `UserList` et `UserForm` décomposés selon la règle des 300 lignes.
- [x] Système d'intégrité des dates opérationnel.
- [x] Migration Prisma baseline créée (0_init).
- [x] Audit multi-tenant complet (13 routes corrigées).
- [x] Route delete-all supprimée.
- [x] Nettoyage BD (4011 adresses + 9 settings orphelins supprimés).
- [ ] Suppression complète des anciens fichiers (`components/*.tsx` orphelins).
- [ ] Optimisation des imports Excel.
