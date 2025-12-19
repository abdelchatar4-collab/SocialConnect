/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { User, Gestionnaire } from '@/types/user';

// Styles simplifiés et efficaces
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#3b82f6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 70,
    height: 50,
    marginRight: 20,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 3,
  },
  etatBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  // Sections en vignettes
  section: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  sectionHeader: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937', // Plus foncé
    textAlign: 'left',
  },
  sectionContent: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  col: {
    flex: 1,
    marginRight: 20,
  },
  label: {
    fontSize: 12, // Augmenté de 11 à 12
    fontWeight: 'bold',
    color: '#4b5563', // Couleur plus foncée
    marginBottom: 4,
  },
  value: {
    fontSize: 13,
    color: '#111827',
    lineHeight: 1.4,
  },
  // Items optimisés pour l'impression noir et blanc
  problematiqueItem: {
    marginBottom: 12,
    padding: 12,
    // REMPLACER l'arrière-plan coloré par des bordures
    backgroundColor: '#ffffff', // Blanc pour l'impression
    borderRadius: 6,
    borderWidth: 2, // Bordure plus épaisse
    borderColor: '#374151', // Gris foncé visible en N&B
    borderLeftWidth: 6, // Bordure gauche épaisse pour distinction
    borderLeftColor: '#000000', // Noir pour maximum de contraste
  },

  actionItem: {
    marginBottom: 12,
    padding: 12,
    // MÊME traitement pour les actions
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6b7280', // Gris moyen
    borderLeftWidth: 6,
    borderLeftColor: '#4b5563', // Gris foncé pour distinction
  },

  // NOUVEAU style pour les titres de problématiques/actions
  itemTitleProblematique: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000', // Noir pour maximum de contraste
    marginBottom: 4,
    textDecoration: 'underline', // Soulignement pour plus de visibilité
  },

  itemTitleAction: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151', // Gris très foncé
    marginBottom: 4,
  },

  // NOUVEAU style pour identifier les types visuellement
  typeIndicator: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    backgroundColor: '#f3f4f6', // Gris très clair
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#000000',
  },

  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  itemContent: {
    fontSize: 12,
    color: '#111827',
    marginTop: 4,
  },
});

interface UserPDFDocumentProps {
  user: User;
  gestionnairesList: Gestionnaire[];
}

