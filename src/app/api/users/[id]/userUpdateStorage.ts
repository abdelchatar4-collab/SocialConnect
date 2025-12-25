/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User Update Storage Helpers
*/

import prisma from '@/lib/prisma';
import { isValidUUID } from './user-api.helpers';
import { ActionInput } from './user-api.types';

export async function handleProblematiques(userId: string, probs?: any[]) {
    if (!probs) return;
    const ex = (await prisma.problematique.findMany({ where: { userId }, select: { id: true } })).map(p => p.id);
    const up = probs.filter(p => p.id && ex.includes(p.id)), cr = probs.filter(p => !p.id || !ex.includes(p.id)), de = ex.filter(id => !probs.some(p => p.id === id));
    for (const p of up) await prisma.problematique.update({ where: { id: p.id }, data: { type: p.type, description: p.description, dateSignalement: p.dateSignalement ? new Date(p.dateSignalement) : new Date() } });
    for (const p of cr) await prisma.problematique.create({ data: { type: p.type, description: p.description, dateSignalement: p.dateSignalement ? new Date(p.dateSignalement) : new Date(), userId } });
    for (const id of de) await prisma.problematique.delete({ where: { id } });
}

export async function handleActions(userId: string, acts?: ActionInput[]) {
    if (!acts) return;
    const ex = (await prisma.actionSuivi.findMany({ where: { userId }, select: { id: true } })).map(a => a.id);
    const up = acts.filter(a => a.id && isValidUUID(a.id) && ex.includes(a.id)), cr = acts.filter(a => !a.id || !isValidUUID(a.id)), de = ex.filter(id => !acts.some(a => a.id === id));
    for (const a of up) await prisma.actionSuivi.update({ where: { id: a.id }, data: { date: a.date ? new Date(a.date) : new Date(), type: a.type, partenaire: a.partenaire, description: a.description } });
    for (const a of cr) await prisma.actionSuivi.create({ data: { date: a.date ? new Date(a.date) : new Date(), type: a.type, partenaire: a.partenaire, description: a.description, userId } });
    for (const id of de) await prisma.actionSuivi.delete({ where: { id } });
}
