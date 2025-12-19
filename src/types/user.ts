/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

// PAS DE 'export {};' ici

// Définition UNIQUE pour Mutuelle
export interface Mutuelle {
  id?: string | null;
  nom?: string | null;
  numeroAdherent?: string | null;
  dateAdhesion?: string | Date | null;
  options?: string[] | null;
}

// Définition pour DocumentType
export interface DocumentType {
  id?: string;
  nom: string;
  type: 'pdf' | 'excel' | 'word' | 'image' | 'archive' | 'other';
  taille?: number;
  dateCreation?: Date | string | null;
  dateModification?: Date | string | null;
  chemin?: string;
  userId?: string;
}

// Définition pour MetaData
export interface MetaData {
  version?: string;
  source?: string;
  importedAt?: Date | string | null;
  lastSync?: Date | string | null;
  tags?: string[];
  notes?: string;
  [key: string]: any; // Pour permettre des propriétés dynamiques
}

// Définition UNIQUE pour Gestionnaire
export interface Gestionnaire {
  id: string;
  prenom: string;
  nom: string | null;
  email?: string | null; // Adding email property
  role?: string | null; // Adding role property
  couleurMedaillon?: string | null; // Stocké comme JSON string dans la BD
  // ... autres champs si nécessaire
}

// Définition UNIQUE pour Adresse
export interface Adresse {
  id?: string;
  rue?: string | null;
  numero?: string | null;
  boite?: string | null;
  codePostal?: string | null;
  ville?: string | null;
  quartier?: string | null;
  pays?: string | null;
  secteur?: string | null;
  userId?: string;
}

// Définition UNIQUE pour LogementDetails - Form version with required fields
export interface LogementDetailsForm {
  id?: string;
  type: string; // Type de logement - required
  statut: string; // Statut du logement - required
  nombrePieces: number; // Nombre de pièces - required
  typeLogement: string; // required
  dateEntree: string; // required
  dateSortie: string; // required
  motifSortie: string; // required
  destinationSortie: string; // required
  proprietaire: string; // required
  bailleur: string; // required
  loyer: string; // required
  charges: string; // required
  commentaire: string; // required
  commentaires: string; // required
  userId?: string;
  hasLitige: boolean; // required

  // Nouveaux champs à ajouter
  bailEnregistre?: string;
  dateContrat?: string;
  dureeContrat?: string;
  garantieLocative?: string;
  statutGarantie?: string;
  typeLitige?: string;
  dateLitige?: string;
  descriptionLitige?: string;
  actionsPrises?: string;
  datePreavis?: string;
  dureePreavis?: string; // Ajout du champ manquant
  preavisPour?: string;
}

// Définition UNIQUE pour LogementDetails
export interface LogementDetails {
  id?: string;
  type?: string; // Type de logement
  statut?: string; // Statut du logement
  nombrePieces?: number; // Nombre de pièces
  typeLogement?: string;
  dateEntree?: string;
  dateSortie?: string;
  motifSortie?: string | null;
  destinationSortie?: string | null;
  proprietaire?: string | null;
  bailleur?: string | null; // Ajout du champ bailleur
  loyer?: string | null;
  charges?: string | null;
  commentaire?: string | null;
  commentaires?: string | null; // Alias pour commentaire
  userId?: string;

  // Nouveaux champs à ajouter
  bailEnregistre?: string;
  dateContrat?: string;
  dureeContrat?: string;
  garantieLocative?: string;
  statutGarantie?: string;
  hasLitige?: boolean;
  typeLitige?: string;
  dateLitige?: string;
  descriptionLitige?: string;
  actionsPrises?: string;
  datePreavis?: string;
  dureePreavis?: string; // Ajout du champ manquant
  preavisPour?: string;
}

// Définition UNIQUE pour Problematique
export interface Problematique {
  id?: string;
  type: string;
  description: string;
  dateSignalement: string; // string ISO (ex: "2024-06-04T00:00:00.000Z")
  detail?: string | null;
  userId?: string;
}

// Définition UNIQUE pour ActionSuivi
export interface ActionSuivi {
  id?: string;
  date?: string | Date | null;
  type?: string | null;
  titre?: string | null; // Title of the action
  statut?: string | null; // Status: en cours, terminé, annulé
  priorite?: string | null; // Priority: haute, moyenne, basse
  echeance?: string | Date | null; // Due date
  responsable?: string | null; // Person responsible
  description?: string | null;
  partenaire?: string | null;
  userId?: string;
}

