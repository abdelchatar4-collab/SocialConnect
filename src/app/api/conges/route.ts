import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { sendEmail } from '@/lib/email';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized or missing User ID check logs' }, { status: 401 });
    }

    const body = await req.json();
    const { startDate, endDate, type, reason } = body;

    if (!startDate || !endDate || !type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Create Conge in DB
    // Ensure Gestionnaire exists (Foreign Key)
    // First, try to find by ID (current session ID)
    let gestionnaire = await prisma.gestionnaire.findUnique({
      where: { id: session.user.id }
    });

    // If not found by ID, try finding by Email (common case for Super Admin where IDs might mismatch)
    if (!gestionnaire && session.user.email) {
      gestionnaire = await prisma.gestionnaire.findUnique({
        where: { email: session.user.email }
      });
      console.log('[API] Found gestionnaire by email fallback:', gestionnaire?.id);
    }

    if (!gestionnaire) {
      // If still not found, create a new record
      try {
        // Find a valid service ID to prevent FK violation on serviceId
        let validService = await prisma.service.findFirst();

        if (!validService) {
          console.log('[API] No service found, auto-creating default service');
          try {
            validService = await prisma.service.create({
              data: {
                name: 'Service Par Défaut',
                slug: 'service-defaut',
                description: 'Service généré automatiquement'
              }
            });
          } catch (e) {
            console.error('[API] Failed to create default service:', e);
          }
        }

        const fallbackServiceId = validService?.id || 'default';

        console.log('[API] Using serviceId for new gestionnaire:', session.user.serviceId || fallbackServiceId);

        gestionnaire = await prisma.gestionnaire.create({
          data: {
            id: session.user.id, // Try to use the session ID
            prenom: session.user.name?.split(' ')[0] || 'Admin',
            nom: session.user.name?.split(' ').slice(1).join(' ') || 'User',
            email: session.user.email,
            role: session.user.role || 'USER',
            serviceId: session.user.serviceId || fallbackServiceId
          }
        });
        console.log('[API] Auto-created missing Gestionnaire record for user:', session.user.id);
      } catch (createError) {
        console.error('[API] Failed to auto-create gestionnaire:', createError);
        // Proceed and likely fail on FK, but we tried.
      }
    }

    // Use the potentially different ID from the database record (if found by email)
    const targetGestionnaireId = gestionnaire?.id || session.user.id;

    const conge = await prisma.conge.create({
      data: {
        gestionnaireId: targetGestionnaireId, // USE THE RESOLVED ID
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        reason,
        status: 'PENDING',
      },
      include: {
        gestionnaire: true,
      },
    });

    // 2. Fetch Settings for Notification Email
    // Assuming settings are per-service or global. For now, we take the first one or generic.
    // Ideally we should link to the user's service settings.
    const settings = await prisma.settings.findFirst({
      where: { serviceId: session.user.serviceId }
    });

    const notifyEmail = settings?.absenceNotificationEmail;

    // 3. Send Email if configured
    if (notifyEmail) {
      const gestionnaireName = `${conge.gestionnaire.prenom} ${conge.gestionnaire.nom || ''}`;
      const startStr = format(new Date(startDate), 'dd MMMM yyyy', { locale: fr });
      const endStr = format(new Date(endDate), 'dd MMMM yyyy', { locale: fr });

      try {
        await sendEmail({
          to: notifyEmail,
          subject: `🔔 Nouvelle absence : ${gestionnaireName}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #1e3a8a;">Nouvelle demande d'absence</h2>
              <p><strong>${gestionnaireName}</strong> a encodé une nouvelle absence.</p>

              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Type :</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${type}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Du :</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${startStr}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Au :</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${endStr}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Motif :</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${reason || 'Aucun motif précisé'}</td>
                </tr>
              </table>

              <p style="margin-top: 20px; font-size: 12px; color: #666;">
                Ceci est une notification automatique de SocialConnect.
              </p>
            </div>
          `,
        });
        console.log(`[Email] Notification sent to ${notifyEmail}`);
      } catch (emailError) {
        console.error('[Email] Failed to send notification', emailError);
        // We don't fail the request if email fails, but we verify logs
      }
    } else {
      console.log('[Email] No notification email configured in Settings.');
    }

    return NextResponse.json(conge);
  } catch (error: any) {
    console.error('[API] Error creating conge:', error);
    if (error.code === 'P2003') {
      console.error('[API] Foreign key constraint failed. Check if gestionnaireId exists in Gestionnaire table:', error.meta);
    }
    return NextResponse.json({
      error: 'Erreur technique',
      details: error.message || 'Unknown error',
      code: error.code,
      meta: error.meta
    }, { status: 500 });
  }
}
