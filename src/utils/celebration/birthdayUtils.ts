/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Birthday & Celebration Utilities
*/

/**
 * Interface for a musical note
 */
export interface MusicalNote {
    freq: number;
    duration: number;
}

/**
 * Plays the Happy Birthday melody using Web Audio API
 */
export const playHappyBirthdaySong = () => {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        const notes: MusicalNote[] = [
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

/**
 * Adjusts birthday celebration window for weekends
 */
export const getCelebrationWindow = (birthdayDate: Date) => {
    const start = new Date(birthdayDate);
    const end = new Date(birthdayDate);

    // Default window: Birthday + 3 days after
    end.setDate(end.getDate() + 3);

    // Weekend Adjustment Logic:
    // If birthday is Saturday or Sunday, celebrate Friday before -> Tuesday after
    if (birthdayDate.getDay() === 6) { // Saturday
        start.setDate(start.getDate() - 1); // Start Friday
        end.setDate(end.getDate() + 2);     // End Tuesday
    } else if (birthdayDate.getDay() === 0) { // Sunday
        start.setDate(start.getDate() - 2); // Start Friday
        end.setDate(end.getDate() + 2);     // End Tuesday
    }

    return { start, end };
};
