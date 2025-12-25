/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - New Year Theme Overlay
*/

import React, { useState, useEffect } from 'react';
import { Fireworks } from '@fireworks-js/react';

export const NewYearTheme: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const targetDate = new Date('2026-01-01T00:00:00');
        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[9000] pointer-events-none overflow-hidden print:hidden">
            <div className="absolute inset-0 opacity-50">
                <Fireworks
                    options={{
                        hue: { min: 0, max: 360 },
                        acceleration: 1.02,
                        brightness: { min: 50, max: 80 },
                        decay: { min: 0.015, max: 0.03 },
                        delay: { min: 30, max: 60 },
                        explosion: 6,
                        flickering: 50,
                        intensity: 20,
                        friction: 0.97,
                        gravity: 1.2,
                        opacity: 0.5,
                        particles: 60,
                        traceLength: 3,
                        traceSpeed: 8,
                        rocketsPoint: { min: 0, max: 100 },
                        lineWidth: { explosion: { min: 1, max: 3 }, trace: { min: 1, max: 2 } },
                        lineStyle: 'round',
                        sound: { enabled: false }
                    }}
                    style={{ top: 0, left: 0, width: '100%', height: '100%', position: 'fixed', background: 'transparent' }}
                />
            </div>

            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-900 via-pink-600 to-purple-900 text-white py-3 shadow-xl z-[9001] opacity-95">
                <div className="container mx-auto flex justify-center items-center gap-6 animate-pulse">
                    <span className="text-3xl animate-bounce">🥂</span>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-300 drop-shadow-md">
                        BONNE ANNÉE 2026 !
                    </h1>
                    <span className="text-3xl animate-bounce">🎉</span>
                </div>
            </div>

            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-sm animate-fall"
                        style={{
                            width: '10px', height: '10px',
                            backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][i % 5],
                            left: `${Math.random() * 100}%`,
                            top: '-20px',
                            animationDuration: `${5 + Math.random() * 5}s`,
                            animationDelay: `${Math.random() * 5}s`,
                            transform: `rotate(${Math.random() * 360}deg)`
                        } as React.CSSProperties}
                    ></div>
                ))}
            </div>

            <style jsx>{`
                @keyframes fall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
                .animate-fall { animation: fall linear infinite; }
            `}</style>
        </div>
    );
};
