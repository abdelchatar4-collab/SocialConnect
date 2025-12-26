
import React from 'react';
import { useAiSettings } from '@/hooks/ai/useAiSettingsCore';
import { AiProvider } from '@/lib/ai/ai-types';
import { BoltIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

interface PremiumAiSelectorProps {
    value: AiProvider | undefined;
    onChange: (provider: AiProvider) => void;
    disabled?: boolean;
}

export const PremiumAiSelector: React.FC<PremiumAiSelectorProps> = ({
    value,
    onChange,
    disabled
}) => {
    const { settings } = useAiSettings();

    // Default to global setting provider if active selection is undefined (though logic should handle this)
    // Actually we want to highlight the *current* selection.

    // We only show enabled providers
    const options = [
        {
            id: 'groq',
            label: 'Vitesse',
            subLabel: 'Groq',
            icon: BoltIcon,
            color: 'text-amber-500',
            bgSelected: 'bg-amber-100',
            borderSelected: 'border-amber-200',
            enabled: settings.groqEnabled
        },
        {
            id: 'gemini',
            label: 'Intelligent',
            subLabel: 'Gemini',
            icon: SparklesIcon,
            color: 'text-purple-500',
            bgSelected: 'bg-purple-100',
            borderSelected: 'border-purple-200',
            enabled: settings.geminiEnabled
        },
        {
            id: 'ollama',
            label: 'Privé',
            subLabel: 'Ollama',
            icon: ShieldCheckIcon,
            color: 'text-emerald-500',
            bgSelected: 'bg-emerald-100',
            borderSelected: 'border-emerald-200',
            enabled: settings.ollamaEnabled
        },
    ].filter(opt => opt.enabled !== false); // Hide disabled (legacy support)

    if (options.length <= 1) return null;

    // Use current value or settings default if not set
    const current = value || settings.provider || 'gemini';

    return (
        <div className="flex bg-white/50 backdrop-blur-sm rounded-lg p-1 border border-slate-200 shadow-sm ml-auto">
            {options.map((option) => {
                const isSelected = current === option.id;
                const Icon = option.icon;

                return (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onChange(option.id as AiProvider)}
                        disabled={disabled}
                        className={`
                            relative flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300
                            ${isSelected
                                ? `${option.bgSelected} ${option.color} shadow-sm ring-1 ring-inset ${option.borderSelected}`
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                            }
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        <Icon className={`w-4 h-4 ${isSelected ? option.color : 'text-slate-400'}`} />
                        <div className="flex flex-col items-start leading-none">
                            <span className="font-bold">{option.subLabel}</span>
                            {isSelected && <span className="text-[9px] opacity-75 hidden sm:inline">{option.label}</span>}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};
