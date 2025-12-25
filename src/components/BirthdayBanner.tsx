/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { useEffect, useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { playHappyBirthdaySong, getCelebrationWindow } from '@/utils/celebration/birthdayUtils';
import { FullCelebrationOverlay } from './Birthday/components/FullCelebrationOverlay';
import { GiftTrigger } from './Birthday/components/GiftTrigger';

export const BirthdayBanner: React.FC = () => {
    const { enableBirthdays, colleagueBirthdays } = useAdmin();
    const [birthdayPerson, setBirthdayPerson] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showFullCelebration, setShowFullCelebration] = useState(false);
    const [isGiftDismissed, setIsGiftDismissed] = useState(false);

    useEffect(() => {
        if (!enableBirthdays || colleagueBirthdays.length === 0) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentYear = today.getFullYear();

        const celebratingColleague = colleagueBirthdays.find(colleague => {
            const [_, monthStr, dayStr] = colleague.date.split('-');
            const month = parseInt(monthStr) - 1;
            const day = parseInt(dayStr);
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
            triggerConfetti();
        } else {
            setBirthdayPerson(null);
            setIsVisible(false);
        }
    }, [enableBirthdays, colleagueBirthdays]);

    const triggerConfetti = () => {
        import('canvas-confetti').then((confetti) => {
            const duration = 3000;
            const end = Date.now() + duration;
            const colors = ['#ff69b4', '#ff1493', '#ffd700', '#ff6347', '#9370db'];

            (function frame() {
                confetti.default({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors });
                confetti.default({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());
        });
    };

    const triggerFullCelebration = () => {
        if (showFullCelebration) return;
        setShowFullCelebration(true);
        playHappyBirthdaySong();

        import('canvas-confetti').then((confetti) => {
            const duration = 20000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10001 };
            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = 50 * (timeLeft / duration);
                const rainbow = ['#ff0000', '#ffa500', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#ee82ee'];

                confetti.default({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: rainbow });
                confetti.default({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: rainbow });
            }, 250);
        });

        setTimeout(() => setShowFullCelebration(false), 20000);
    };

    const handleDismissGift = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsGiftDismissed(true);
    };

    if (!isVisible || !birthdayPerson) return null;

    return (
        <>
            {showFullCelebration && <FullCelebrationOverlay birthdayPerson={birthdayPerson} />}

            <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 animate-gradient-x z-[9000] print:hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bS0xMCAwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wLTEwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

                <div className="relative px-4 py-3 flex items-center justify-center gap-3">
                    <div className="flex items-center gap-3 animate-bounce-slow">
                        <span className="text-3xl">🎂</span><span className="text-3xl">🎉</span><span className="text-3xl">🎈</span>
                    </div>

                    <div className="text-center">
                        <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">Joyeux Anniversaire {birthdayPerson} ! 🎊</h2>
                        <p className="text-sm text-white/90 mt-1">Toute l'équipe te souhaite une merveilleuse journée !</p>
                    </div>

                    <div className="flex items-center gap-3 animate-bounce-slow">
                        <span className="text-3xl">🎁</span><span className="text-3xl">🎉</span><span className="text-3xl">✨</span>
                    </div>

                    {isGiftDismissed && (
                        <button
                            onClick={() => setIsGiftDismissed(false)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white px-3 py-1 rounded-full text-sm font-bold transition-all border border-white/50 shadow-sm flex items-center gap-2"
                        >
                            <span>🎁</span> Relancer
                        </button>
                    )}
                </div>

                {!showFullCelebration && !isGiftDismissed && (
                    <GiftTrigger onTrigger={triggerFullCelebration} onDismiss={handleDismissGift} />
                )}

                <style jsx>{`
                    @keyframes gradient-x { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                    @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                    .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 3s ease infinite; }
                    .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
                `}</style>
            </div>
        </>
    );
};
