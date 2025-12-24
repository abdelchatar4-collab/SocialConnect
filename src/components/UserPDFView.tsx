/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Composant de génération PDF pour les fiches usager
*/

import React from 'react';
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { User, Gestionnaire } from '@/types/user';
import { formatDate } from '@/utils/formatters';
import { pdfStyles as styles, getEtatStyle, safeValue } from './UserPDFStyles';

interface UserPDFDocumentProps {
  user: User;
  gestionnairesList: Gestionnaire[];
  showAntenne?: boolean;
}

const UserPDFDocument: React.FC<UserPDFDocumentProps> = ({ user, gestionnairesList, showAntenne = true }) => {
  // Gestionnaire avec sécurité
  const getGestionnaireNom = (gestionnaireValue: any): string => {
    if (!gestionnaireValue) return '—';
    if (typeof gestionnaireValue === 'object' && gestionnaireValue !== null) {
      const gestObj = gestionnaireValue as { prenom?: string | null; nom?: string | null; id?: string };
      const fullName = `${gestObj.prenom || ''} ${gestObj.nom || ''}`.trim();
      return fullName || (gestObj.id ? String(gestObj.id) : '—');
    }
    if (typeof gestionnaireValue === 'string') {
      const foundGestionnaire = (gestionnairesList || []).find(g => g.id === gestionnaireValue);
      if (foundGestionnaire) {
        return `${foundGestionnaire.prenom || ''} ${foundGestionnaire.nom || ''}`.trim() || '—';
      }
      return String(gestionnaireValue) || '—';
    }
    return '—';
  };

  // Dates formatées
  const now = new Date();
  const currentDateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const currentTimeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête avec logo */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image style={styles.logo} src="/logo-accueil-social.png" />
            <View style={styles.headerInfo}>
              <Text style={styles.title}>Fiche Usager</Text>
              <Text style={styles.subtitle}>{safeValue(user.prenom)} {safeValue(user.nom)}</Text>
              <Text style={styles.subtitle}>Dossier N° {safeValue(user.id)} • {currentDateFormatted}</Text>
            </View>
          </View>
          <View style={getEtatStyle(safeValue(user.etat))}>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{safeValue(user.etat).toUpperCase()}</Text>
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
                <Text style={styles.value}>{safeValue(user.adresse.numero)} {safeValue(user.adresse.rue)}</Text>
                <Text style={styles.value}>{safeValue(user.adresse.codePostal)} {safeValue(user.adresse.ville)}</Text>
                {user.adresse.boite && <Text style={styles.value}>Boîte: {safeValue(user.adresse.boite)}</Text>}
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
              {showAntenne && (
                <View style={styles.col}>
                  <Text style={styles.label}>Antenne</Text>
                  <Text style={styles.value}>{safeValue(user.antenne)}</Text>
                </View>
              )}
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
                <Text style={styles.label}>Date d'ouverture</Text>
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

        {/* Problématiques */}
        {user.problematiques && user.problematiques.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⚠ Problématiques identifiées</Text>
            </View>
            <View style={styles.sectionContent}>
              {user.problematiques.map((prob, index) => (
                <View key={index} style={styles.problematiqueItem} wrap={false}>
                  <View style={styles.typeIndicator}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>PROBLÉMATIQUE #{index + 1}</Text>
                  </View>
                  <Text style={styles.itemTitleProblematique}>Type: {safeValue(prob.type)}</Text>
                  <Text style={styles.itemContent}>Description: {safeValue(prob.description)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        {user.actions && user.actions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📋 Actions et suivi</Text>
            </View>
            <View style={styles.sectionContent}>
              {user.actions.slice(0, 5).map((action, index) => (
                <View key={index} style={styles.actionItem} wrap={false}>
                  <View style={styles.typeIndicator}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>ACTION #{index + 1}</Text>
                  </View>
                  <Text style={styles.itemTitleAction}>{formatDate(action.date)} - {safeValue(action.type)}</Text>
                  {action.partenaire && <Text style={styles.itemContent}>• Partenaire: {safeValue(action.partenaire)}</Text>}
                  {action.description && <Text style={styles.itemContent}>• Description: {safeValue(action.description)}</Text>}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Prévention Expulsion */}
        {user.hasPrevExp && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏠 Procédures & Prévention Expulsion</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.row}>
                {user.prevExpTypeFamille && (
                  <View style={styles.col}>
                    <Text style={styles.label}>Famille</Text>
                    <Text style={styles.value}>{safeValue(user.prevExpTypeFamille)}</Text>
                  </View>
                )}
                {user.prevExpTypeRevenu && (
                  <View style={styles.col}>
                    <Text style={styles.label}>Revenus</Text>
                    <Text style={styles.value}>{safeValue(user.prevExpTypeRevenu)}</Text>
                  </View>
                )}
                {user.prevExpEtatLogement && (
                  <View style={styles.col}>
                    <Text style={styles.label}>État logement</Text>
                    <Text style={styles.value}>{safeValue(user.prevExpEtatLogement)}</Text>
                  </View>
                )}
              </View>

              {user.prevExpDossierOuvert && (
                <View style={{ marginTop: 8, marginBottom: 8 }}>
                  <Text style={styles.label}>Dossier ouvert ?</Text>
                  <Text style={{ ...styles.value, fontWeight: 'bold', color: user.prevExpDossierOuvert === 'OUI' ? '#dc2626' : '#166534' }}>
                    {safeValue(user.prevExpDossierOuvert)}
                  </Text>
                </View>
              )}

              {(user.prevExpDemandeCpas || user.prevExpNegociationProprio) && (
                <View style={{ marginTop: 12, marginBottom: 12 }}>
                  <Text style={{ ...styles.label, fontSize: 13, marginBottom: 8 }}>Démarches financières</Text>
                  <View style={styles.row}>
                    {user.prevExpDemandeCpas && (
                      <View style={styles.col}>
                        <Text style={styles.label}>Demande CPAS</Text>
                        <Text style={styles.value}>{safeValue(user.prevExpDemandeCpas)}</Text>
                      </View>
                    )}
                    {user.prevExpNegociationProprio && (
                      <View style={styles.col}>
                        <Text style={styles.label}>Négociation propriétaire</Text>
                        <Text style={styles.value}>{safeValue(user.prevExpNegociationProprio)}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Timeline Juridique */}
              <View style={{ marginTop: 12, marginBottom: 12 }}>
                <Text style={{ ...styles.label, fontSize: 13, marginBottom: 8 }}>Timeline juridique</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {user.prevExpDateVad && (
                    <View style={{ flex: 1, minWidth: 100, padding: 8, backgroundColor: '#f3f4f6', borderRadius: 4 }}>
                      <Text style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>VAD</Text>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#111827' }}>{formatDate(user.prevExpDateVad)}</Text>
                    </View>
                  )}
                  {user.prevExpDateAudience && (
                    <View style={{ flex: 1, minWidth: 100, padding: 8, backgroundColor: '#f3f4f6', borderRadius: 4 }}>
                      <Text style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>Audience</Text>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#111827' }}>{formatDate(user.prevExpDateAudience)}</Text>
                    </View>
                  )}
                  {user.prevExpDateJugement && (
                    <View style={{ flex: 1, minWidth: 100, padding: 8, backgroundColor: '#f3f4f6', borderRadius: 4 }}>
                      <Text style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>Jugement</Text>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#111827' }}>{formatDate(user.prevExpDateJugement)}</Text>
                    </View>
                  )}
                  {user.prevExpDateSignification && (
                    <View style={{ flex: 1, minWidth: 100, padding: 8, backgroundColor: '#f3f4f6', borderRadius: 4 }}>
                      <Text style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>Signification</Text>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#111827' }}>{formatDate(user.prevExpDateSignification)}</Text>
                    </View>
                  )}
                  {user.prevExpDateExpulsion && (
                    <View style={{
                      flex: 1, minWidth: 100, padding: 8,
                      backgroundColor: new Date(user.prevExpDateExpulsion) > new Date() ? '#fee2e2' : '#f3f4f6',
                      borderRadius: 4,
                      borderWidth: new Date(user.prevExpDateExpulsion) > new Date() ? 2 : 0,
                      borderColor: '#dc2626'
                    }}>
                      <Text style={{ fontSize: 10, color: new Date(user.prevExpDateExpulsion) > new Date() ? '#dc2626' : '#6b7280', marginBottom: 2, fontWeight: 'bold' }}>⚠ EXPULSION</Text>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: new Date(user.prevExpDateExpulsion) > new Date() ? '#dc2626' : '#111827' }}>{formatDate(user.prevExpDateExpulsion)}</Text>
                    </View>
                  )}
                </View>
              </View>

              {user.prevExpSolutionRelogement && (
                <View style={{ marginTop: 12, padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, borderLeftWidth: 4, borderLeftColor: '#3b82f6' }}>
                  <Text style={{ ...styles.label, color: '#1e40af' }}>Solution de relogement</Text>
                  <Text style={{ ...styles.value, fontSize: 14, fontWeight: 'bold', color: '#1e3a8a' }}>{safeValue(user.prevExpSolutionRelogement)}</Text>
                </View>
              )}

              {user.prevExpCommentaire && safeValue(user.prevExpCommentaire) !== '—' && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.label}>Commentaires</Text>
                  <Text style={styles.value}>{safeValue(user.prevExpCommentaire)}</Text>
                </View>
              )}
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
          Document confidentiel • Service d&apos;Accueil Social • Généré le {currentDateFormatted} à {currentTimeFormatted}
        </Text>
      </Page>
    </Document>
  );
};

export default UserPDFDocument;
