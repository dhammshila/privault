import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { email, resetLink } = req.body;

    if (!email || !resetLink) {
      return res.status(400).json({
        success: false,
        message: "Email and reset link are required",
      });
    }

    const { data, error } = await resend.emails.send({
      from: "Privault <onboarding@resend.dev>",
      to: [email],
      subject: "Privault - Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Reset your Privault password</h2>

          <p>
            We received a request to reset your Privault password.
          </p>

          <p>
            Click the button below to reset your password:
          </p>

          <a
            href="${resetLink}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #000;
              color: #fff;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Reset Password
          </a>

          <p style="margin-top: 20px;">
            If you did not request this, you can safely ignore this email.
          </p>

          <p>
            — Privault
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to send email",
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
      message: "Something went wrong",
    });
  }
}