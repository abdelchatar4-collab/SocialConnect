# Système de Génération d'IDs Basé sur les Antennes

## Vue d'ensemble

Le nouveau système génère automatiquement des IDs d'utilisateurs avec des préfixes basés sur leur antenne d'affectation. Ce système est **entièrement dynamique** et s'adapte automatiquement aux nouvelles antennes sans nécessiter de modifications de code.

## Format des IDs

**Nouveau format :** `[ANTENNE]-[UNIQUE_ID]`

Exemples :
- `CEN-ABC123` (Centre)
- `OUE-XYZ789` (Ouest)
- `PIL-DEF456` (Pilda)
- `AND-GHI789` (Anderlecht - défaut)

## Mapping des Antennes

### Antennes Prédéfinies
| Antenne | Préfixe | Exemple d'ID |
|---------|---------|--------------|
| Centre | CEN | CEN-ABC123 |
| Cureghem | CUR | CUR-DEF456 |
| Ouest | OUE | OUE-GHI789 |
| Pilda | PIL | PIL-JKL012 |
| Bizet | BIZ | BIZ-MNO345 |
| Anderlecht | AND | AND-PQR678 |

### Génération Automatique pour Nouvelles Antennes

Le système génère automatiquement des préfixes pour les nouvelles antennes :

#### Règles de Génération
1. **Nettoyage** : Suppression des accents, caractères spéciaux
2. **Extraction** : Prise des 3 premiers caractères
3. **Complétion** : Si moins de 3 caractères, complétion automatique
4. **Mise en cache** : Sauvegarde du préfixe généré pour réutilisation

#### Exemples de Génération Automatique
| Antenne | Préfixe Généré | ID Exemple |
|---------|----------------|------------|
| Saint-Gilles | SAI | SAI-ABC123 |
| Molenbeek | MOL | MOL-DEF456 |
| Forest | FOR | FOR-GHI789 |
| Nouvelle Antenne | NOU | NOU-JKL012 |
| Étoile | ETO | ETO-MNO345 |

## Architecture Technique

### Fichiers Modifiés

1. **`/src/lib/idGenerator.ts`**
   - Générateur de préfixes dynamique
   - Fonction de génération d'IDs
   - Utilitaires de parsing et validation

2. **`/src/app/api/users/route.ts`**
   - Modification de la création d'utilisateurs
   - Utilisation du nouveau système d'IDs

### Fonctions Principales

#### `generateAntennePrefix(antenneName: string): string`
Génère un préfixe de 3 lettres à partir du nom d'une antenne.

```typescript
generateAntennePrefix("Saint-Gilles") // → "SAI"
generateAntennePrefix("Étoile")       // → "ETO"
generateAntennePrefix("")             // → "AND" (défaut)
```

#### `getAntennePrefix(antenneName: string | null): string`
Obtient le préfixe d'une antenne (depuis le cache ou génération).

```typescript
getAntennePrefix("Centre")      // → "CEN"
getAntennePrefix("Nouvelle")    // → "NOU" (généré et mis en cache)
getAntennePrefix(null)          // → "AND" (défaut)
```

#### `generateUserIdByAntenne(antenneName: string | null): string`
Génère un ID complet pour un utilisateur.

```typescript
generateUserIdByAntenne("Centre")  // → "CEN-ABC123"
generateUserIdByAntenne(null)      // → "AND-DEF456"
```

#### `parseId(id: string): ParsedId`
Parse un ID pour extraire les informations.

```typescript
parseId("CEN-ABC123")    // → { antennePrefix: "CEN", uniqueId: "ABC123", isValidFormat: true }
parseId("PROD-123456")   // → { antennePrefix: "", uniqueId: "PROD-123456", isValidFormat: false }
```

## Compatibilité

### Anciens IDs
- **PROD-XXXXXX** : Reconnus comme format ancien
- **UUID simples** : Conservés pour la compatibilité
- **Aucune migration** : Les anciens IDs continuent de fonctionner

### Nouveaux IDs
- **Format uniforme** : XXX-YYYYYY
- **Traçabilité** : Antenne visible dans l'ID
- **Unicité** : Garantie par CUID2 tronqué

## Avantages

### 🚀 **Évolutivité**
- Aucune modification de code nécessaire pour nouvelles antennes
- Génération automatique des préfixes
- Système auto-adaptatif

### 📊 **Traçabilité**
- Antenne visible directement dans l'ID
- Filtrage et recherche simplifiés
- Reporting facilité

### 🔧 **Robustesse**
- Gestion des caractères spéciaux et accents
- Validation automatique des formats
- Fallback vers Anderlecht par défaut

### 🔄 **Compatibilité**
- Coexistence avec anciens formats
- Migration transparente
- Aucune rupture de service

## Tests

### Test Automatisé
```bash
node test-antenne-ids.js
```

### Vérification Manuelle
1. Créer un utilisateur avec antenne "Centre" → ID doit commencer par "CEN-"
2. Créer un utilisateur avec nouvelle antenne → Préfixe auto-généré
3. Créer un utilisateur sans antenne → ID commence par "AND-"

## Mise en Production

### Étapes de Déploiement
1. ✅ **Code déployé** : Système prêt et testé
2. ✅ **API modifiée** : Génération automatique active
3. ✅ **Tests validés** : Tous les cas couverts
4. 🎯 **Monitoring** : Surveiller les nouveaux IDs générés

### Points de Surveillance
- Unicité des IDs générés
- Performance de génération
- Bon fonctionnement des préfixes automatiques
- Compatibilité avec l'interface utilisateur

## Support

Pour toute question ou problème, le système est entièrement documenté et testable via le fichier `test-antenne-ids.js`.

---
*Système implémenté le 9 juin 2025 - Prêt pour la production*
