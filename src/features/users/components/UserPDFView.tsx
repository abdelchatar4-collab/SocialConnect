/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User PDF Document
Refactored to use extracted styles for maintainability
*/

import React from 'react';
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { User, Gestionnaire } from '@/types/user';
import { pdfStyles as styles, etatColors } from '../styles/pdfStyles';

interface UserPDFDocumentProps {
  user: User;
  gestionnairesList: Gestionnaire[];
  showAntenne?: boolean;
}

const UserPDFDocument: React.FC<UserPDFDocumentProps> = ({ user, gestionnairesList, showAntenne = true }) => {
  // Safe value helper
  const safeValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return '—';
    return String(value).trim() || '—';
  };

  // Date formatting
  const formatDate = (date: any): string => {
    if (!date) return '—';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return '—';
      return dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  // Current date/time
  const now = new Date();
  const currentDateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const currentTimeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  // Gestionnaire name lookup
  const getGestionnaireNom = (gestionnaireValue: any): string => {
    if (!gestionnaireValue) return '—';
    if (typeof gestionnaireValue === 'object' && gestionnaireValue !== null) {
      const gestObj = gestionnaireValue as { prenom?: string | null; nom?: string | null; id?: string };
      const fullName = `${gestObj.prenom || ''} ${gestObj.nom || ''}`.trim();
      return fullName || (gestObj.id ? String(gestObj.id) : '—');
    }
    if (typeof gestionnaireValue === 'string') {
      const found = gestionnairesList.find(g => g.id === gestionnaireValue);
      if (found) return `${found.prenom || ''} ${found.nom || ''}`.trim() || '—';
      return String(gestionnaireValue) || '—';
    }
    return '—';
  };

  // Status badge style
  const getEtatStyle = (etat: string) => {
    const color = etatColors[etat?.toLowerCase() || ''] || etatColors['clôturé'];
    return { ...styles.etatBadge, backgroundColor: color.bg, color: color.text };
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
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

        {/* Personal Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Informations personnelles</Text></View>
          <View style={styles.sectionContent}>
            <View style={styles.row}>
              <View style={styles.col}><Text style={styles.label}>Nom de famille</Text><Text style={styles.value}>{safeValue(user.nom)}</Text></View>
              <View style={styles.col}><Text style={styles.label}>Prénom</Text><Text style={styles.value}>{safeValue(user.prenom)}</Text></View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}><Text style={styles.label}>Date de naissance</Text><Text style={styles.value}>{formatDate(user.dateNaissance)}</Text></View>
              <View style={styles.col}><Text style={styles.label}>Genre</Text><Text style={styles.value}>{safeValue(user.genre)}</Text></View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}><Text style={styles.label}>Nationalité</Text><Text style={styles.value}>{safeValue(user.nationalite)}</Text></View>
              <View style={styles.col}><Text style={styles.label}>Statut de séjour</Text><Text style={styles.value}>{safeValue(user.statutSejour)}</Text></View>
            </View>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Coordonnées</Text></View>
          <View style={styles.sectionContent}>
            <View style={styles.row}>
              <View style={styles.col}><Text style={styles.label}>Email</Text><Text style={styles.value}>{safeValue(user.email)}</Text></View>
              <View style={styles.col}><Text style={styles.label}>Téléphone</Text><Text style={styles.value}>{safeValue(user.telephone)}</Text></View>
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

        {/* Administrative */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Dossier administratif</Text></View>
          <View style={styles.sectionContent}>
            <View style={styles.row}>
              {showAntenne && <View style={styles.col}><Text style={styles.label}>Antenne</Text><Text style={styles.value}>{safeValue(user.antenne)}</Text></View>}
              <View style={styles.col}><Text style={styles.label}>Secteur</Text><Text style={styles.value}>{safeValue(user.secteur)}</Text></View>
            </View>
            <View style={styles.row}>
              <View style={styles.col}><Text style={styles.label}>Gestionnaire</Text><Text style={styles.value}>{getGestionnaireNom(user.gestionnaire)}</Text></View>
              <View style={styles.col}><Text style={styles.label}>Date d&apos;ouverture</Text><Text style={styles.value}>{formatDate(user.dateOuverture)}</Text></View>
            </View>
            {user.dateCloture && <View style={styles.row}><View style={styles.col}><Text style={styles.label}>Date de clôture</Text><Text style={styles.value}>{formatDate(user.dateCloture)}</Text></View></View>}
          </View>
        </View>

        {/* Problematiques */}
        {user.problematiques && user.problematiques.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>⚠ Problématiques identifiées</Text></View>
            <View style={styles.sectionContent}>
              {user.problematiques.map((prob, idx) => (
                <View key={idx} style={styles.problematiqueItem}>
                  <View style={styles.typeIndicator}><Text style={{ fontSize: 10, fontWeight: 'bold' }}>PROBLÉMATIQUE #{idx + 1}</Text></View>
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
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>📋 Actions et suivi</Text></View>
            <View style={styles.sectionContent}>
              {user.actions.slice(0, 5).map((action, idx) => (
                <View key={idx} style={styles.actionItem}>
                  <View style={styles.typeIndicator}><Text style={{ fontSize: 10, fontWeight: 'bold' }}>ACTION #{idx + 1}</Text></View>
                  <Text style={styles.itemTitleAction}>{formatDate(action.date)} - {safeValue(action.type)}</Text>
                  {action.partenaire && <Text style={styles.itemContent}>• Partenaire: {safeValue(action.partenaire)}</Text>}
                  {action.description && <Text style={styles.itemContent}>• Description: {safeValue(action.description)}</Text>}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        {user.notesGenerales && safeValue(user.notesGenerales) !== '—' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Notes</Text></View>
            <View style={styles.sectionContent}><Text style={styles.value}>{safeValue(user.notesGenerales)}</Text></View>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>Document confidentiel • Service d&apos;Accueil Social • Généré le {currentDateFormatted} à {currentTimeFormatted}</Text>
      </Page>
    </Document>
  );
};

export default UserPDFDocument;
