# 🚨 Guide de résolution des problèmes critiques

## ✅ Problème 1 : PDF Freeze - RÉSOLU ✓

### Cause
Les animations de Noël (et autres thèmes) étaient capturées lors de la génération PDF, causant des freezes.

### Solution appliquée
Ajout de la classe `print:hidden` sur tous les composants d'animation :
- ✅ `HolidayOverlay` (Noël, Halloween, Ramadan, Nouvel An)
- ✅ `BirthdayBanner` (Bannière anniversaire et célébration)

### Test
1. Activez le thème de Noël dans Paramètres
2. Éditez un usager
3. Cliquez sur "PDF" → Le PDF devrait se générer sans freeze
4. Vérifiez que les décorations n'apparaissent PAS dans le PDF

---

## ⚠️ Problème 2 : Authentification bloquée - ACTION REQUISE

### Cause
Le système vérifie si votre email Google existe dans la table `gestionnaires` de la base de données. Si absent, l'accès est refusé (voir `src/lib/authOptions.ts` lignes 68-81).

### Solution - 3 étapes

#### Étape 1 : Modifier le script
Ouvrez `scripts/add-admin.ts` et remplacez :

```typescript
const adminsToAdd = [
  {
    email: 'VOTRE_EMAIL_1@gmail.com',  // ⚠️ REMPLACER PAR VOTRE VRAI EMAIL
    prenom: 'Prénom1',                  // ⚠️ REMPLACER
    nom: 'Nom1',                        // ⚠️ Optionnel
    role: 'ADMIN'
  },
  {
    email: 'VOTRE_EMAIL_2@gmail.com',  // ⚠️ REMPLACER PAR VOTRE 2E EMAIL
    prenom: 'Prénom2',                  // ⚠️ REMPLACER
    nom: 'Nom2',                        // ⚠️ Optionnel
    role: 'ADMIN'
  }
];
```

#### Étape 2 : Exécuter le script
```bash
npx ts-node scripts/add-admin.ts
```

#### Étape 3 : Vérifier
```bash
npx prisma studio
```
Allez dans la table `gestionnaires` et vérifiez que vos emails sont présents avec `role = "ADMIN"`.

#### Étape 4 : Tester
1. Déconnectez-vous de l'application
2. Reconnectez-vous avec votre compte Google
3. Vous devriez maintenant avoir accès ✅

---

## 🔍 Diagnostic supplémentaire

### Si l'authentification ne fonctionne toujours pas

1. **Vérifiez les logs du serveur** :
   ```bash
   # Dans le terminal où tourne npm run dev
   # Recherchez les lignes comme :
   # ❌ Email non autorisé: votre@email.com
   # ✅ Gestionnaire autorisé: votre@email.com (ADMIN)
   ```

2. **Vérifiez la base de données** :
   ```bash
   npx prisma studio
   ```
   Table `gestionnaires` → Cherchez votre email → Vérifiez que `role = "ADMIN"`

3. **Testez en mode dev** :
   En développement local (`npm run dev`), vous pouvez utiliser le compte temporaire :
   - Email : `admin@dev.local`
   - Cela bypass l'authentification Google

---

## 📝 Notes importantes

### Variables d'environnement
Assurez-vous que votre `.env.local` contient :
```env
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
DATABASE_URL=votre_connection_string
```

### Rôles disponibles
- `ADMIN` : Accès complet (recommandé pour vous)
- `USER` : Accès limité

### Cloudflare Access
Si vous utilisez Cloudflare Access en production, le script `add-admin.ts` fonctionne aussi. Les emails doivent juste être dans la table `gestionnaires`.

---

## 🆘 Si rien ne fonctionne

**Contactez-moi avec :**
1. Les logs du serveur (la partie avec les ✅ ou ❌)
2. Un screenshot de la table `gestionnaires` dans Prisma Studio
3. L'email exact que vous utilisez pour vous connecter

Je débloquerai la situation immédiatement !
