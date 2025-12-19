/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

// src/utils/migrationFunction.ts

import { User } from '@/types';

// Types pour la migration
export interface MigrationOptions {
  createBackup?: boolean;
  validateAfterMigration?: boolean;
  fixInconsistencies?: boolean;
  logProgress?: boolean;
}

export interface MigrationWarning {
  userId: string;
  message: string;
}

export interface MigrationError {
  userId: string;
  message: string;
  error?: string;
}

export interface MigrationResults {
  total: number;
  migrated: number;
  warnings: MigrationWarning[];
  errors: MigrationError[];
  backup: any[] | null;
  migratedUsers: User[];
  savedCount?: number;
  success?: boolean;
  error?: string;
}

export interface ProgressCallback {
  phase: 'saving' | 'migrating';
  current: number;
  total: number;
  percentage: number;
}

export interface LegacyUser {
  id?: string;
  _id?: string;
  nom?: string | null;
  prenom?: string | null;
  email?: string | null;
  telephone?: string | null;
  dateNaissance?: string | Date | null;
  mutuelle?: string | null | {
    id?: string | null;
    _id?: string | null;
    nom?: string | null;
    name?: string | null;
    numeroAdherent?: string | null;
    number?: string | null;
    dateAdhesion?: string | Date | null;
    date?: string | Date | null;
    options?: any[] | any | null;
  };
  adresse?: string | null | {
    rue?: string | null;
    street?: string | null;
    codePostal?: string | null;
    cp?: string | null;
    zipCode?: string | null;
    ville?: string | null;
    city?: string | null;
    pays?: string | null;
    country?: string | null;
  };
  emploi?: any;
  famille?: any;
  sante?: any;
  logement?: any;
  preferences?: any;
  dateCreation?: string | Date | null;
  createdAt?: string | Date | null;
  source?: string;
  [key: string]: any; // Pour les propriétés non typées
}

export interface DatabaseInterface {
  collection?: (name: string) => {
    insertOne: (doc: any) => Promise<any>;
  };
  [key: string]: any;
}

// Fonction mock pour créer un nouvel utilisateur (à remplacer par l'import réel)
const createNewUser = (userData: Partial<User>): User => {
  const now = new Date();
  return {
    id: userData.id || crypto.randomUUID(),
    nom: userData.nom || null,
    prenom: userData.prenom || null,
    email: userData.email || null,
    telephone: userData.telephone || null,
    dateNaissance: userData.dateNaissance || null,
    genre: userData.genre || null,
    adresseId: userData.adresseId || null,
    dateOuverture: userData.dateOuverture || now,
    dateCloture: userData.dateCloture || null,
    etat: userData.etat || 'Actif',
    antenne: userData.antenne || null,
    statutSejour: userData.statutSejour || null,
    gestionnaire: userData.gestionnaire || null,
    nationalite: userData.nationalite || null,
    trancheAge: userData.trancheAge || null,
    remarques: userData.remarques || null,
    secteur: userData.secteur || null,
    langue: userData.langue || null,
    premierContact: userData.premierContact || null,
    notesGenerales: userData.notesGenerales || null,
    hasPrevExp: userData.hasPrevExp || null,
    prevExpDateReception: userData.prevExpDateReception || null,
    prevExpDateRequete: userData.prevExpDateRequete || null,
    prevExpDateVad: userData.prevExpDateVad || null,
    prevExpDecision: userData.prevExpDecision || null,
    prevExpCommentaire: userData.prevExpCommentaire || null,
    logementDetails: userData.logementDetails || null,
    adresse: userData.adresse || null,
    problematiques: userData.problematiques || [],
    actionsSuivi: userData.actionsSuivi || [],
    dateCreation: userData.dateCreation || now,
    derniereModification: userData.derniereModification || now,
    meta: userData.meta || {}
  };
};

/**
 * Fonction pour migrer les données utilisateur existantes vers le nouveau format
 */
