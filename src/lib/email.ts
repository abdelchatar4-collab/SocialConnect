import nodemailer from 'nodemailer';

interface EmailPayload {
    to: string;
    cc?: string;
    subject: string;
    html: string;
}

export const sendEmail = async (data: EmailPayload) => {
    // Check if SMTP is configured
    const isConfigured = process.env.SMTP_HOST && process.env.SMTP_USER;

    if (!isConfigured) {
        console.log('---------------------------------------------------');
        console.log('📧 [EMAIL SIMULATION] SMTP not configured');
        console.log(`To: ${data.to}`);
        if (data.cc) console.log(`CC: ${data.cc}`);
        console.log(`Subject: ${data.subject}`);
        console.log('--- Content ---');
        console.log(data.html.replace(/<[^>]*>?/gm, '')); // Strip HTML for console readability
        console.log('---------------------------------------------------');
        return true;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    return await transporter.sendMail({
        from: process.env.SMTP_FROM,
        ...data,
    });
};
