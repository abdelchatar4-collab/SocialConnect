# Limites d'Upload des Fichiers

## Limites par Type de Fichier

| Type de Fichier | Extensions | Taille Maximale | Usage Recommandé |
|----------------|------------|-----------------|------------------|
| **PDF** | `.pdf` | **50 MB** | Rapports, guides, documentation |
| **Excel** | `.xlsx`, `.xls` | **25 MB** | Exports de données, tableaux volumineux |
| **Archives** | `.zip`, `.rar`, `.7z` | **100 MB** | Collections de fichiers compressés |
| **Vidéos** | `.mp4`, `.avi`, `.mov` | **200 MB** | Contenu multimédia |
| **Autres** | Tous autres types | **10 MB** | Images, documents texte, etc. |

## Fonctionnalités

### ✅ Validation Côté Client
- Vérification de la taille avant upload
- Messages d'erreur informatifs
- Interface visuelle avec codes couleur

### ✅ Validation Côté Serveur
- Double validation pour la sécurité
- Messages d'erreur détaillés
- Support des gros fichiers jusqu'à 250 MB en configuration

### ✅ Interface Utilisateur
- Indication en temps réel des limites
- Couleurs d'état (vert = OK, rouge = trop volumineux)
- Désactivation automatique du bouton d'upload si fichier trop volumineux

## Configuration Technique

- **Next.js** : Configuration optimisée pour les gros fichiers
- **API Routes** : Timeout étendu à 30 secondes
- **Validation** : Double vérification client/serveur

## Tests Recommandés

1. **PDF 30MB** ✅ → Devrait être accepté (limite 50MB)
2. **Excel 15MB** ✅ → Devrait être accepté (limite 25MB)
3. **Archive 50MB** ✅ → Devrait être accepté (limite 100MB)
4. **PDF 60MB** ❌ → Devrait être rejeté (dépasse 50MB)

## Mise à Jour

Date: 29 mai 2025
Version: 2.0
Auteur: Système de Gestion des Usagers
