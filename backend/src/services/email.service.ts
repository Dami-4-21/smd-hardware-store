import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface CustomerCredentialsEmailData {
  customerEmail: string;
  customerName: string;
  username: string;
  password: string;
  companyName?: string;
}

/**
 * Send customer account credentials via email
 */
export const sendCustomerCredentials = async (data: CustomerCredentialsEmailData): Promise<void> => {
  const { customerEmail, customerName, username, password, companyName } = data;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'SMD Tunisie'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: customerEmail,
    subject: 'Votre compte client SMD Tunisie - Identifiants de connexion',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
          .credentials { background-color: white; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0; }
          .credential-item { margin: 10px 0; }
          .credential-label { font-weight: bold; color: #1f2937; }
          .credential-value { color: #2563eb; font-size: 18px; font-family: monospace; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bienvenue chez SMD Tunisie</h1>
          </div>
          
          <div class="content">
            <p>Bonjour <strong>${customerName}</strong>,</p>
            ${companyName ? `<p>Entreprise: <strong>${companyName}</strong></p>` : ''}
            
            <p>Votre compte client a été créé avec succès par notre équipe administrative. Vous pouvez maintenant accéder à notre plateforme pour passer vos commandes.</p>
            
            <div class="credentials">
              <h3>Vos identifiants de connexion :</h3>
              
              <div class="credential-item">
                <div class="credential-label">Nom d'utilisateur :</div>
                <div class="credential-value">${username}</div>
              </div>
              
              <div class="credential-item">
                <div class="credential-label">Mot de passe :</div>
                <div class="credential-value">${password}</div>
              </div>
              
              <div class="credential-item">
                <div class="credential-label">Email :</div>
                <div class="credential-value">${customerEmail}</div>
              </div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important :</strong>
              <ul>
                <li>Veuillez conserver ces identifiants en lieu sûr</li>
                <li>Nous vous recommandons de changer votre mot de passe après votre première connexion</li>
                <li>Ne partagez jamais vos identifiants avec d'autres personnes</li>
              </ul>
            </div>
            
            <p>Pour vous connecter, rendez-vous sur notre site web et utilisez les identifiants ci-dessus.</p>
            
            <p>Si vous avez des questions ou besoin d'assistance, n'hésitez pas à nous contacter.</p>
            
            <p>Cordialement,<br>
            <strong>L'équipe SMD Tunisie</strong></p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} SMD Tunisie. Tous droits réservés.</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Bonjour ${customerName},

${companyName ? `Entreprise: ${companyName}\n\n` : ''}

Votre compte client a été créé avec succès par notre équipe administrative.

Vos identifiants de connexion :
- Nom d'utilisateur : ${username}
- Mot de passe : ${password}
- Email : ${customerEmail}

IMPORTANT :
- Veuillez conserver ces identifiants en lieu sûr
- Nous vous recommandons de changer votre mot de passe après votre première connexion
- Ne partagez jamais vos identifiants avec d'autres personnes

Pour vous connecter, rendez-vous sur notre site web et utilisez les identifiants ci-dessus.

Cordialement,
L'équipe SMD Tunisie

© ${new Date().getFullYear()} SMD Tunisie. Tous droits réservés.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✓ Credentials email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Error sending credentials email:', error);
    throw new Error('Failed to send credentials email');
  }
};

/**
 * Verify email configuration
 */
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('✓ Email service is ready');
    return true;
  } catch (error) {
    console.error('✗ Email service configuration error:', error);
    return false;
  }
};
