/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const predefinedCategories = [
    { id: 'statutSejour', name: 'Statut de séjour', options: [], description: 'Options pour le statut de séjour' },
    { id: 'typeLogement', name: 'Type de logement', options: [], description: 'Types de logement disponibles' },
    { id: 'etat', name: 'État du dossier', options: [], description: 'États possibles des dossiers' },
    { id: 'antenne', name: 'Antennes', options: [], description: 'Antennes disponibles' },
    { id: 'langue', name: 'Langues', options: [], description: 'Langues parlées' },
    { id: 'nationalite', name: 'Nationalités', options: [], description: 'Nationalités' },
    { id: 'problematiques', name: 'Problématiques', options: [], description: 'Types de problématiques' },
    { id: 'actions', name: 'Actions', options: [], description: 'Types d\'actions' },
    { id: 'situationFamiliale', name: 'Situation familiale', options: [], description: 'Situations familiales' },
    { id: 'situationProfessionnelle', name: 'Situation professionnelle', options: [], description: 'Situations professionnelles' },
    { id: 'revenus', name: 'Revenus', options: [], description: 'Types de revenus' },
    { id: 'premierContact', name: 'Premier contact', options: [], description: 'Moyens de premier contact' },
    { id: 'partenaire', name: 'Partenaires', options: [], description: 'Organismes partenaires' },
    { id: 'prevExpDecision', name: 'Issue de l\'accompagnement (PrevExp)', options: [], description: 'Issue de l\'accompagnement lié à la prévention des expulsions' },
    { id: 'prevExpDemandeCpas', name: 'Demande CPAS (PrevExp)', options: [], description: 'Types de demandes de prise en charge CPAS' },
    { id: 'prevExpNegociationProprio', name: 'Négociation Propriétaire (PrevExp)', options: [], description: 'État des négociations avec le propriétaire' },
    { id: 'prevExpSolutionRelogement', name: 'Solution Relogement (PrevExp)', options: [], description: 'Solutions de relogement envisagées' },
    { id: 'prevExpTypeFamille', name: 'Type de Famille (PrevExp)', options: [], description: 'Composition familiale' },
    { id: 'prevExpTypeRevenu', name: 'Type de Revenu (PrevExp)', options: [], description: 'Source de revenus' },
    { id: 'prevExpEtatLogement', name: 'État du Logement (PrevExp)', options: [], description: 'État général du logement' },
    { id: 'prevExpNombreChambre', name: 'Nombre de Chambres (PrevExp)', options: [], description: 'Nombre de chambres dans le logement' },
    { id: 'prevExpAideJuridique', name: 'Aide Juridique (PrevExp)', options: [], description: 'Type d\'aide juridique' },
    { id: 'prevExpMotifRequete', name: 'Motif de la requête (PrevExp)', options: [], description: 'Motif de la requête d\'expulsion' },
    { id: 'statutGarantie', name: 'Statut Garantie Locative', options: [], description: 'Statut de la garantie locative' },
    { id: 'bailEnregistre', name: 'Bail Enregistré', options: [], description: 'Statut de l\'enregistrement du bail' },
    { id: 'dureeContrat', name: 'Durée du Contrat', options: [], description: 'Durée du contrat de bail' },
    { id: 'typeLitige', name: 'Type de Litige Logement', options: [], description: 'Type de litige lié au logement' },
    { id: 'dureePreavis', name: 'Durée du Préavis', options: [], description: 'Durée du préavis de sortie' },
    { id: 'preavisPour', name: 'Préavis Pour', options: [], description: 'Motif du préavis de sortie' },
    { id: 'prestation_motifs', name: 'Motifs de Prestation', options: [], description: 'Types de prestations (Présence, Congé, Maladie, etc.)' }
  ];

  return NextResponse.json(predefinedCategories);
}
