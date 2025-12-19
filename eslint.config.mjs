/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import nextPlugin from "@next/eslint-plugin-next";

/** @type {import('eslint').Linter.FlatConfig[]} */
const eslintConfig = [
  // Configuration par défaut recommandée par Next.js
  nextPlugin.configs.recommended, 
  // Configuration "core-web-vitals" recommandée par Next.js
  nextPlugin.configs["core-web-vitals"], 

  // Vous pouvez ajouter vos propres règles ici si nécessaire, par exemple :
  // {
  //   files: ["src/**/*.{js,jsx,ts,tsx}"],
  //   rules: {
  //     "semi": ["error", "always"],
  //   }
  // }
];

export default eslintConfig;
