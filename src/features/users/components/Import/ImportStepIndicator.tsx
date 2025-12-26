/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Import Step Indicator Component
*/

import React from 'react';
import { CheckIcon } from "@heroicons/react/24/outline";

interface ImportStepIndicatorProps {
    currentStep: number;
    steps: { label: string; description: string }[];
}

export const ImportStepIndicator: React.FC<ImportStepIndicatorProps> = ({
    currentStep,
    steps
}) => {
    return (
        <div className="flex items-center justify-between mb-12 relative px-4">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />

            {/* Active Line Progress */}
            <div
                className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 z-0 transition-all duration-500 rounded-full"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, idx) => {
                const isCompleted = idx < currentStep;
                const isActive = idx === currentStep;

                return (
                    <div key={idx} className="relative z-10 flex flex-col items-center group">
                        <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${isCompleted ? 'bg-green-500 text-white' :
                                    isActive ? 'bg-blue-600 text-white scale-110' :
                                        'bg-white text-slate-400 border-2 border-slate-100'
                                }`}
                        >
                            {isCompleted ? <CheckIcon className="w-6 h-6 stroke-[3]" /> : <span className="text-lg font-black">{idx + 1}</span>}
                        </div>
                        <div className="absolute -bottom-8 whitespace-nowrap text-center">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                                {step.label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
