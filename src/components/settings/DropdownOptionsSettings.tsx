/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

'use client';

import React from 'react';
import { useOptionsManagement } from './DropdownOptions/useOptionsManagement';
import { CategoryList } from './DropdownOptions/CategoryList';
import { OptionsEditor } from './DropdownOptions/OptionsEditor';

export default function DropdownOptionsSettings() {
  const {
    optionSets, selectedSet, detailedOptions, loading,
    handleSelectOptionSet, addOption, updateOption, deleteOption, resetToDefault
  } = useOptionsManagement();

  return (
    <div className="flex flex-col md:flex-row h-full gap-6 md:h-[600px]">
      <CategoryList
        optionSets={optionSets}
        selectedId={selectedSet?.id}
        onSelect={handleSelectOptionSet}
      />
      <OptionsEditor
        set={selectedSet}
        options={detailedOptions}
        loading={loading}
        onAdd={addOption}
        onUpdate={updateOption}
        onDelete={deleteOption}
        onReset={resetToDefault}
      />
    </div>
  );
}