export const migrateExistingUsers = (
  existingUsers: LegacyUser[],
  options: MigrationOptions = {}
): MigrationResults => {
  const {
    createBackup = true,
    validateAfterMigration = true,
    fixInconsistencies = true,
    logProgress = false
  } = options;

  const results: MigrationResults = {
    total: existingUsers.length,
    migrated: 0,
    warnings: [],
    errors: [],
    backup: createBackup ? [] : null,
    migratedUsers: []
  };

  // Créer une sauvegarde si demandé
  if (createBackup) {
    results.backup = JSON.parse(JSON.stringify(existingUsers));
  }

  // Fonction utilitaire pour ajouter un avertissement
  const addWarning = (userId: string, message: string): void => {
    if (logProgress) console.warn(`User ${userId}: ${message}`);
    results.warnings.push({ userId, message });
  };

  // Fonction utilitaire pour ajouter une erreur
  const addError = (userId: string, message: string, error?: Error): void => {
    if (logProgress) console.error(`User ${userId}: ${message}`, error);
    results.errors.push({ userId, message, error: error?.toString() });
  };

  // Pour chaque utilisateur existant
  existingUsers.forEach((user, index) => {
    try {
      if (logProgress && index % 100 === 0) {
        console.log(`Migration en cours: ${index}/${existingUsers.length}`);
      }

      // Identifier l'utilisateur pour les logs
      const userId = user.id || user._id || `index_${index}`;

      // Créer un objet utilisateur temporaire pour la migration
      const tempUser: Partial<User> = {};

      // Mapper les propriétés de base directement
      const simpleProps: (keyof LegacyUser)[] = [
        'nom', 'prenom', 'email', 'telephone', 'dateNaissance'
      ];

      simpleProps.forEach(prop => {
        if (user[prop] !== undefined) {
          (tempUser as any)[prop] = user[prop];
        }
      });

      // Traitement spécial pour la mutuelle qui a causé des problèmes
      if (user.mutuelle !== undefined) {
        // Note: Le type User actuel n'a pas de propriété mutuelle
        // On pourrait l'ajouter aux meta ou créer un champ séparé
        tempUser.meta = tempUser.meta || {};

        if (typeof user.mutuelle === 'string') {
          // La mutuelle était une chaîne simple
          (tempUser.meta as any).mutuelle = { nom: user.mutuelle };
        } else if (typeof user.mutuelle === 'object' && user.mutuelle !== null) {
          // La mutuelle était déjà un objet
          (tempUser.meta as any).mutuelle = {
            id: user.mutuelle.id || user.mutuelle._id || null,
            nom: user.mutuelle.nom || user.mutuelle.name || "",
            numeroAdherent: user.mutuelle.numeroAdherent || user.mutuelle.number || "",
            dateAdhesion: user.mutuelle.dateAdhesion || user.mutuelle.date || null,
            options: []
          };

          // Si des options sont présentes, les conserver
          if (Array.isArray(user.mutuelle.options)) {
            (tempUser.meta as any).mutuelle.options = [...user.mutuelle.options];
          } else if (user.mutuelle.options) {
            (tempUser.meta as any).mutuelle.options = [user.mutuelle.options];
          } else {
            (tempUser.meta as any).mutuelle.options = [];
          }
        } else {
          // Type de mutuelle non reconnu
          addWarning(userId, `Type de mutuelle non reconnu: ${typeof user.mutuelle}`);
        }
      }

      // Traitement de l'adresse
      if (user.adresse) {
        if (typeof user.adresse === 'string') {
          // L'adresse était une chaîne simple, la mettre dans rue
          tempUser.adresse = {
            rue: user.adresse,
            codePostal: "",
            ville: "",
            numero: null,
            boite: null
          };
        } else if (typeof user.adresse === 'object') {
          // L'adresse était un objet, mapper les propriétés
          tempUser.adresse = {
            rue: user.adresse.rue || user.adresse.street || "",
            codePostal: user.adresse.codePostal || user.adresse.cp || user.adresse.zipCode || "",
            ville: user.adresse.ville || user.adresse.city || "",
            numero: null,
            boite: null
          };
        }
      }

      // Traitement d'autres objets imbriqués (les stocker dans meta)
      const nestedObjects = [
        'emploi', 'famille', 'sante', 'logement', 'preferences'
      ];

      tempUser.meta = tempUser.meta || {};
      nestedObjects.forEach(objName => {
        if (user[objName]) {
          (tempUser.meta as any)[objName] = { ...user[objName] };
        }
      });

      // Conserver les métadonnées importantes
      tempUser.dateCreation = user.dateCreation || user.createdAt || new Date();
      tempUser.derniereModification = new Date();

      if (!tempUser.meta) tempUser.meta = {};
      (tempUser.meta as any).source = user.source || "migration";
      (tempUser.meta as any).version = 1;

      // Conserver l'ID original si présent
      if (user.id) tempUser.id = user.id;

      // Créer un nouvel utilisateur en utilisant notre modèle
      const migratedUser = createNewUser(tempUser);

      // Corriger les incohérences si l'option est activée
      if (fixInconsistencies) {
        // S'assurer que les propriétés requises ont des valeurs par défaut sensées
        if (!migratedUser.nom && migratedUser.prenom) {
          migratedUser.nom = "[Nom manquant]";
          addWarning(userId, "Nom manquant, valeur par défaut ajoutée");
        }

        if (!migratedUser.prenom && migratedUser.nom) {
          migratedUser.prenom = "[Prénom manquant]";
          addWarning(userId, "Prénom manquant, valeur par défaut ajoutée");
        }

        // Gérer les cas où l'email est invalide
        if (migratedUser.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(migratedUser.email)) {
            addWarning(userId, `Email invalide: ${migratedUser.email}`);
            // Ne pas corriger automatiquement l'email pour éviter de perdre l'information
          }
        }
      }

      // Ajouter l'utilisateur migré à la liste
      results.migratedUsers.push(migratedUser);
      results.migrated++;

    } catch (error) {
      const userId = user?.id || user?._id || `index_${index}`;
      addError(userId, "Erreur lors de la migration", error as Error);

      // Ajouter quand même l'utilisateur original pour ne pas perdre de données
      if (fixInconsistencies) {
        try {
          // Tenter de créer un utilisateur minimal valide
          const fallbackUser = createNewUser({
            nom: user.nom || "[Récupération après erreur]",
            prenom: user.prenom || "[Récupération après erreur]",
            email: user.email || "",
            meta: {
              source: "migration_error_recovery",
              originalData: JSON.stringify(user)
            }
          });

          results.migratedUsers.push(fallbackUser);
          addWarning(userId, "Utilisateur récupéré partiellement après erreur");
        } catch (fallbackError) {
          addError(userId, "Impossible de récupérer l'utilisateur après erreur", fallbackError as Error);
        }
      }
    }
  });

  if (logProgress) {
    console.log(`Migration terminée: ${results.migrated}/${results.total} utilisateurs migrés`);
    console.log(`Avertissements: ${results.warnings.length}`);
    console.log(`Erreurs: ${results.errors.length}`);
  }

  return results;
};

