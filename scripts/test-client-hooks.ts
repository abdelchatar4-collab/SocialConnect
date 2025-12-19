/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useDropdownOptionsAPI } from '../src/hooks/useDropdownOptionsAPI';
import { DROPDOWN_CATEGORIES } from '../src/constants/dropdownCategories';

// Script de test pour vérifier les hooks côté client
console.log('🧪 Test des hooks côté client...');

// Test direct du hook
const testHook = () => {
  const { options, loading, error } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.PARTENAIRES);

  console.log('📊 État du hook:');
  console.log('- Loading:', loading);
  console.log('- Error:', error);
  console.log('- Options count:', options.length);
  console.log('- Options:', options);

  return { options, loading, error };
};

// Test de l'optionsClient directement
import { optionsClient } from '../src/lib/optionsClient';

const testOptionsClient = async () => {
  try {
    console.log('🔧 Test direct optionsClient...');
    const options = await optionsClient.getOptions('partenaire');
    console.log('✅ Options récupérées:', options.length);
    console.log('📋 Première option:', options[0]);
  } catch (error) {
    console.error('❌ Erreur optionsClient:', error);
  }
};

testOptionsClient();
