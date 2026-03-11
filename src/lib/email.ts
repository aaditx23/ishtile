import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  // Verify SMTP connectivity before attempting to send
  try {
    await transporter.verify();
    console.log('[email] SMTP connection verified');
  } catch (verifyError) {
    console.error('[email] SMTP verify failed:', verifyError);
    throw verifyError;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log('[email] sent to', to, '— messageId:', info.messageId);
    return info;
  } catch (error) {
    console.error('[email] sendMail failed:', error);
    throw error;
  }
}
