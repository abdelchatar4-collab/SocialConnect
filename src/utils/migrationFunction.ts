/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { User } from '@/types';
import {
  MigrationOptions, MigrationResults, LegacyUser, DatabaseInterface, ProgressCallback
} from './migration/migrationTypes';
import { createNewUser, saveBackup } from './migration/migrationHelpers';

export const migrateExistingUsers = (
  existingUsers: LegacyUser[],
  options: MigrationOptions = {}
): MigrationResults => {
  const { createBackup = true, fixInconsistencies = true, logProgress = false } = options;
  const results: MigrationResults = {
    total: existingUsers.length, migrated: 0, warnings: [], errors: [],
    backup: createBackup ? JSON.parse(JSON.stringify(existingUsers)) : null, migratedUsers: []
  };

  const addWarning = (userId: string, message: string) => results.warnings.push({ userId, message });

  existingUsers.forEach((user, index) => {
    try {
      const userId = user.id || user._id || `index_${index}`;
      const tempUser: Partial<User> = { meta: {} };

      ['nom', 'prenom', 'email', 'telephone', 'dateNaissance'].forEach(prop => {
        if (user[prop] !== undefined) (tempUser as any)[prop] = user[prop];
      });

      if (user.mutuelle !== undefined) {
        if (typeof user.mutuelle === 'string') (tempUser.meta as any).mutuelle = { nom: user.mutuelle };
        else if (typeof user.mutuelle === 'object' && user.mutuelle !== null) {
          (tempUser.meta as any).mutuelle = {
            id: user.mutuelle.id || user.mutuelle._id || null,
            nom: user.mutuelle.nom || user.mutuelle.name || "",
            numeroAdherent: user.mutuelle.numeroAdherent || user.mutuelle.number || "",
            dateAdhesion: user.mutuelle.dateAdhesion || user.mutuelle.date || null,
            options: Array.isArray(user.mutuelle.options) ? [...user.mutuelle.options] : (user.mutuelle.options ? [user.mutuelle.options] : [])
          };
        }
      }

      if (user.adresse) {
        if (typeof user.adresse === 'string') tempUser.adresse = { rue: user.adresse, codePostal: "", ville: "", numero: null, boite: null };
        else if (typeof user.adresse === 'object') tempUser.adresse = { rue: user.adresse.rue || user.adresse.street || "", codePostal: user.adresse.codePostal || user.adresse.cp || user.adresse.zipCode || "", ville: user.adresse.ville || user.adresse.city || "", numero: null, boite: null };
      }

      ['emploi', 'famille', 'sante', 'logement', 'preferences'].forEach(objName => {
        if (user[objName]) (tempUser.meta as any)[objName] = { ...user[objName] };
      });

      tempUser.dateCreation = user.dateCreation || user.createdAt || new Date();
      (tempUser.meta as any).source = user.source || "migration";
      if (user.id) tempUser.id = user.id;

      const migratedUser = createNewUser(tempUser);
      if (fixInconsistencies) {
        if (!migratedUser.nom && migratedUser.prenom) { migratedUser.nom = "[Nom manquant]"; addWarning(userId, "Nom manquant"); }
        if (!migratedUser.prenom && migratedUser.nom) { migratedUser.prenom = "[Prénom manquant]"; addWarning(userId, "Prénom manquant"); }
      }

      results.migratedUsers.push(migratedUser);
      results.migrated++;
    } catch (e) {
      results.errors.push({ userId: user.id || user._id || `index_${index}`, message: "Erreur migration", error: String(e) });
    }
  });

  return results;
};

export const applyMigrationToDatabase = async (
  db: DatabaseInterface,
  getUsersCallback: (db: DatabaseInterface) => Promise<LegacyUser[]>,
  saveUserCallback: (db: DatabaseInterface, user: User) => Promise<void>,
  onProgressCallback?: (progress: ProgressCallback) => void
): Promise<MigrationResults> => {
  try {
    const users = await getUsersCallback(db);
    const results = migrateExistingUsers(users, { createBackup: true, fixInconsistencies: true, logProgress: true });

    if (results.backup) {
      const timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
      await saveBackup(db, `users_backup_${timestamp}`, results.backup);
    }

    let savedCount = 0;
    for (let i = 0; i < results.migratedUsers.length; i++) {
      await saveUserCallback(db, results.migratedUsers[i]);
      savedCount++;
      if (onProgressCallback && i % 10 === 0) {
        onProgressCallback({ phase: 'saving', current: i + 1, total: results.migratedUsers.length, percentage: Math.round(((i + 1) / results.migratedUsers.length) * 100) });
      }
    }
    return { ...results, savedCount, success: true };
  } catch (error) {
    return { success: false, error: String(error), total: 0, migrated: 0, warnings: [], errors: [], backup: null, migratedUsers: [], savedCount: 0 };
  }
};
