/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getServiceClient } from '@/lib/prisma-clients';
import { getDynamicServiceId } from '@/lib/auth-utils';
import { authOptions } from '@/lib/authOptions';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const serviceId = await getDynamicServiceId(session);
    const prisma = getServiceClient(serviceId);
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();

    try {
        const holidays = await prisma.holiday.findMany({
            where: { year },
            orderBy: { date: 'asc' }
        });
        return NextResponse.json(holidays);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch holidays' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const serviceId = (session?.user as any).serviceId || 'default';
    const prisma = getServiceClient(serviceId);

    try {
        const { date, label } = await request.json();
        const d = new Date(date);
        const holiday = await prisma.holiday.create({
            data: { date: d, label, year: d.getFullYear() }
        });
        return NextResponse.json(holiday);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create holiday' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const serviceId = (session?.user as any).serviceId || 'default';
    const prisma = getServiceClient(serviceId);

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