// Définition UNIQUE pour User
export interface User {
  id: string;
  nom?: string | null;
  prenom?: string | null;
  dateNaissance?: Date | string | null;
  genre?: string | null;
  telephone?: string | null;
  email?: string | null;
  adresseId?: string | null;
  dateOuverture?: Date | string | null;
  dateCloture?: Date | string | null;
  etat?: string | null;
  antenne?: string | null;
  statutSejour?: string | null;
  gestionnaire?: Gestionnaire | string | null;
  nationalite?: string | null;
  trancheAge?: string | null;
  remarques?: string | null;
  secteur?: string | null;
  langue?: string | null;
  situationProfessionnelle?: string | null;
  revenus?: string | null;
  premierContact?: string | null;
  notesGenerales?: string | null;
  problematiquesDetails?: string | null;
  hasPrevExp?: boolean | null;
  prevExpDateReception?: Date | string | null;
  prevExpDateRequete?: Date | string | null;
  prevExpDateVad?: Date | string | null;
  prevExpMotifRequete?: string | null;
  prevExpDateAudience?: Date | string | null;
  prevExpDateSignification?: Date | string | null;
  prevExpDateJugement?: Date | string | null;
  prevExpDateExpulsion?: Date | string | null;
  prevExpDossierOuvert?: string | null; // Nouveau champ
  prevExpDecision?: string | null;
  prevExpCommentaire?: string | null;
  prevExpDemandeCpas?: string | null;
  prevExpNegociationProprio?: string | null;
  prevExpSolutionRelogement?: string | null;
  prevExpMaintienLogement?: string | null;
  prevExpTypeFamille?: string | null;
  prevExpTypeRevenu?: string | null;
  prevExpEtatLogement?: string | null;
  prevExpNombreChambre?: string | null;
  prevExpAideJuridique?: string | null;
  logementDetails?: LogementDetails | string | null;
  adresse?: Adresse | null;
  documents?: DocumentType[] | null;
  meta?: MetaData | null;
  problematiques?: Problematique[] | null;
  actions?: ActionSuivi[] | null;
  actionsSuivi?: ActionSuivi[] | null;
  rgpdAttestationGeneratedAt?: Date | string | null;
  mutuelle?: Mutuelle | null;
  informationImportante?: string | null;
  partenaire?: string | null;
  // Nouveaux champs pour les données confidentielles
  afficherDonneesConfidentielles?: boolean | null;
  donneesConfidentielles?: string | null;
  // Champs de métadonnées
  dateCreation?: Date | string | null;
  derniereModification?: Date | string | null;
  // Champs d'audit (traçabilité)
  createdBy?: string | null;
  createdAt?: Date | string | null;
  updatedBy?: string | null;
  updatedAt?: Date | string | null;
}

// Définition UNIQUE pour UserFormData
export interface UserFormData {
  id?: string;
  nom: string;
  prenom: string;
  genre: string;
  telephone: string;
  email: string;
  statutSejour: string;
  gestionnaire: string;
  nationalite: string;
  trancheAge: string;
  remarques: string;
  secteur: string;
  langue: string;
  situationProfessionnelle: string;
  revenus: string;
  premierContact: string;
  notesGenerales: string;
  etat: string;
  antenne: string;
  dateNaissance: string;
  dateOuverture: string;
  dateCloture: string;
  partenaire?: Array<{ id: string; nom: string }> | null;
  adresse: Adresse;
  hasPrevExp: boolean;
  prevExpDateReception: string;
  prevExpDateRequete: string;
  prevExpDateVad: string;
  prevExpMotifRequete: string;
  prevExpDateAudience: string;
  prevExpDateSignification: string;
  prevExpDateJugement: string;
  prevExpDateExpulsion?: string;
  prevExpDossierOuvert?: string; // Nouveau champ
  prevExpDecision?: string;
  prevExpCommentaire: string;
  prevExpDemandeCpas: string;
  prevExpNegociationProprio: string;
  prevExpSolutionRelogement: string;
  prevExpMaintienLogement: string;
  prevExpTypeFamille: string;
  prevExpTypeRevenu: string;
  prevExpEtatLogement: string;
  prevExpNombreChambre: string;
  prevExpAideJuridique: string;
  logementDetails: LogementDetailsForm;
  problematiques: Problematique[];
  problematiquesDetails: string;
  actions: ActionSuivi[];
  informationImportante: string;
  mutuelle?: Mutuelle | null;
  rgpdAttestationGeneratedAt?: Date | string | null;
  // Nouveaux champs pour les données confidentielles
  afficherDonneesConfidentielles: boolean; // Case à cocher pour afficher le champ
  donneesConfidentielles: string; // Champ pour les données confidentielles
  // Champs d'audit (traçabilité)
  createdBy?: string | null;
  createdAt?: Date | string | null;
  updatedBy?: string | null;
  updatedAt?: Date | string | null;
}



