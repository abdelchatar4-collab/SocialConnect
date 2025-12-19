/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { useEffect, useState } from 'react';
import { Fireworks } from '@fireworks-js/react';
import { useAdmin } from '@/contexts/AdminContext';

export const BirthdayBanner: React.FC = () => {
    const { enableBirthdays, colleagueBirthdays } = useAdmin();
    const [birthdayPerson, setBirthdayPerson] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showFullCelebration, setShowFullCelebration] = useState(false);

    const [isGiftDismissed, setIsGiftDismissed] = useState(false);

    useEffect(() => {
        if (!enableBirthdays || colleagueBirthdays.length === 0) {
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentYear = today.getFullYear();

        // Function to check if a date is a weekend (Saturday=6, Sunday=0)
        const isWeekend = (date: Date) => {
            const day = date.getDay();
            return day === 0 || day === 6;
        };

        // Function to get the adjusted celebration window for a birthday
        const getCelebrationWindow = (birthdayDate: Date) => {
            const start = new Date(birthdayDate);
            const end = new Date(birthdayDate);

            // Default window: Birthday + 3 days after
            end.setDate(end.getDate() + 3);

            // Weekend Adjustment Logic:
            // If birthday is Saturday, celebrate Friday before -> Tuesday after
            // If birthday is Sunday, celebrate Friday before -> Tuesday after
            if (birthdayDate.getDay() === 6) { // Saturday
                start.setDate(start.getDate() - 1); // Start Friday
                end.setDate(end.getDate() + 2);     // End Tuesday
            } else if (birthdayDate.getDay() === 0) { // Sunday
                start.setDate(start.getDate() - 2); // Start Friday
                end.setDate(end.getDate() + 2);     // End Tuesday
            }

            return { start, end };
        };

        // Check all colleagues
        const celebratingColleague = colleagueBirthdays.find(colleague => {
            const [_, monthStr, dayStr] = colleague.date.split('-');
            const month = parseInt(monthStr) - 1;
            const day = parseInt(dayStr);

            // Check for current year AND next year (for end of year birthdays)
            const yearsToCheck = [currentYear, currentYear - 1, currentYear + 1];

            return yearsToCheck.some(year => {
                const birthdayThisYear = new Date(year, month, day);
                birthdayThisYear.setHours(0, 0, 0, 0);

                const { start, end } = getCelebrationWindow(birthdayThisYear);

                return today >= start && today <= end;
            });
        });

        if (celebratingColleague) {
            setBirthdayPerson(celebratingColleague.name);
            setIsVisible(true);
            // Trigger initial confetti effect
            triggerConfetti();
        } else {
            setBirthdayPerson(null);
            setIsVisible(false);
        }
    }, [enableBirthdays, colleagueBirthdays]);

    const triggerConfetti = () => {
        // Dynamic import of canvas-confetti
        import('canvas-confetti').then((confetti) => {
            const duration = 3000;
            const end = Date.now() + duration;
            const colors = ['#ff69b4', '#ff1493', '#ffd700', '#ff6347', '#9370db'];

            (function frame() {
                confetti.default({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti.default({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        });
    };

    const playHappyBirthdaySong = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Happy Birthday melody (complete version - 4 verses)
            const notes = [
                // "Happy Birthday to you" (1st line)
                { freq: 262, duration: 0.4 }, // C
                { freq: 262, duration: 0.2 }, // C
                { freq: 294, duration: 0.6 }, // D
                { freq: 262, duration: 0.6 }, // C
                { freq: 349, duration: 0.6 }, // F
                { freq: 330, duration: 1.2 }, // E

                // "Happy Birthday to you" (2nd line)
                { freq: 262, duration: 0.4 }, // C
                { freq: 262, duration: 0.2 }, // C
                { freq: 294, duration: 0.6 }, // D
                { freq: 262, duration: 0.6 }, // C
                { freq: 392, duration: 0.6 }, // G
                { freq: 349, duration: 1.2 }, // F

                // "Happy Birthday dear [name]" (3rd line)
                { freq: 262, duration: 0.4 }, // C
                { freq: 262, duration: 0.2 }, // C
                { freq: 523, duration: 0.6 }, // C (high)
                { freq: 440, duration: 0.6 }, // A
                { freq: 349, duration: 0.6 }, // F
                { freq: 330, duration: 0.6 }, // E
                { freq: 294, duration: 0.6 }, // D

                // "Happy Birthday to you" (4th line)
                { freq: 466, duration: 0.4 }, // Bb
                { freq: 466, duration: 0.2 }, // Bb
                { freq: 440, duration: 0.6 }, // A
                { freq: 349, duration: 0.6 }, // F
                { freq: 392, duration: 0.6 }, // G
                { freq: 349, duration: 1.2 }, // F
            ];

            let currentTime = audioContext.currentTime;

            notes.forEach(note => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = note.freq;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);

                oscillator.start(currentTime);
                oscillator.stop(currentTime + note.duration);

                currentTime += note.duration;
            });
        } catch (err) {
            console.log('Audio synthesis failed:', err);
        }
    };

    const triggerFullCelebration = () => {
        console.log('🎁 Gift clicked! Triggering celebration...');

        // Prevent multiple celebrations at once
        if (showFullCelebration) {
            console.log('⚠️ Celebration already active');
            return;
        }

        setShowFullCelebration(true);
        console.log('🎵 Playing music...');

        // Play complete Happy Birthday song
        playHappyBirthdaySong();

        // Trigger massive confetti alongside fireworks
        import('canvas-confetti').then((confetti) => {
            const duration = 20000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10001 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    clearInterval(interval);
                    return;
                }

                const particleCount = 50 * (timeLeft / duration);

                // Rainbow confetti bursts
                confetti.default({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                    colors: ['#ff0000', '#ffa500', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#ee82ee']
                });
                confetti.default({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                    colors: ['#ff0000', '#ffa500', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#ee82ee']
                });
            }, 250);
        });

        // Stop celebration after 20 seconds
        setTimeout(() => {
            setShowFullCelebration(false);
        }, 20000);
    };

    const handleDismissGift = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering celebration
        setIsGiftDismissed(true);
    };

    const handleReplayGift = () => {
        setIsGiftDismissed(false);
        // Optional: also trigger confetti to draw attention
        triggerConfetti();
    };

    if (!isVisible || !birthdayPerson) {
        return null;
    }

    return (
        <>
            {/* Full Screen Celebration Overlay */}
            {showFullCelebration && (
                <div className="fixed inset-0 z-[9998] pointer-events-none print:hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-yellow-900/20 animate-pulse"></div>

                    {/* Fireworks-js Component - INTENSIFIED */}
                    <div className="absolute inset-0 z-[9999]">
                        <Fireworks
                            options={{
                                hue: { min: 0, max: 360 },
                                acceleration: 1.02,
                                brightness: { min: 60, max: 90 },
                                decay: { min: 0.015, max: 0.03 },
                                delay: { min: 15, max: 30 }, // Faster firing
                                explosion: 7, // Bigger explosions
                                flickering: 50,
                                intensity: 45, // More intense
                                friction: 0.96,
                                gravity: 1.2,
                                opacity: 0.5,
                                particles: 90, // More particles
                                traceLength: 3,
                                traceSpeed: 10,
                                rocketsPoint: { min: 0, max: 100 }, // Launch from everywhere
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
                                    volume: { min: 8, max: 15 } // Louder
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

                    {/* Animated celebration text - CLEANER (No emojis) */}
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

                    {/* Floating balloons with inline styles for reliability */}
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
                                }}
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
            )}

            {/* Birthday Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 animate-gradient-x z-[9000] print:hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bS0xMCAwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wLTEwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

                <div className="relative px-4 py-3 flex items-center justify-center gap-3">
                    <div className="flex items-center gap-3 animate-bounce-slow">
                        <span className="text-3xl">🎂</span>
                        <span className="text-3xl">🎉</span>
                        <span className="text-3xl">🎈</span>
                    </div>

                    <div className="text-center">
                        <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                            Joyeux Anniversaire {birthdayPerson} ! 🎊
                        </h2>
                        <p className="text-sm text-white/90 mt-1">
                            Toute l'équipe te souhaite une merveilleuse journée !
                        </p>
                    </div>

                    <div className="flex items-center gap-3 animate-bounce-slow">
                        <span className="text-3xl">🎁</span>
                        <span className="text-3xl">🎉</span>
                        <span className="text-3xl">✨</span>
                    </div>

                    {/* REPLAY BUTTON - Visible only when gift is dismissed */}
                    {isGiftDismissed && (
                        <button
                            onClick={handleReplayGift}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white px-3 py-1 rounded-full text-sm font-bold transition-all border border-white/50 shadow-sm flex items-center gap-2"
                            title="Réafficher le cadeau"
                        >
                            <span>🎁</span> Relancer
                        </button>
                    )}
                </div>

                {/* CENTERED GIFT TRIGGER (Visible only when celebration is NOT active AND not dismissed) */}
                {!showFullCelebration && !isGiftDismissed && (
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9050] flex flex-col items-center gap-4 cursor-pointer group">
                        <div className="relative" onClick={triggerFullCelebration}>
                            <div className="text-9xl filter drop-shadow-2xl animate-bounce group-hover:scale-110 transition-transform duration-300">
                                🎁
                            </div>
                            <div className="absolute -top-4 -right-12 bg-yellow-400 text-purple-900 font-black text-xl px-4 py-2 rounded-full animate-pulse shadow-lg rotate-12 border-4 border-white">
                                CLIC ICI !
                            </div>

                            {/* DISMISS BUTTON (X) */}
                            <button
                                onClick={handleDismissGift}
                                className="absolute -top-2 -left-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors z-50"
                                title="Masquer le cadeau"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-2xl border-4 border-purple-500 animate-pulse" onClick={triggerFullCelebration}>
                            <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 uppercase tracking-wider">
                                Ouvre ton cadeau !
                            </h3>
                        </div>
                    </div>
                )}

                <style jsx>{`
          @keyframes gradient-x {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }

          @keyframes bounce-slow {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes float {
            0% {
              transform: translateY(100vh) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(-100vh) rotate(360deg);
              opacity: 0;
            }
          }

          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 3s ease infinite;
          }

          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }

          .animate-float {
            animation: float linear infinite;
          }
        `}</style>
            </div>
        </>
    );
};
