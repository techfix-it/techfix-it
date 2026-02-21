import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  const { name, email, phone, subject, message } = await request.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 26;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log('[SMTP] Config:', { host, port, user, hasPass: !!pass });

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  try {
    await transporter.verify();
    console.log('[SMTP] Connection verified OK');
  } catch (verifyErr) {
    console.error('[SMTP] Verification failed:', verifyErr);
    return NextResponse.json(
      { error: 'SMTP connection failed.', detail: String(verifyErr) },
      { status: 500 }
    );
  }

  try {
    const info = await transporter.sendMail({
      from: `"TechFix-IT Website" <${user}>`,
      to: 'sales@techfix-it.ie',
      replyTo: email,
      subject: `[TechFix-IT] ${subject}`,
      html: `
        <h2>New message from the website contact form</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });

    console.log('[SMTP] Email sent:', info.messageId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SMTP] Send error:', error);
    return NextResponse.json({ error: 'Failed to send email.', detail: String(error) }, { status: 500 });
  }
}
