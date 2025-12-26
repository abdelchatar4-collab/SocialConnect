
import React from 'react';
import { useAiSettings } from '@/hooks/ai/useAiSettingsCore';
import { AiProvider } from '@/lib/ai/ai-types';

interface AiProviderSelectorProps {
    value?: AiProvider;
    onChange: (provider: AiProvider) => void;
    className?: string;
}

export const AiProviderSelector: React.FC<AiProviderSelectorProps> = ({
    value,
    onChange,
    className = ''
}) => {
    const { settings } = useAiSettings();

    // Determine current effective provider if value not set
    const current = value || settings.provider;

    // Filter available options
    const options = [
        { id: 'groq', label: 'Groq (Ultra-rapide)', enabled: settings.groqEnabled },
        { id: 'gemini', label: 'Gemini (Intelligent)', enabled: settings.geminiEnabled },
        { id: 'ollama', label: 'Ollama (Local/Privé)', enabled: settings.ollamaEnabled },
    ].filter(opt => opt.enabled !== false); // Keep if enabled is true or undefined (legacy)

    if (options.length <= 1) return null; // No choice needed if only 1 or 0 enabled

    return (
        <select
            value={current}
            onChange={(e) => onChange(e.target.value as AiProvider)}
            onClick={(e) => e.stopPropagation()}
            className={`text-xs border-none bg-transparent hover:bg-black/5 rounded cursor-pointer focus:ring-0 py-0 pl-0 pr-6 m-0 h-6 font-medium text-gray-500 ${className}`}
            style={{ backgroundImage: 'none' }} // Custom arrow handled by parent or default styling
        >
            {options.map(opt => (
                <option key={opt.id} value={opt.id}>
                    via {opt.label}
                </option>
            ))}
        </select>
    );
};
