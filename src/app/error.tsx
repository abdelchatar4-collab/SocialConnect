/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";
'use client'; // Error components must be Client Components

import React, { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error instanceof Error ? error.message : "Erreur inconnue");
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Une erreur est survenue</h1>
      <p className="text-lg text-gray-700 mb-6">{error?.message || "Erreur inconnue"}</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
      >
        Recharger la page
      </button>
    </div>
  );
}
