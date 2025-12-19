# 📋 Registre des Activités de Traitement
## Conformité RGPD - Article 30

**Organisation :** [Nom de votre organisation / Commune]
**Service :** Pôle Accueil Social des Quartiers (PASQ)
**Date de création :** 17 décembre 2025
**Dernière mise à jour :** 17 décembre 2025
**Version :** 1.0

---

## 📌 Informations Générales

### Responsable du traitement

| Champ | Information |
|-------|-------------|
| **Nom de l'organisation** | [Commune de ...] |
| **Adresse** | [Adresse complète] |
| **Numéro d'entreprise (BCE)** | [0xxx.xxx.xxx] |
| **Représentant légal** | [Bourgmestre / Directeur Général] |
| **Contact** | [email@commune.be] |

### Délégué à la Protection des Données (DPO)

> ⚠️ **Obligatoire** pour les autorités publiques et services sociaux (Art. 37 RGPD)

| Champ | Information |
|-------|-------------|
| **Nom** | [Nom du DPO] |
| **Fonction** | Délégué à la Protection des Données |
| **Email** | [dpo@commune.be] |
| **Téléphone** | [+32 ...] |

---

## 📁 Traitement 1 : Gestion des Dossiers Sociaux

### Identification du traitement

| Champ | Description |
|-------|-------------|
| **Nom du traitement** | Gestion des dossiers d'accompagnement social |
| **Département responsable** | PASQ - Pôle Accueil Social des Quartiers |
| **Application utilisée** | Application de Gestion des Usagers (Next.js/MySQL) |

### Finalités du traitement

| Finalité | Description |
|----------|-------------|
| **Principale** | Accompagnement social des usagers du service |
| **Secondaire** | Suivi des problématiques sociales (logement, administratif, juridique) |
| **Statistique** | Production de rapports anonymisés pour pilotage du service |

### Base légale (Art. 6 RGPD)

| Base légale | Justification |
|-------------|---------------|
| ✅ **Art. 6.1.e** | Mission d'intérêt public - Accompagnement social communal |
| ✅ **Art. 6.1.c** | Mission communale de prévention et d'accompagnement social |

### Catégories de personnes concernées

| Catégorie | Description |
|-----------|-------------|
| **Usagers** | Personnes bénéficiant d'un accompagnement social |
| **Gestionnaires** | Travailleurs sociaux du service |

### Catégories de données collectées

#### Données d'identification
| Donnée | Obligatoire | Sensible |
|--------|-------------|----------|
| Nom, Prénom | ✅ Oui | Non |
| Date de naissance | Non | Non |
| Genre | Non | Non |
| Nationalité | Non | Non |
| Téléphone | Non | Non |
| Email | Non | Non |
| Adresse | Non | Non |

#### Données relatives à la situation sociale
| Donnée | Obligatoire | Sensible |
|--------|-------------|----------|
| Statut de séjour | Non | ⚠️ Potentiellement |
| Situation professionnelle | Non | Non |
| Revenus | Non | ⚠️ Oui |
| Problématiques sociales | Non | ⚠️ Oui |

#### Données relatives au logement (Prévention Expulsion)
| Donnée | Obligatoire | Sensible |
|--------|-------------|----------|
| Type de logement | Non | Non |
| Dates de procédure judiciaire | Non | Non |
| Décisions de justice | Non | ⚠️ Oui |

#### Données sensibles (Art. 9 RGPD)
| Catégorie | Justification du traitement |
|-----------|----------------------------|
| Données de santé | Nécessaires pour l'accompagnement social (Art. 9.2.h) |
| Données relatives aux condamnations | Procédures d'expulsion (Art. 10 avec autorisation) |

### Destinataires des données

| Destinataire | Type | Finalité |
|--------------|------|----------|
| Gestionnaires PASQ | Interne | Accompagnement quotidien |
| Direction du service | Interne | Supervision, statistiques |
| Infomaniak SA (hébergeur) | Sous-traitant | Hébergement technique |

### Transferts hors UE/EEE

| Transfert | Détails |
|-----------|---------|
| **Vers pays tiers** | ❌ Non |
| **Localisation des données** | Suisse (Infomaniak) |
| **Base du transfert** | Décision d'adéquation CE (Suisse) |

### Durées de conservation

