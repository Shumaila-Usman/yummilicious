import { CONTACT } from "@/lib/data/fallback";

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

function getFromAddress() {
  return (
    process.env.EMAIL_FROM ||
    `Yummilicious <${process.env.SMTP_USER || CONTACT.email}>`
  );
}

export function getOwnerEmail() {
  return process.env.OWNER_EMAIL || process.env.SMTP_USER || CONTACT.email;
}

export async function sendEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    console.warn("[email] SMTP not configured — skipped:", input.subject);
    return { ok: false, error: "Email is not configured" };
  }

  try {
    // Dynamic import keeps nodemailer out of Edge bundles
    const nodemailer = await import("nodemailer");
    const port = Number(process.env.SMTP_PORT || 587);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465 || process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transport.sendMail({
      from: getFromAddress(),
      to: Array.isArray(input.to) ? input.to.join(", ") : input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("[email]", message);
    return { ok: false, error: message };
  }
}

/** Never throws — use after successful DB writes. */
export function sendEmailSafe(input: Parameters<typeof sendEmail>[0]) {
  void sendEmail(input).catch((err) => console.error("[email] unexpected:", err));
}
