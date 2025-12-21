# SocialConnect - Gestion des Usagers

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg?style=flat-square)
![License](https://img.shields.io/badge/license-GNU%20GPL%20v3-green.svg?style=flat-square)
![Status](https://img.shields.io/badge/status-production-success.svg?style=flat-square)
![Tech](https://img.shields.io/badge/stack-Next.js%20%7C%20MariaDB%20%7C%20Docker-blueviolet.svg?style=flat-square)

**SocialConnect** est une plateforme moderne et sécurisée de gestion des usagers, conçue spécifiquement pour répondre aux besoins des acteurs du secteur social. Elle permet un suivi efficace, collaboratif et confidentiel des dossiers bénéficiaires.

---

## 👤 Auteur & Crédits

**Conception et Développement :**
**ABDEL KADER CHATAR**

> Ce projet est le fruit d'une expertise terrain combinée à une vision technologique moderne pour le travail social.

---

## 🛠 Stack Technique

Une architecture robuste, pensée pour la performance et la pérennité :

-   **Frontend / Backend** : [Next.js 14](https://nextjs.org/) (React Framework)
-   **Base de Données** : [MariaDB](https://mariadb.org/) (Compatible MySQL Cloud)
-   **ORM** : [Prisma](https://www.prisma.io/) (Gestion de données type-safe)
-   **Authentification** : [NextAuth.js](https://next-auth.js.org/) (Google OAuth 2.0)
-   **Infrastructure** : [Docker](https://www.docker.com/) & Docker Compose

---

## 🛡 Sécurité & Conformité

La sécurité des données sensibles est au cœur de **SocialConnect**.

-   ** Architecture Multi-tenant** : Isolation stricte des données (en cours de déploiement).
-   ** Conformité RGPD** : Respect de l'Article 30 (Registre des activités de traitement).
-   ** Souveraineté des Données** : Hébergement prévu sur **Cloud Suisse (Infomaniak)**, garantissant une protection juridique optimale et une confidentialité absolue.
-   ** Traçabilité** : Audit logs complets des actions utilisateurs.

---

## 🚀 Installation Rapide (Docker)

Le déploiement est entièrement containerisé pour une mise en production simplifiée.

### 1. Prérequis
-   Docker et Docker Compose installés sur la machine cible.
-   Accès à un serveur MariaDB (ou utilisez le conteneur inclus).

### 2. Configuration
Ne jamais commiter vos secrets ! Utilisez le modèle fourni :

```bash
# Copier le modèle de configuration
cp docker.env.example docker.env

# Éditer le fichier avec vos vrais secrets
nano docker.env
```

**Variables critiques à définir :**
-   `NEXTAUTH_SECRET` (Générer une clé forte)
-   `DATABASE_URL` (Connexion à la base de données)
-   `GOOGLE_CLIENT_ID` / `SECRET` (Pour l'authentification)

### 3. Lancement
Démarrer l'application en mode détaché :

```bash
# Pour le développement local
npm run dev

# Pour la production (via script de déploiement sécurisé)
./deploy.sh
```

L'application sera accessible sur `http://localhost:3000` (ou votre domaine configuré).

---

## 📜 Licence

Ce projet est distribué sous licence **GNU General Public License v3.0**.
C'est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de cette licence.

Copyright © 2025 **ABDEL KADER CHATAR**.