/**
 * Fonction pour appliquer la migration à une base de données
 */
export const applyMigrationToDatabase = async (
  db: DatabaseInterface,
  getUsersCallback: (db: DatabaseInterface) => Promise<LegacyUser[]>,
  saveUserCallback: (db: DatabaseInterface, user: User) => Promise<void>,
  onProgressCallback?: (progress: ProgressCallback) => void
): Promise<MigrationResults> => {
  try {
    // Récupérer tous les utilisateurs
    const users = await getUsersCallback(db);

    // Options de migration
    const options: MigrationOptions = {
      createBackup: true,
      validateAfterMigration: true,
      fixInconsistencies: true,
      logProgress: true
    };

    // Effectuer la migration
    const migrationResults = migrateExistingUsers(users, options);

    // Sauvegarder la sauvegarde avant de modifier les données
    if (migrationResults.backup) {
      const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
      const backupName = `users_backup_${timestamp}`;

      try {
        // Cette fonction dépendra de votre système de stockage
        await saveBackup(db, backupName, migrationResults.backup);
        console.log(`Sauvegarde créée: ${backupName}`);
      } catch (backupError) {
        console.error("Erreur lors de la création de la sauvegarde:", backupError);
        // Continuer malgré l'erreur de sauvegarde
      }
    }

    // Sauvegarder les utilisateurs migrés
    let savedCount = 0;
    const totalToSave = migrationResults.migratedUsers.length;

    for (let i = 0; i < totalToSave; i++) {
      const user = migrationResults.migratedUsers[i];

      try {
        await saveUserCallback(db, user);
        savedCount++;

        // Appeler le callback de progression si fourni
        if (onProgressCallback && i % 10 === 0) {
          onProgressCallback({
            phase: 'saving',
            current: i + 1,
            total: totalToSave,
            percentage: Math.round(((i + 1) / totalToSave) * 100)
          });
        }
      } catch (saveError) {
        console.error(`Erreur lors de la sauvegarde de l'utilisateur ${user.id || i}:`, saveError);
      }
    }

    return {
      ...migrationResults,
      savedCount,
      success: true
    };
  } catch (error) {
    console.error("Erreur lors de la migration:", error);
    return {
      success: false,
      error: (error as Error).toString(),
      total: 0,
      migrated: 0,
      warnings: [],
      errors: [],
      backup: null,
      migratedUsers: [],
      savedCount: 0
    };
  }
};

/**
 * Fonction auxiliaire pour sauvegarder une sauvegarde
 * Doit être adaptée en fonction de votre système de stockage
 */
const saveBackup = async (
  db: DatabaseInterface,
  backupName: string,
  data: any[]
): Promise<boolean | { backupName: string; data: any[] }> => {
  // Exemple pour MongoDB
  if (db.collection) {
    await db.collection('backups').insertOne({
      _id: backupName,
      data: data,
      timestamp: new Date(),
      type: 'users_migration'
    });
    return true;
  }

  // En environnement frontend, on ne peut pas sauvegarder directement
  // mais on peut retourner les données pour que le parent les gère
  console.log("Backup data (to be handled by parent component):", {backupName, data});
  return {backupName, data};
};
