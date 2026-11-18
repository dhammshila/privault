// Vercel Serverless Function - /api/send-reset-email
// Always returns valid JSON, never crashes with plain-text errors

export default async function handler(req, res) {
  // Always set JSON content type first
  res.setHeader('Content-Type', 'application/json');

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Check API key is configured
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY environment variable is not set in Vercel');
    return res.status(503).json({
      success: false,
      message: 'Email service is not configured. Please add RESEND_API_KEY to Vercel environment variables.',
    });
  }

  // Safely get body
  let email, resetLink;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    email = body?.email;
    resetLink = body?.resetLink;
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  }

  if (!email || !resetLink) {
    return res.status(400).json({ success: false, message: 'Email and resetLink are required' });
  }

  // Dynamically import Resend to avoid module-level crash
  let Resend;
  try {
    const mod = await import('resend');
    Resend = mod.Resend;
  } catch (importErr) {
    console.error('Failed to import resend:', importErr);
    return res.status(500).json({
      success: false,
      message: 'Email library failed to load. Please ensure resend is in package.json dependencies.',
    });
  }

  try {
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: 'Privault <onboarding@resend.dev>',
      to: [email],
      subject: 'Privault – Reset Your Master Password',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0a0e16;color:#fff;padding:32px;border-radius:16px;border:1px solid rgba(0,242,254,0.2)">
          <div style="text-align:center;margin-bottom:24px">
            <div style="width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#00f2fe,#0051ff);display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:28px">🔒</div>
            <h2 style="margin:0;color:#00f2fe;font-size:1.4rem">Reset Your Privault Password</h2>
          </div>
          <p style="color:#94a3b8">We received a request to reset your Privault master password. Click the button below:</p>
          <div style="text-align:center;margin:28px 0">
            <a href="${resetLink}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#00f2fe,#0051ff);color:#050a14;text-decoration:none;border-radius:10px;font-weight:700;font-size:1rem">
              🔑 Reset Password
            </a>
          </div>
          <p style="color:#64748b;font-size:0.85rem;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px">
            If you did not request this, ignore this email. Your vault remains secure.
          </p>
          <p style="color:#64748b;font-size:0.85rem">— The Privault Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      return res.status(500).json({
        success: false,
        message: `Failed to send email: ${error.message || 'Unknown error from email provider'}`,
      });
    }

    return res.status(200).json({ success: true, message: 'Password reset email sent!', id: data?.id });
  } catch (err) {
    console.error('Unexpected error in send-reset-email:', err);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
    });
  }
}