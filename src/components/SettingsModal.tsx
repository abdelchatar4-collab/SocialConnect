/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

/**
 * SettingsModal - Wrapper that uses the new SettingsLayout
 */

import { SettingsLayout } from '@/features/settings';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTabIndex?: number;
}

// Map old tab indexes to new section IDs
const TAB_TO_SECTION: Record<number, string> = {
  0: 'customization',
  1: 'general',
  2: 'gestionnaires',
  3: 'options',
  4: 'partenaires',
  5: 'geographie',
  6: 'equipe',
  7: 'antennes',
};

export default function SettingsModal({ isOpen, onClose, defaultTabIndex = 0 }: SettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const defaultSection = TAB_TO_SECTION[defaultTabIndex] || 'customization';

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <SettingsLayout
      isOpen={isOpen}
      onClose={onClose}
      defaultSection={defaultSection}
    />,
    document.body
  );
}
