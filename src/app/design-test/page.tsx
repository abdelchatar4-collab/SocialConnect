/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { useState } from 'react';
import { Checkbox } from '@/components/ui';
import { useButtonClasses, useBadgeClasses } from '@/hooks/useStyleClasses';

export default function DesignTestPage() {
  const [checkboxState, setCheckboxState] = useState({
    problematiques: false,
    actions: false,
    test1: false,
    test2: true,
  });

  const handleCheckboxChange = (key: string) => (checked: boolean) => {
    setCheckboxState(prev => ({ ...prev, [key]: checked }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test des Optimisations Tailwind
          </h1>
          <p className="text-gray-600 mb-8">
            Cette page valide que tous les problèmes d'affichage ont été résolus.
          </p>

          {/* Test des Checkboxes - Le problème principal résolu */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ✅ Checkboxes Optimisées (Problème Résolu)
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-blue-800 text-sm mb-4">
                <strong>Avant :</strong> Cases à cocher peu visibles avec seulement un effet bleu subtil
                <br />
                <strong>Après :</strong> Interface claire avec coche visible et états distincts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Checkbox
                  checked={checkboxState.problematiques}
                  onChange={handleCheckboxChange('problematiques')}
                  label="Afficher problématiques"
                />
                <Checkbox
                  checked={checkboxState.actions}
                  onChange={handleCheckboxChange('actions')}
                  label="Afficher actions et suivi"
                />
                <Checkbox
                  checked={checkboxState.test1}
                  onChange={handleCheckboxChange('test1')}
                  label="Case décochée par défaut"
                />
                <Checkbox
                  checked={checkboxState.test2}
                  onChange={handleCheckboxChange('test2')}
                  label="Case cochée par défaut"
                />
              </div>

              <div className="bg-gray-100 p-3 rounded">
                <h4 className="font-medium text-gray-700 mb-2">État des checkboxes :</h4>
                <pre className="text-xs text-gray-600">
                  {JSON.stringify(checkboxState, null, 2)}
                </pre>
              </div>
            </div>
          </section>

          {/* Test des Boutons avec hooks */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🎨 Système de Design Tokens
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <button className={useButtonClasses('primary', 'sm')}>
                  Bouton Primary Small
                </button>
                <button className={useButtonClasses('secondary', 'md')}>
                  Bouton Secondary Medium
                </button>
              </div>

              <div className="flex gap-2 flex-wrap">
                <span className={useBadgeClasses('primary', 'sm')}>Badge Primary</span>
                <span className={useBadgeClasses('success', 'md')}>Badge Success</span>
                <span className={useBadgeClasses('warning', 'md')}>Badge Warning</span>
                <span className={useBadgeClasses('error', 'md')}>Badge Error</span>
              </div>
            </div>
          </section>

          {/* Test des styles globaux */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📝 Styles Globaux Optimisés
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Input Standard</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Texte d'exemple"
                  />
                </div>
                <div>
                  <label className="form-label">Select Standard</label>
                  <select className="form-input">
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Test des couleurs de texte :</h4>
                <div className="space-y-1">
                  <p className="text-gray-900">Texte principal (gray-900)</p>
                  <p className="text-gray-700">Texte secondaire (gray-700)</p>
                  <p className="text-gray-600">Texte tertiaire (gray-600) - Plus foncé maintenant</p>
                  <p className="text-gray-500">Texte léger (gray-500) - Plus foncé maintenant</p>
                </div>
              </div>
            </div>
          </section>

          {/* Résumé des améliorations */}
          <section className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              ✅ Résumé des Optimisations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-green-700 mb-2">Problèmes Résolus :</h4>
                <ul className="space-y-1 text-green-600">
                  <li>• Checkboxes peu visibles → Interface claire</li>
                  <li>• Textes gris trop clairs → Couleurs contrastées</li>
                  <li>• Classes inconsistantes → Design tokens centralisés</li>
                  <li>• CSS @apply problématique → Styles natifs</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-700 mb-2">Nouveautés Ajoutées :</h4>
                <ul className="space-y-1 text-green-600">
                  <li>• Système de design tokens centralisé</li>
                  <li>• Hooks pour classes Tailwind cohérentes</li>
                  <li>• Configuration Tailwind optimisée</li>
                  <li>• Guide de résolution de problèmes</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
