import nodemailer from 'nodemailer';

type SendEmailParams = {
  to: string[];
  subject: string;
  html: string;
};

function boolEnv(v: string | undefined): boolean {
  return v === '1' || v === 'true' || v === 'yes';
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const { to, subject, html } = params;

  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = boolEnv(process.env.SMTP_SECURE);
  const from = process.env.SMTP_FROM ?? user;

  if (!host || !portRaw || !user || !pass) {
    throw new Error('smtp_not_configured');
  }

  const port = Number(portRaw);
  if (!Number.isFinite(port)) {
    throw new Error('invalid_smtp_port');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}
