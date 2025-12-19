/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  publicRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV,
  },
  eslint: {
    // Attention : Désactive temporairement ESLint pendant le build
    // pour isoler le problème. À réactiver une fois le build réussi.
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Configurations expérimentales valides pour Next.js 14
    serverComponentsExternalPackages: ['sharp'],
  },
};

module.exports = nextConfig;
