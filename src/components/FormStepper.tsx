/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { CheckIcon } from '@heroicons/react/20/solid';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
  className?: string;
}

export const FormStepper: React.FC<FormStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = ''
}) => {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="border border-gray-300 rounded-md divide-y divide-gray-300 md:flex md:divide-y-0">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className="relative md:flex-1 md:flex">
            <button
              type="button"
              onClick={() => onStepClick(step.id)}
              className={`group w-full flex items-center focus:outline-none ${
                stepIdx !== steps.length - 1 ? 'pb-4 md:pb-0' : ''
              }`}
            >
              <div className="px-6 py-4 flex items-center text-sm font-medium w-full">
                <div className="flex-shrink-0">
                  {step.id < currentStep ? (
                    <div className="w-10 h-10 flex items-center justify-center bg-green-600 rounded-full group-hover:bg-green-500">
                      <CheckIcon className="w-6 h-6 text-white" aria-hidden="true" />
                    </div>
                  ) : step.id === currentStep ? (
                    <div className="w-10 h-10 flex items-center justify-center border-2 border-blue-600 rounded-full">
                      <span className="text-blue-600 font-semibold">{step.id}</span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-full group-hover:border-gray-400">
                      <span className="text-gray-600 group-hover:text-gray-900 font-semibold">{step.id}</span>
                    </div>
                  )}
                </div>
                <div className="ml-4 min-w-0 flex flex-col items-start">
                  <p className={`text-sm font-medium ${
                    step.id <= currentStep ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </p>
                  <p className={`text-sm ${
                    step.id <= currentStep ? 'text-gray-700' : 'text-gray-600'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>

              {stepIdx !== steps.length - 1 && (
                <div className="hidden md:block absolute top-0 right-0 h-full w-5" aria-hidden="true">
                  <svg
                    className="h-full w-full text-gray-300"
                    viewBox="0 0 22 80"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="m0 72 7-8 7 8"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};
