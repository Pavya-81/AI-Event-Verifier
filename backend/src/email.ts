import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendChangesRequestedEmail(options: {
  to: string;
  eventTitle: string;
  adminNote: string;
  findings: any[];
}) {
  if (!process.env.SMTP_HOST) {
    throw new Error('SMTP configuration is missing');
  }

  const findingsList = options.findings?.length
    ? options.findings.map(f => `<li><strong>${f.source} Issue (${f.severity}):</strong> ${f.message}</li>`).join('')
    : '<li>No specific findings automatically flagged. See Admin note.</li>';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">EventShield AI</h2>
      <h3>Action Required: Changes Requested for Your Event</h3>
      <p>Hello,</p>
      <p>Your event <strong>"${options.eventTitle}"</strong> has been reviewed by an Admin, and changes are required before it can be published.</p>
      
      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #b45309;">Admin Note</h4>
        <p style="margin-bottom: 0;">${options.adminNote || 'No additional notes provided by admin.'}</p>
      </div>

      <h4>AI Verification Findings</h4>
      <ul>
        ${findingsList}
      </ul>

      <p><strong>Next Steps:</strong></p>
      <p>Please log in to your EventShield AI organizer dashboard to review these requested changes and update your event details.</p>
      
      <p style="margin-top: 30px; font-size: 0.85em; color: #6b7280;">
        Thank you,<br/>
        The EventShield AI Team
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"EventShield AI" <noreply@eventshield.ai>',
    to: options.to,
    subject: 'Action Required: Changes Requested for Your Event',
    html,
  });
}