export type MappingData = {
  [key: string]: string[] | Record<string, any> | undefined;
  rueVersCodePostalEtCommune?: string[] | Record<string, any>;
};

// AJOUTER CETTE INTERFACE
export interface AppUser {
  id: string;
  // nom?: string | null; // Exemple si vous avez ces champs
  // prenom?: string | null; // Exemple
  // email?: string | null; // Exemple
  role?: string; // Assurez-vous que cette propriété correspond à ce que votre backend retourne
  // Ajoutez d'autres propriétés spécifiques à l'utilisateur de l'application si nécessaire
}

// Exemple d'objet UserFormData avec les nouveaux champs
const exampleUserFormData: UserFormData = {
  id: '123',
  nom: 'Doe',
  prenom: 'John',
  genre: 'M',
  telephone: '0123456789',
  email: 'john.doe@example.com',
  statutSejour: 'Titulaire',
  gestionnaire: '456',
  nationalite: 'Française',
  trancheAge: '30-39',
  remarques: 'Aucune',
  secteur: 'Informatique',
  langue: 'Français',
  situationProfessionnelle: 'Salarié',
  revenus: 'Salaire',
  premierContact: '2023-01-01',
  notesGenerales: 'Client depuis 2023',
  etat: 'Actif',
  antenne: 'Antenne 1',
  dateNaissance: '1990-01-01',
  dateOuverture: '2023-01-01',
  dateCloture: '2023-12-31',
  partenaire: [{ id: 'partenaire-exemple-id', nom: 'Partenaire exemple' }], // Modifier pour être un tableau d'objets
  adresse: {
    rue: '1 rue de la Paix',
    numero: '1',
    boite: 'A',
    codePostal: '75001',
    ville: 'Paris',
    quartier: 'Centre',
    pays: 'France',
    secteur: 'Centre',
  },
  hasPrevExp: true,
  prevExpDateReception: '2023-01-10',
  prevExpDateRequete: '2023-01-15',
  prevExpDateVad: '2023-01-20',
  prevExpMotifRequete: '',
  prevExpDateAudience: '',
  prevExpDateSignification: '',
  prevExpDateJugement: '',
  prevExpDateExpulsion: '',
  prevExpDecision: 'Accepté',
  prevExpCommentaire: 'Bonne expérience',
  prevExpDemandeCpas: '',
  prevExpNegociationProprio: '',
  prevExpSolutionRelogement: '',
  prevExpMaintienLogement: '',
  prevExpTypeFamille: '',
  prevExpTypeRevenu: '',
  prevExpEtatLogement: '',
  prevExpNombreChambre: '',
  prevExpAideJuridique: '',
  logementDetails: {
    type: '',
    statut: '',
    nombrePieces: 0,
    bailleur: '',
    commentaires: '',
    typeLogement: '',
    dateEntree: '',
    dateSortie: '',
    motifSortie: '',
    destinationSortie: '',
    proprietaire: '',
    loyer: '',
    charges: '',
    commentaire: '',
    hasLitige: false,
    bailEnregistre: '',
    typeLitige: '',
    dateLitige: '',
    descriptionLitige: '',
    actionsPrises: '',
    dateContrat: '',
    dureeContrat: '',
    datePreavis: '',
    dureePreavis: '',
    preavisPour: '',
  },
  problematiques: [],
  problematiquesDetails: '',
  actions: [],
  informationImportante: '', // Ajouter cette ligne
  afficherDonneesConfidentielles: false, // Ajouter ce champ
  donneesConfidentielles: '', // Ajouter ce champ
  rgpdAttestationGeneratedAt: '2023-01-01',
  mutuelle: {
    id: '1',
    nom: 'Mutuelle Générale',
    numeroAdherent: 'MG123456',
    dateAdhesion: '2023-01-01',
    options: ['Opt1', 'Opt2'],
  },
};
