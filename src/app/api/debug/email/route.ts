import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { sendEmail } from '@/lib/email';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    // Only allow admins
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const configStatus = {
        SMTP_HOST: process.env.SMTP_HOST || 'MISSING',
        SMTP_PORT: process.env.SMTP_PORT || 'MISSING',
        SMTP_SECURE: process.env.SMTP_SECURE || 'MISSING',
        SMTP_USER: process.env.SMTP_USER || 'MISSING',
        SMTP_PASS_SET: !!process.env.SMTP_PASS,
        SMTP_FROM: process.env.SMTP_FROM || 'MISSING'
    };

    try {
        console.log("🔍 [DEBUG EMAIL] Config status:", configStatus);

        await sendEmail({
            to: session.user.email,
            subject: '🔍 Test Diagnostic SocialConnect',
            html: `
                <h1>Test de diagnostic email</h1>
                <p>Si vous recevez ceci, l'envoi d'emails fonctionne !</p>
                <hr>
                <h3>Configuration détectée :</h3>
                <pre>${JSON.stringify(configStatus, null, 2)}</pre>
            `
        });

        return NextResponse.json({
            success: true,
            message: `Email envoyé à ${session.user.email}`,
            config: configStatus
        });

    } catch (error: any) {
        console.error("❌ [DEBUG EMAIL] Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
            config: configStatus
        }, { status: 500 });
    }
}
