/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Prestation Form Constants
*/

export const QUICK_PRESETS = [
    { id: 'standard', name: 'Journée standard', start: '09:00', end: '17:00', pause: 30, motif: 'Présence' },
    { id: 'teletravail', name: 'Télétravail', start: '09:00', end: '17:00', pause: 30, motif: 'Télétravail' },
    { id: 'matin', name: 'Matin uniquement', start: '09:00', end: '12:30', pause: 0, motif: 'Présence' },
    { id: 'aprem', name: 'Après-midi', start: '13:00', end: '17:00', pause: 0, motif: 'Présence' },
    { id: 'conge_va', name: 'Congé VA', start: '09:00', end: '17:00', pause: 30, motif: 'Congé VA' },
    { id: 'conge_ch', name: 'Congé CH', start: '09:00', end: '17:00', pause: 30, motif: 'Congé CH' },
    { id: 'maladie', name: 'Maladie', start: '09:00', end: '17:00', pause: 30, motif: 'Maladie' },
    { id: 'formation', name: 'Formation', start: '09:00', end: '17:00', pause: 30, motif: 'Formation' },
    { id: 'jour_sans_certificat', name: '1 jour sans certificat', start: '09:00', end: '17:00', pause: 30, motif: '1 jour sans certificat' },
];

export const FULL_DAY_MOTIFS = ['Maladie', 'Congé VA', 'Congé CH', 'Jour férié', '1 jour sans certificat', 'jour_sans_certificat'];

export const HOLIDAYS_2026 = [
    '2026-01-01', '2026-01-02', '2026-04-06', '2026-05-01',
    '2026-05-14', '2026-05-15', '2026-05-25', '2026-07-20',
    '2026-07-21', '2026-08-17', '2026-09-15', '2026-11-02',
    '2026-11-11', '2026-12-24', '2026-12-25', '2026-12-31',
];
