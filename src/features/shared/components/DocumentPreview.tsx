/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Shared Document Preview Component
*/

"use client";

import React, { useState } from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import { PreviewOverlay } from "@/components/preview/PreviewOverlay";

interface DocumentPreviewProps {
  url: string;
  name: string;
  className?: string;
}

export function DocumentPreview({ url, name, className = "" }: DocumentPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all active:scale-95 ${className}`}
      >
        <EyeIcon className="w-4 h-4" />
        Previsualiser
      </button>

      {isOpen && (
        <PreviewOverlay
          url={url}
          fileName={name}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
