import nodemailer from 'nodemailer';

async function main() {
    console.log("🔍 Test de configuration SMTP...");

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "abdelchatar4@gmail.com",
            pass: "smjuzkvuzhdlmcag",
        },
    });

    try {
        console.log("📡 Vérification de la connexion...");
        await transporter.verify();
        console.log("✅ Connexion SMTP RÉUSSIE !");

        console.log("📨 Envoi d'un email de test...");
        const info = await transporter.sendMail({
            from: '"SocialConnect Test" <abdelchatar4@gmail.com>',
            to: "abdelchatar4@gmail.com", // Send to self
            subject: "Test SMTP SocialConnect",
            text: "Ceci est un test de configuration SMTP.",
            html: "<b>Ceci est un test de configuration SMTP.</b>",
        });

        console.log("✅ Email envoyé ! ID:", info.messageId);
    } catch (error) {
        console.error("❌ ERREUR SMTP:", error);
    }
}

main().catch(console.error);
