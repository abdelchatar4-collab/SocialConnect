/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Document Preview Component
*/

"use client";

import React, { useState } from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import { PreviewOverlay } from "./preview/PreviewOverlay";

interface DocumentPreviewProps {
  url?: string;
  name?: string;
  showIcon?: boolean;
  // Legacy support for rapports page
  isOpen?: boolean;
  onClose?: () => void;
  document?: any | null; // Flexible for legacy DocumentInfo
}

export default function DocumentPreview({
  url,
  name,
  showIcon = true,
  isOpen: legacyIsOpen,
  onClose: legacyOnClose,
  document: legacyDocument
}: DocumentPreviewProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Determine which mode we are in
  const isLegacy = legacyIsOpen !== undefined;
  const activeIsOpen = isLegacy ? legacyIsOpen : internalIsOpen;
  const activeOnClose = isLegacy ? legacyOnClose : () => setInternalIsOpen(false);

  // For legacy mode, if url is missing, we construct it from the name
  // In rapports page, documents are usually in /api/rapports/view/{name}
  const activeUrl = isLegacy
    ? (legacyDocument?.url || (legacyDocument?.name ? `/api/rapports/view?filename=${encodeURIComponent(legacyDocument.name)}` : ''))
    : url;

  const activeName = isLegacy ? legacyDocument?.name : name;

  return (
    <>
      {!isLegacy && (
        <button
          onClick={() => setInternalIsOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors group"
        >
          {showIcon && <EyeIcon className="w-4 h-4" />}
          <span>Aperçu</span>
        </button>
      )}

      {activeIsOpen && activeUrl && (
        <PreviewOverlay
          url={activeUrl}
          fileName={activeName}
          onClose={activeOnClose || (() => { })}
        />
      )}
    </>
  );
}
