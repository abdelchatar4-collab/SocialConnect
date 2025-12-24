/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/prestations/holidays
 */
export async function GET(request: Request) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();
    const serviceId = (session.user as any).serviceId || 'default';

    try {
        const holidays = await prisma.holiday.findMany({
            where: {
                year,
                serviceId
            },
            orderBy: { date: 'asc' }
        });
        return NextResponse.json(holidays);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch holidays' }, { status: 500 });
    }
}

/**
 * POST /api/prestations/holidays
 */
export async function POST(request: Request) {
    const session = await getServerSession();
    if (!session || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { date, label } = await request.json();
        const d = new Date(date);
        const serviceId = (session.user as any).serviceId || 'default';

        const holiday = await prisma.holiday.create({
            data: {
                date: d,
                label,
                year: d.getFullYear(),
                serviceId
            }
        });

        return NextResponse.json(holiday);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create holiday' }, { status: 500 });
    }
}

/**
 * DELETE /api/prestations/holidays?id=...
 */
export async function DELETE(request: Request) {
    const session = await getServerSession();
    if (!session || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    try {
        await prisma.holiday.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
