/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * FormStepIndicator - Visual step progress indicator for forms
 */

import React from 'react';

interface Step {
    id: number;
    title: string;
    description: string;
}

interface FormStepIndicatorProps {
    steps: Step[];
    currentStep: number;
    onStepClick: (stepId: number) => void;
    isStepCompleted: (stepId: number) => boolean;
    getStepIcon: (stepId: number) => string;
}

export const FormStepIndicator: React.FC<FormStepIndicatorProps> = ({
    steps,
    currentStep,
    onStepClick,
    isStepCompleted,
    getStepIcon,
}) => {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center flex-1">
                        {/* Step circle */}
                        <div className="flex flex-col items-center">
                            <button
                                onClick={() => onStepClick(step.id)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${currentStep === step.id
                                        ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-300'
                                        : isStepCompleted(step.id)
                                            ? 'bg-green-500 text-white shadow-md'
                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                            >
                                {getStepIcon(step.id)}
                            </button>
                            <div className="text-center mt-2">
                                <div className={`text-sm font-semibold ${currentStep === step.id
                                        ? 'text-indigo-600'
                                        : isStepCompleted(step.id)
                                            ? 'text-green-600'
                                            : 'text-gray-700'
                                    }`}>
                                    {step.title}
                                </div>
                                <div className="text-sm text-gray-500 mt-1 max-w-32">
                                    {step.description}
                                </div>
                            </div>
                        </div>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-4 mt-[-20px] ${isStepCompleted(step.id + 1) || currentStep > step.id
                                    ? 'bg-green-300'
                                    : 'bg-gray-200'
                                }`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
