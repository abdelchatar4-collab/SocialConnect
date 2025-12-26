/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getServiceClient } from '@/lib/prisma-clients';
import { getDynamicServiceId } from '@/lib/auth-utils';
import { authOptions } from '@/lib/authOptions';
import { sendEmail } from '@/lib/email';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);

  try {
    const conges = await prisma.conge.findMany({
      include: { gestionnaire: { select: { nom: true, prenom: true, id: true, email: true } } },
      orderBy: { startDate: 'desc' }
    });
    return NextResponse.json(conges);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);

  try {
    const data = await req.json();
    const { startDate, endDate, type, reason } = data;

    // Si gestionnaireId n'est pas fourni, on utilise l'ID de l'utilisateur connecté (auto-déclaration)
    const targetGestionnaireId = data.gestionnaireId || (session.user as any).id;

    if (!targetGestionnaireId) {
      return NextResponse.json({ error: 'Gestionnaire introuvable' }, { status: 400 });
    }

    const conge = await prisma.conge.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        gestionnaire: { connect: { id: targetGestionnaireId } },
        reason
      },
      include: {
        gestionnaire: {
          select: {
            email: true,
            prenom: true,
            nom: true
          }
        }
      }
    });

    // Envoi de l'email de confirmation
    if (conge.gestionnaire?.email) {
      try {
        await sendEmail({
          to: conge.gestionnaire.email,
          subject: `Confirmation de congé - ${type}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #059669;">Confirmation de demande de congé</h2>
              <p>Bonjour ${conge.gestionnaire.prenom},</p>
              <p>Votre demande de congé a bien été enregistrée :</p>
              <ul>
                <li><strong>Type :</strong> ${type}</li>
                <li><strong>Du :</strong> ${new Date(startDate).toLocaleDateString('fr-FR')}</li>
                <li><strong>Au :</strong> ${new Date(endDate).toLocaleDateString('fr-FR')}</li>
                ${reason ? `<li><strong>Motif :</strong> ${reason}</li>` : ''}
              </ul>
              <p>Cordialement,<br>L'équipe SocialConnect</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email:", emailError);
        // On ne bloque pas la réponse si l'email échoue
      }
    }

    return NextResponse.json(conge);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur création' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

  try {
    await prisma.conge.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }
}
