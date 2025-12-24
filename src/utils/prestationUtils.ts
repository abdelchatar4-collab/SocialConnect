/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

/**
 * Utility functions for time calculations in the Prestations (Timesheet) module.
 * Logic:
 * - Standard day = 7h30 (450 minutes).
 * - "Bonis" = Any time spent beyond 7h30.
 * - "Heures supplémentaires" = Any time worked after 19:00.
 */

/**
 * Converts "HH:mm" to total minutes from the start of the day.
 */
export const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
};

/**
 * Converts total minutes to "HH:mm" format.
 */
export const minutesToTime = (minutes: number): string => {
    const h = Math.floor(Math.abs(minutes) / 60);
    const m = Math.abs(minutes) % 60;
    const sign = minutes < 0 ? '-' : '';
    return `${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/**
 * interface for Prestation Breakdown
 */
export interface PrestationBreakdown {
    totalMinutes: number;
    regularMinutes: number;
    bonisMinutes: number;
    overtimeMinutes: number;
}

/**
 * Calculates the breakdown of a working period.
 * @param startTime "HH:mm"
 * @param endTime "HH:mm"
 * @param pauseMinutes number
 * @param standardDayMinutes default 450 (7h30)
 */
export const calculatePrestationBreakdown = (
    startTime: string,
    endTime: string,
    pauseMinutes: number = 0,
    standardDayMinutes: number = 450
): PrestationBreakdown => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const overtimeStart = timeToMinutes("19:00");

    if (end <= start) return { totalMinutes: 0, regularMinutes: 0, bonisMinutes: 0, overtimeMinutes: 0 };

    const rawMinutes = end - start;
    const totalMinutes = Math.max(0, rawMinutes - pauseMinutes);

    // Overtime logic: Any work performed after 19:00
    let overtimeMinutes = 0;
    if (end > overtimeStart) {
        overtimeMinutes = end - Math.max(start, overtimeStart);
        // Note: Overtime after 19:00 doesn't deduct pause minutes unless requested specifically,
        // usually pause is during the day. Keeping it simple.
    }

    // Base working minutes (excluding overtime after 19:00)
    const dayMinutes = totalMinutes - overtimeMinutes;

    let regularMinutes = Math.min(dayMinutes, standardDayMinutes);
    let bonisMinutes = Math.max(0, dayMinutes - standardDayMinutes);

    return {
        totalMinutes,
        regularMinutes,
        bonisMinutes,
        overtimeMinutes
    };
};

/**
 * Formats duration in a human readable way (e.g. "7h 30m").
 */
export const formatDurationHuman = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m.toString().padStart(2, '0')}m`;
};
