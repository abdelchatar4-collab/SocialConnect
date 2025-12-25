---
description: Règles de code à respecter AVANT toute modification
---

# ⛔ RÈGLES DE REFACTORISATION - STRICTEMENT OBLIGATOIRES

## 🚨 RÈGLE N°1 : LIMITE ABSOLUE DE 300 LIGNES

**AVANT de modifier OU créer un fichier .ts ou .tsx :**

1. **VÉRIFIER** que le fichier ne dépasse PAS 300 lignes
2. **SI la modification risque de dépasser 300 lignes → REFACTORISER D'ABORD**
3. **NE JAMAIS** proposer d'augmenter la limite, même temporairement

> ⚠️ **AUCUNE EXCEPTION.** Si l'utilisateur demande une fonctionnalité et que le fichier est proche de 300 lignes, EXTRAIRE d'abord.

## Comment vérifier AVANT modification

```bash
// turbo
wc -l src/path/to/file.tsx
```

Si le fichier dépasse **250 lignes** → **EXTRAIRE** avant d'ajouter du code.

## Options de refactorisation OBLIGATOIRES

| Situation | Action |
|-----------|--------|
| Composant > 200 lignes | Extraire en sous-composants |
| Hook > 150 lignes | Diviser en hooks spécialisés |
| API Route > 150 lignes | Extraire helpers/types |
| Utilitaires > 100 lignes | Diviser par domaine |

## Structure d'extraction recommandée

```
feature/
├── components/
│   ├── MainComponent.tsx (< 300 lignes)
│   ├── SubComponent1.tsx
│   └── SubComponent2.tsx
├── hooks/
│   ├── useMainLogic.ts (< 300 lignes)
│   └── useHelperLogic.ts
└── types.ts
```

## 🔴 INTERDICTIONS

1. **NE JAMAIS** modifier un fichier > 300 lignes sans le refactoriser d'abord
2. **NE JAMAIS** créer un nouveau fichier > 300 lignes
3. **NE JAMAIS** proposer "on refactorisera plus tard"
4. **NE JAMAIS** contourner cette règle pour "gagner du temps"

## Script de vérification

```bash
// turbo
./scripts/pre-commit-check.sh
```

## Rappel

> La dette technique coûte 10x plus cher à corriger que de bien faire dès le départ.
