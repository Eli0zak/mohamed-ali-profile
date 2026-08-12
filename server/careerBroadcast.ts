import nodemailer from "nodemailer";
import type { CareerSubmission } from "../drizzle/schema";

export type BroadcastOpportunityInput = {
  jobTitle: string;
  jobDetails: string;
  contactName?: string;
  contactEmail?: string;
  contactLinkedin?: string;
  otherInstructions?: string;
};

export type BroadcastResult = {
  recipientCount: number;
  successCount: number;
  failureCount: number;
};

function requiredSmtpValue(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`SMTP is not configured: missing ${name}`);
  }
  return value;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderMultiline(value: string): string {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

function createTransporter() {
  const port = Number(requiredSmtpValue("SMTP_PORT"));
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("SMTP is not configured: SMTP_PORT must be a valid port");
  }

  return nodemailer.createTransport({
    host: requiredSmtpValue("SMTP_HOST"),
    port,
    secure: port === 465,
    auth: {
      user: requiredSmtpValue("SMTP_USER"),
      pass: requiredSmtpValue("SMTP_PASSWORD"),
    },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  });
}

export function buildOpportunityEmail(input: BroadcastOpportunityInput) {
  const safeLinkedinUrl = input.contactLinkedin?.trim();
  const contactLines = [
    input.contactName ? `<strong>Contact:</strong> ${escapeHtml(input.contactName)}` : "",
    input.contactEmail ? `<strong>Email:</strong> ${escapeHtml(input.contactEmail)}` : "",
    safeLinkedinUrl && /^https?:\/\//i.test(safeLinkedinUrl)
      ? `<strong>LinkedIn:</strong> <a href=\"${escapeHtml(safeLinkedinUrl)}\">${escapeHtml(safeLinkedinUrl)}</a>`
      : "",
  ].filter(Boolean);

  const instructions = input.otherInstructions?.trim()
    ? `<h3>Additional instructions</h3><p>${renderMultiline(input.otherInstructions.trim())}</p>`
    : "";

  return {
    subject: `Job opportunity: ${input.jobTitle}`,
    text: [
      input.jobTitle,
      "",
      input.jobDetails,
      "",
      contactLines.length ? "Opportunity contact:" : "",
      input.contactName ? `Name: ${input.contactName}` : "",
      input.contactEmail ? `Email: ${input.contactEmail}` : "",
      input.contactLinkedin ? `LinkedIn: ${input.contactLinkedin}` : "",
      input.otherInstructions ? `\nAdditional instructions:\n${input.otherInstructions}` : "",
    ].filter(Boolean).join("\n"),
    html: `<!doctype html><html><body style=\"margin:0;background:#07090e;color:#e2e8f0;font-family:Arial,sans-serif;line-height:1.6;\"><div style=\"max-width:640px;margin:0 auto;padding:32px 20px;\"><div style=\"background:#111827;border:1px solid #273244;border-radius:18px;padding:28px;\"><p style=\"margin:0 0 8px;color:#d4af37;font-size:12px;letter-spacing:2px;text-transform:uppercase;\">Career opportunity</p><h1 style=\"margin:0 0 20px;color:#fff;font-size:26px;\">${escapeHtml(input.jobTitle)}</h1><div style=\"color:#cbd5e1;\"><p>${renderMultiline(input.jobDetails)}</p>${contactLines.length ? `<h3>Opportunity contact</h3><p>${contactLines.join("<br />")}</p>` : ""}${instructions}</div></div><p style=\"color:#64748b;font-size:12px;margin-top:18px;\">This opportunity was shared through Mohamed Ali's professional network.</p></div></body></html>`,
  };
}

export async function sendBroadcastOpportunity(
  input: BroadcastOpportunityInput,
  submissions: CareerSubmission[],
): Promise<BroadcastResult> {
  const recipients = Array.from(new Set(
    submissions
      .map((submission) => submission.email.trim().toLowerCase())
      .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
  ));

  if (recipients.length === 0) {
    return { recipientCount: 0, successCount: 0, failureCount: 0 };
  }

  const transporter = createTransporter();
  const message = buildOpportunityEmail(input);
  const from = requiredSmtpValue("SMTP_FROM");
  let successCount = 0;
  let failureCount = 0;

  try {
    for (const recipient of recipients) {
      try {
        await transporter.sendMail({
          from,
          to: recipient,
          replyTo: input.contactEmail?.trim() || from,
          subject: message.subject,
          text: message.text,
          html: message.html,
        });
        successCount += 1;
      } catch (error) {
        failureCount += 1;
        console.error("[Career Broadcast] Failed to send message", {
          recipient,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  } finally {
    transporter.close();
  }

  return {
    recipientCount: recipients.length,
    successCount,
    failureCount,
  };
}
