/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { GestionnaireOperations } from './api/gestionnaires';
export type { ApiResponse, BulkDeleteRequest, PaginationParams, User, UserFormData, Gestionnaire } from './apiClient.types';

/**
 * API Client centralisé - Instance Singleton
 */
export class ApiClient extends GestionnaireOperations {
  private static instance: ApiClient;

  private constructor() {
    super();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) ApiClient.instance = new ApiClient();
    return ApiClient.instance;
  }
}

export const apiClient = ApiClient.getInstance();
