import nodemailer from "nodemailer";

const SERVICE_LABELS: Record<string, string> = {
  brand: "Brand Identity",
  editorial: "Editorial Design",
  illustration: "Digital Illustration",
  direction: "Creative Direction",
  other: "Other",
};

export type ContactPayload = {
  name: string;
  email: string;
  service: string;
  message: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Set SMTP credentials in the environment to send contact emails.`);
  }
  return value;
}

export type ValidationResult =
  | { ok: true; data: ContactPayload; error?: undefined }
  | { ok: false; error: string; data?: undefined };

export function validateContactPayload(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const { name, email, service, message } = body as Record<string, unknown>;
  const data: ContactPayload = {
    name: typeof name === "string" ? name.trim() : "",
    email: typeof email === "string" ? email.trim() : "",
    service: typeof service === "string" ? service.trim() : "",
    message: typeof message === "string" ? message.trim() : "",
  };

  if (!data.name) return { ok: false, error: "Name is required" };
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { ok: false, error: "A valid email is required" };
  }
  if (!data.service || !SERVICE_LABELS[data.service]) {
    return { ok: false, error: "Please select a service" };
  }
  if (!data.message) return { ok: false, error: "Message is required" };
  if (data.message.length > 5000) return { ok: false, error: "Message is too long" };

  return { ok: true, data };
}

export async function sendContactEmail(payload: ContactPayload): Promise<void> {
  const host = requireEnv("SMTP_HOST");
  const user = requireEnv("SMTP_USER");
  const pass = requireEnv("SMTP_PASS");
  const to = (process.env.CONTACT_TO_EMAIL || "jake@foliobyjake.com").trim();
  const from = (process.env.CONTACT_FROM_EMAIL || user).trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const projectType = SERVICE_LABELS[payload.service];
  const safeName = escapeHtml(payload.name);
  const safeEmail = escapeHtml(payload.email);
  const safeMessage = escapeHtml(payload.message).replace(/\n/g, "<br>");

  await transporter.sendMail({
    from: `"Folio by Jake" <${from}>`,
    to,
    replyTo: payload.email,
    subject: `New inquiry from ${payload.name} — ${projectType}`,
    text: [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Project type: ${projectType}`,
      "",
      payload.message,
    ].join("\n"),
    html: `
      <h2>New contact inquiry</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Project type:</strong> ${escapeHtml(projectType)}</p>
      <p><strong>Message:</strong></p>
      <p>${safeMessage}</p>
    `,
  });
}
