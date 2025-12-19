/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

// Déclarez une variable globale pour stocker l'instance de PrismaClient
// Cela est nécessaire pour éviter de créer de multiples instances de PrismaClient
// lors du hot-reloading en développement, et pour garantir une instance unique en production.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Initialisez PrismaClient si elle n'existe pas déjà dans l'objet global
export const prisma = global.prisma || new PrismaClient();

// En mode développement, stockez l'instance de PrismaClient dans l'objet global
// pour qu'elle soit réutilisée lors des rechargements à chaud.
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

// Exportez l'instance de PrismaClient
export default prisma;
