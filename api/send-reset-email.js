import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Set CORS headers for Vercel
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    // Safely parse request body
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid request body. Expected JSON.",
        });
      }
    }

    const { email, resetLink } = body || {};

    if (!email || !resetLink) {
      return res.status(400).json({
        success: false,
        message: "Email and reset link are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return res.status(503).json({
        success: false,
        message: "Email service is not configured. Please contact support.",
      });
    }

    const { data, error } = await resend.emails.send({
      from: "Privault <onboarding@resend.dev>",
      to: [email],
      subject: "Privault - Reset Your Master Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #0a0e16; color: #fff; padding: 32px; border-radius: 16px; border: 1px solid rgba(0,242,254,0.2);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #00f2fe, #0051ff); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="font-size: 28px;">🔒</span>
            </div>
            <h2 style="margin: 0; color: #00f2fe; font-size: 1.5rem;">Reset Your Privault Password</h2>
          </div>

          <p style="color: #94a3b8; margin-bottom: 16px;">
            We received a request to reset your Privault master password.
          </p>

          <p style="color: #94a3b8; margin-bottom: 24px;">
            Click the button below to reset your password. This link will expire in 1 hour.
          </p>

          <div style="text-align: center; margin-bottom: 24px;">
            <a
              href="${resetLink}"
              style="
                display: inline-block;
                padding: 14px 28px;
                background: linear-gradient(135deg, #00f2fe, #0051ff);
                color: #fff;
                text-decoration: none;
                border-radius: 10px;
                font-weight: 600;
                font-size: 1rem;
              "
            >
              🔑 Reset Password
            </a>
          </div>

          <p style="color: #64748b; font-size: 0.85rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">
            If you did not request this, you can safely ignore this email. Your vault remains secure.
          </p>

          <p style="color: #64748b; font-size: 0.85rem; margin-top: 8px;">
            — The Privault Team
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);

      // Return a helpful message rather than exposing internal error
      return res.status(500).json({
        success: false,
        message: "Failed to send email. The email service may be temporarily unavailable. Please try again later.",
        code: error.name || "RESEND_ERROR",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
      id: data?.id,
    });
  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
    });
  }
}