/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';

/**
 * Composant utilitaire pour améliorer la visibilité des textes
 * Peut être utilisé pour envelopper des composants existants qui ont des problèmes de contraste
 */
interface VisibleTextProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const VisibleText: React.FC<VisibleTextProps> = ({
  children,
  className = '',
  as: Component = 'div'
}) => {
  return (
    <Component
      className={`text-visible force-dark-text ${className}`}
      style={{ color: '#111827' }}
    >
      {children}
    </Component>
  );
};

/**
 * Hook pour appliquer des styles de visibilité à un élément existant
 */
export const useVisibleText = () => {
  const getVisibleTextStyles = () => ({
    color: '#111827 !important',
    backgroundColor: '#ffffff',
  });

  const getVisibleTextClasses = () => 'text-visible force-dark-text';

  return {
    getVisibleTextStyles,
    getVisibleTextClasses,
  };
};

/**
 * Composant pour corriger la visibilité des inputs existants
 */
interface VisibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const VisibleInput: React.FC<VisibleInputProps> = ({
  className = '',
  inputRef,
  ...props
}) => {
  return (
    <input
      ref={inputRef}
      {...props}
      className={`form-input text-visible ${className}`}
      style={{
        color: '#111827 !important',
        backgroundColor: '#ffffff !important',
        ...props.style
      }}
    />
  );
};

/**
 * Composant pour corriger la visibilité des select existants
 */
interface VisibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  selectRef?: React.RefObject<HTMLSelectElement>;
}

export const VisibleSelect: React.FC<VisibleSelectProps> = ({
  className = '',
  children,
  selectRef,
  ...props
}) => {
  return (
    <select
      ref={selectRef}
      {...props}
      className={`form-select text-visible ${className}`}
      style={{
        color: '#111827 !important',
        backgroundColor: '#ffffff !important',
        ...props.style
      }}
    >
      {children}
    </select>
  );
};