| Type de données | Durée | Justification |
|-----------------|-------|---------------|
| Dossiers actifs | Durée de l'accompagnement | Nécessité opérationnelle |
| Dossiers clôturés | 5 ans après clôture | Obligations légales communales |
| Données archivées | Jusqu'à 10 ans | Archives communales |
| Logs de connexion | 1 an | Sécurité informatique |

### Mesures de sécurité techniques et organisationnelles

#### Sécurité technique
| Mesure | Implémentation |
|--------|----------------|
| **Authentification** | Google OAuth 2.0 (SSO) |
| **Chiffrement en transit** | HTTPS/TLS 1.3 |
| **Chiffrement au repos** | Chiffrement base de données |
| **Contrôle d'accès** | Rôles (Admin, Gestionnaire) |
| **Journalisation** | Audit trail (createdBy, updatedBy) |
| **Sauvegardes** | Quotidiennes, chiffrées |

#### Sécurité organisationnelle
| Mesure | Description |
|--------|-------------|
| **Formation** | Sensibilisation RGPD des gestionnaires | ✅ En place |
| **Accès limité** | Seuls les gestionnaires autorisés |
| **Politique de mots de passe** | Via Google (2FA recommandé) |
| **Procédure de violation** | Notification APD sous 72h |

---

## 📁 Traitement 2 : Statistiques et Rapports

### Identification

| Champ | Description |
|-------|-------------|
| **Nom du traitement** | Production de statistiques anonymisées |
| **Finalité** | Pilotage du service, rapports annuels |

### Caractéristiques

| Aspect | Description |
|--------|-------------|
| **Base légale** | Art. 6.1.e - Mission d'intérêt public |
| **Données utilisées** | Données agrégées et anonymisées |
| **Destinataires** | Direction, Conseil communal |
| **Conservation** | Illimitée (données anonymes) |

---

## 📁 Traitement 3 : Gestion des Accès Utilisateurs

### Identification

| Champ | Description |
|-------|-------------|
| **Nom du traitement** | Authentification et gestion des gestionnaires |
| **Finalité** | Contrôle d'accès à l'application |

### Données collectées

| Donnée | Source |
|--------|--------|
| Nom, Prénom | Saisie manuelle |
| Email professionnel | Google Workspace |
| Date de dernière connexion | Automatique |

### Caractéristiques

| Aspect | Description |
|--------|-------------|
| **Base légale** | Art. 6.1.f - Intérêt légitime (sécurité) |
| **Conservation** | Durée du contrat + 1 an |
| **Sous-traitant** | Google (authentification) |

---

## 📝 Annexes

### A. Contrat de sous-traitance

| Sous-traitant | Objet | Contrat |
|---------------|-------|---------|
| Infomaniak SA | Hébergement cloud | ⚠️ À établir |
| Google LLC | Authentification OAuth | Conditions Google Workspace |

### B. Procédure de gestion des droits des personnes

| Droit | Procédure |
|-------|-----------|
| **Accès (Art. 15)** | Demande par email au DPO, réponse sous 30 jours |
| **Rectification (Art. 16)** | Modification via l'application ou demande au gestionnaire |
| **Effacement (Art. 17)** | Demande au DPO, analyse au cas par cas |
| **Limitation (Art. 18)** | Marquage du dossier comme "limité" |
| **Portabilité (Art. 20)** | Export des données en format Excel/PDF |
| **Opposition (Art. 21)** | Analyse par le DPO |

### C. Procédure de notification de violation

1. **Détection** : Signalement immédiat au DPO
2. **Évaluation** : Analyse du risque sous 24h
3. **Notification APD** : Si risque élevé, dans les 72h via [eLoket APD](https://www.autoriteprotectiondonnees.be/citoyen/agir/introduire-une-plainte)
4. **Communication** : Information aux personnes concernées si nécessaire
5. **Documentation** : Registre des incidents

---

## ✅ Validation

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| Responsable du traitement | _____________ | ____/____/________ | _____________ |
| DPO | _____________ | ____/____/________ | _____________ |
| Direction du service | _____________ | ____/____/________ | _____________ |

---

## 📚 Références légales

- **RGPD** : Règlement (UE) 2016/679 du 27 avril 2016
- **Loi belge** : Loi du 30 juillet 2018 relative à la protection des personnes physiques à l'égard des traitements de données à caractère personnel
- **APD** : [autoriteprotectiondonnees.be](https://www.autoriteprotectiondonnees.be)

---

> 📌 **Rappel** : Ce registre doit être tenu à jour et mis à disposition de l'APD sur demande.
