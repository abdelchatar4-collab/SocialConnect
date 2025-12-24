---
description: Règles de code à respecter AVANT toute modification
---

# Règles de Refactorisation - OBLIGATOIRES

## Règle Principale: Limite de 500 lignes

**AVANT de modifier ou créer un fichier .ts ou .tsx :**

1. Vérifier que le fichier ne dépasse PAS 500 lignes
2. Si la modification risque de dépasser 500 lignes → REFACTORISER d'abord

## Comment vérifier

```bash
// turbo
./scripts/pre-commit-check.sh
```

## Si un fichier dépasse 400 lignes

**Options de refactorisation :**

1. **Composants** → Extraire en sous-composants dans le même dossier
2. **Hooks** → Extraire la logique en hooks personnalisés
3. **Utils** → Extraire les fonctions pures en fichiers utils
4. **Types** → Séparer les interfaces/types dans un fichier `.types.ts`

## Fichiers actuellement en violation (à refactoriser)

- `api/users/[id]/route.ts` (673 lignes)
- `PrestationAdmin.tsx` (650 lignes)
- `UserPDFView.tsx` (603 lignes)
- `PivotTableBuilder.tsx` (602 lignes)
- `apiClient.ts` (582 lignes)
- Et 24 autres...

## Rappel

> ⚠️ NE JAMAIS créer ou modifier un fichier qui dépasse 400 lignes sans le refactoriser.
