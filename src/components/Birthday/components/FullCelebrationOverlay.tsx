/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Full Screen Celebration Overlay
*/

import React from 'react';
import { Fireworks } from '@fireworks-js/react';

interface FullCelebrationOverlayProps {
    birthdayPerson: string;
}

export const FullCelebrationOverlay: React.FC<FullCelebrationOverlayProps> = ({ birthdayPerson }) => {
    return (
        <div className="fixed inset-0 z-[9998] pointer-events-none print:hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-yellow-900/20 animate-pulse"></div>

            {/* Fireworks-js Component */}
            <div className="absolute inset-0 z-[9999]">
                <Fireworks
                    options={{
                        hue: { min: 0, max: 360 },
                        acceleration: 1.02,
                        brightness: { min: 60, max: 90 },
                        decay: { min: 0.015, max: 0.03 },
                        delay: { min: 15, max: 30 },
                        explosion: 7,
                        flickering: 50,
                        intensity: 45,
                        friction: 0.96,
                        gravity: 1.2,
                        opacity: 0.5,
                        particles: 90,
                        traceLength: 3,
                        traceSpeed: 10,
                        rocketsPoint: { min: 0, max: 100 },
                        lineWidth: {
                            explosion: { min: 1, max: 4 },
                            trace: { min: 1, max: 2 }
                        },
                        lineStyle: 'round',
                        sound: {
                            enabled: true,
                            files: [
                                'https://fireworks.js.org/sounds/explosion0.mp3',
                                'https://fireworks.js.org/sounds/explosion1.mp3',
                                'https://fireworks.js.org/sounds/explosion2.mp3'
                            ],
                            volume: { min: 8, max: 15 }
                        }
                    }}
                    style={{
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        position: 'fixed',
                        background: 'transparent'
                    }}
                />
            </div>

            {/* Animated celebration text */}
            <div className="absolute inset-0 flex items-center justify-center z-[10000]">
                <div className="text-center space-y-4">
                    <div className="animate-bounce">
                        <h1 className="text-6xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 drop-shadow-2xl animate-pulse">
                            🎉 JOYEUX ANNIVERSAIRE 🎉
                        </h1>
                    </div>
                    <div className="animate-pulse">
                        <h2 className="text-4xl md:text-7xl font-bold text-white drop-shadow-2xl">
                            {birthdayPerson.toUpperCase()} !
                        </h2>
                    </div>
                </div>
            </div>

            {/* Floating balloons */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-around pointer-events-none overflow-hidden h-screen z-[10000]">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="text-6xl absolute bottom-[-100px]"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animation: `floatUp ${4 + Math.random() * 4}s linear infinite`,
                            animationDelay: `${Math.random() * 2}s`,
                            opacity: 0.8
                        } as React.CSSProperties}
                    >
                        🎈
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @keyframes floatUp {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }
            `}</style>
        </div>
    );
};