const UserPDFDocument: React.FC<UserPDFDocumentProps> = ({ user, gestionnairesList }) => {
  // Fonction sécurisée pour afficher les valeurs
  const safeValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    return String(value).trim() || '—';
  };

  // Formatage des dates
  const formatDate = (date: any): string => {
    if (!date) return '—';
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  // Gestionnaire avec sécurité
  const getGestionnaireNom = (gestionnaireValue: any): string => {
    if (!gestionnaireValue) return '—';

    // Si c'est un objet (relation incluse par Prisma)
    if (typeof gestionnaireValue === 'object' && gestionnaireValue !== null) {
      const gestObj = gestionnaireValue as { prenom?: string | null; nom?: string | null; id?: string };
      const fullName = `${gestObj.prenom || ''} ${gestObj.nom || ''}`.trim();
      // Si le nom complet est vide, afficher l'ID si disponible, sinon '—'
      return fullName || (gestObj.id ? String(gestObj.id) : '—');
    }

    // Si c'est un ID (string), chercher dans la liste des gestionnaires
    if (typeof gestionnaireValue === 'string') {
      const foundGestionnaire = gestionnairesList.find(g => g.id === gestionnaireValue);
      if (foundGestionnaire) {
        const fullName = `${foundGestionnaire.prenom || ''} ${foundGestionnaire.nom || ''}`.trim();
        return fullName || '—';
      }
      // Si on ne trouve pas, afficher l'ID
      return String(gestionnaireValue) || '—';
    }

    // Cas par défaut (type inattendu)
    return '—';
  };

  // Badge pour l'état
  const getEtatStyle = (etat: string) => {
    const colors = {
      'actif': { bg: '#dcfce7', text: '#166534' },
      'en attente': { bg: '#fef3c7', text: '#92400e' },
      'suspendu': { bg: '#fed7d7', text: '#9b2c2c' },
      'clôturé': { bg: '#f3f4f6', text: '#374151' },
    };

    const color = (colors as Record<string, { bg: string; text: string }>)[etat?.toLowerCase() || ''] || colors['clôturé'];

    return {
      ...styles.etatBadge,
      backgroundColor: color.bg,
      color: color.text,
    };
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête avec logo */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
              style={styles.logo}
              src="/logo-accueil-social.png"
            />
            <View style={styles.headerInfo}>
              <Text style={styles.title}>Fiche Usager</Text>
              <Text style={styles.subtitle}>
                {safeValue(user.prenom)} {safeValue(user.nom)}
              </Text>
              <Text style={styles.subtitle}>
                Dossier N° {safeValue(user.id)} • {formatDate(new Date())}
              </Text>
            </View>
          </View>
          <View style={getEtatStyle(safeValue(user.etat))}>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
              {safeValue(user.etat).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Informations personnelles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Nom de famille</Text>
                <Text style={styles.value}>{safeValue(user.nom)}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Prénom</Text>
                <Text style={styles.value}>{safeValue(user.prenom)}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Date de naissance</Text>
                <Text style={styles.value}>{formatDate(user.dateNaissance)}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Genre</Text>
                <Text style={styles.value}>{safeValue(user.genre)}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Nationalité</Text>
                <Text style={styles.value}>{safeValue(user.nationalite)}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Statut de séjour</Text>
                <Text style={styles.value}>{safeValue(user.statutSejour)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Coordonnées</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{safeValue(user.email)}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Téléphone</Text>
                <Text style={styles.value}>{safeValue(user.telephone)}</Text>
              </View>
            </View>

            {user.adresse && (
              <View>
                <Text style={styles.label}>Adresse complète</Text>
                <Text style={styles.value}>
                  {safeValue(user.adresse.numero)} {safeValue(user.adresse.rue)}
                </Text>
                <Text style={styles.value}>
                  {safeValue(user.adresse.codePostal)} {safeValue(user.adresse.ville)}
                </Text>
                {user.adresse.boite && (
                  <Text style={styles.value}>Boîte: {safeValue(user.adresse.boite)}</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Informations administratives */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dossier administratif</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Antenne</Text>
                <Text style={styles.value}>{safeValue(user.antenne)}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Secteur</Text>
                <Text style={styles.value}>{safeValue(user.secteur)}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Gestionnaire</Text>
                <Text style={styles.value}>{getGestionnaireNom(user.gestionnaire)}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Date d&apos;ouverture</Text>
                <Text style={styles.value}>{formatDate(user.dateOuverture)}</Text>
              </View>
            </View>

            {user.dateCloture && (
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Date de clôture</Text>
                  <Text style={styles.value}>{formatDate(user.dateCloture)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Problématiques - OPTIMISÉ POUR IMPRESSION */}
        {user.problematiques && user.problematiques.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⚠ Problématiques identifiées</Text>
            </View>
            <View style={styles.sectionContent}>
              {user.problematiques.map((prob, index) => (
                <View key={index} style={styles.problematiqueItem}>
                  {/* Indicateur visuel du type */}
                  <View style={styles.typeIndicator}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                      PROBLÉMATIQUE #{index + 1}
                    </Text>
                  </View>
                  <Text style={styles.itemTitleProblematique}>
                    Type: {safeValue(prob.type)}
                  </Text>
                  <Text style={styles.itemContent}>
                    Description: {safeValue(prob.description)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions - OPTIMISÉ POUR IMPRESSION */}
        {user.actions && user.actions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📋 Actions et suivi</Text>
            </View>
            <View style={styles.sectionContent}>
              {user.actions.slice(0, 5).map((action, index) => (
                <View key={index} style={styles.actionItem}>
                  {/* Indicateur visuel de l'action */}
                  <View style={styles.typeIndicator}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                      ACTION #{index + 1}
                    </Text>
                  </View>
                  <Text style={styles.itemTitleAction}>
                    {formatDate(action.date)} - {safeValue(action.type)}
                  </Text>
                  {action.partenaire && (
                    <Text style={styles.itemContent}>
                      • Partenaire: {safeValue(action.partenaire)}
                    </Text>
                  )}
                  {action.description && (
                    <Text style={styles.itemContent}>
                      • Description: {safeValue(action.description)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Notes générales */}
        {user.notesGenerales && safeValue(user.notesGenerales) !== '—' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Notes</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.value}>{safeValue(user.notesGenerales)}</Text>
            </View>
          </View>
        )}

        {/* Pied de page */}
        <Text style={styles.footer}>
          Document confidentiel • Service d&apos;Accueil Social • Généré le {formatDate(new Date())} à {new Date().toLocaleTimeString('fr-FR')}
        </Text>
      </Page>
    </Document>
  );
};

export default UserPDFDocument;
