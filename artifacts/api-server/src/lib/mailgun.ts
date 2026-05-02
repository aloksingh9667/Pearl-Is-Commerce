import FormData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(FormData);

function getClient() {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  if (!apiKey || !domain) return null;
  return { client: mailgun.client({ username: "api", key: apiKey }), domain };
}

export async function sendOtpEmail(to: string, otp: string, name: string): Promise<boolean> {
  const mg = getClient();
  if (!mg) { console.warn("Mailgun not configured"); return false; }
  try {
    await mg.client.messages.create(mg.domain, {
      from: `Pearlis <noreply@${mg.domain}>`,
      to: [to],
      subject: "Your Pearlis Verification Code",
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 520px; margin: 0 auto; background: #FAF7F2; padding: 48px 40px;">
          <h1 style="font-size: 28px; letter-spacing: 8px; color: #0F0F0F; margin-bottom: 8px;">PEARLIS</h1>
          <p style="color: #888; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 40px;">Fine Jewellery</p>
          <h2 style="font-size: 20px; color: #0F0F0F; margin-bottom: 16px;">Hello, ${name}</h2>
          <p style="color: #555; font-size: 14px; line-height: 1.8; margin-bottom: 32px;">
            Please use the following One-Time Password to verify your email address. This code expires in <strong>10 minutes</strong>.
          </p>
          <div style="background: #0F0F0F; padding: 24px; text-align: center; margin-bottom: 32px;">
            <span style="font-size: 36px; letter-spacing: 12px; color: #D4AF37; font-family: monospace; font-weight: bold;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 12px; line-height: 1.6;">
            If you did not request this code, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #E5E0D8; margin: 32px 0;" />
          <p style="color: #bbb; font-size: 11px; letter-spacing: 2px; text-align: center;">© PEARLIS FINE JEWELLERY</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("Mailgun sendOtpEmail error:", err);
    return false;
  }
}

export async function sendPasswordResetEmail(to: string, name: string, resetLink: string): Promise<boolean> {
  const mg = getClient();
  if (!mg) { console.warn("Mailgun not configured"); return false; }
  try {
    await mg.client.messages.create(mg.domain, {
      from: `Pearlis <noreply@${mg.domain}>`,
      to: [to],
      subject: "Reset Your Pearlis Password",
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 520px; margin: 0 auto; background: #FAF7F2; padding: 48px 40px;">
          <h1 style="font-size: 28px; letter-spacing: 8px; color: #0F0F0F; margin-bottom: 8px;">PEARLIS</h1>
          <p style="color: #888; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 40px;">Fine Jewellery</p>
          <h2 style="font-size: 20px; color: #0F0F0F; margin-bottom: 16px;">Hello, ${name}</h2>
          <p style="color: #555; font-size: 14px; line-height: 1.8; margin-bottom: 32px;">
            We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
          </p>
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${resetLink}" style="display: inline-block; background: #D4AF37; color: #0F0F0F; text-decoration: none; padding: 16px 40px; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #999; font-size: 12px; line-height: 1.6;">
            Or copy and paste this link into your browser:<br/>
            <span style="color: #D4AF37; word-break: break-all;">${resetLink}</span>
          </p>
          <p style="color: #bbb; font-size: 12px; margin-top: 24px;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #E5E0D8; margin: 32px 0;" />
          <p style="color: #bbb; font-size: 11px; letter-spacing: 2px; text-align: center;">© PEARLIS FINE JEWELLERY</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("Mailgun sendPasswordResetEmail error:", err);
    return false;
  }
}
