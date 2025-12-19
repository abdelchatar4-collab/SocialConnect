/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import type { User } from '@/types/user';

export function preprocessUserData(user: User): User {
  const modifiedUser = { ...user };

  // Si le secteur est null ou undefined ET que l'antenne existe (nouvelle logique)
  // if (modifiedUser.secteur == null && modifiedUser.importedAt) { // <-- ANCIENNE LIGNE ERRONÉE
  if (modifiedUser.secteur == null && modifiedUser.antenne) { // <-- NOUVELLE CONDITION
    modifiedUser.secteur = modifiedUser.antenne;
  }

  // ... (autres logiques de prétraitement si nécessaire) ...

  return modifiedUser;
}
