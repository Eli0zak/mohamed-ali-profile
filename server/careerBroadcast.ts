import nodemailer from "nodemailer";
import type { CareerSubmission } from "../drizzle/schema";

export type BroadcastAudience =
  | { type: "all" }
  | { type: "field"; field: string }
  | { type: "test" };

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

function renderJobDetails(value: string): string {
  const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return "";

  const blocks: string[] = [];
  let bullets: string[] = [];
  const flushBullets = () => {
    if (bullets.length === 0) return;
    blocks.push(`<ul style="margin:0 0 14px 20px;padding:0;color:#334155;">${bullets.map((bullet) => `<li style="margin:0 0 7px;padding-left:4px;">${escapeHtml(bullet)}</li>`).join("")}</ul>`);
    bullets = [];
  };

  for (const line of lines) {
    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
      continue;
    }
    flushBullets();
    blocks.push(`<p style="margin:0 0 14px;color:#334155;font-size:15px;line-height:1.7;">${escapeHtml(line)}</p>`);
  }
  flushBullets();
  return blocks.join("");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function filterBroadcastSubmissions(
  submissions: CareerSubmission[],
  audience: Exclude<BroadcastAudience, { type: "test" }>,
): CareerSubmission[] {
  if (audience.type === "all") return submissions;
  const targetField = audience.field.trim().toLocaleLowerCase();
  return submissions.filter((submission) => submission.field.trim().toLocaleLowerCase() === targetField);
}

function getRecipients(
  submissions: CareerSubmission[],
  audience: BroadcastAudience,
  testRecipient?: string,
): string[] {
  if (audience.type === "test") {
    const recipient = testRecipient ? normalizeEmail(testRecipient) : "";
    return recipient && isValidEmail(recipient) ? [recipient] : [];
  }

  const selectedSubmissions = filterBroadcastSubmissions(submissions, audience);
  return Array.from(new Set(
    selectedSubmissions
      .map((submission) => normalizeEmail(submission.email))
      .filter(isValidEmail),
  ));
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
  const contactName = input.contactName?.trim() || "Not provided";
  const contactEmail = input.contactEmail?.trim() || "Not provided";
  const contactLinkedin = safeLinkedinUrl && /^https?:\/\//i.test(safeLinkedinUrl) ? safeLinkedinUrl : "Not provided";
  const additionalInstructions = input.otherInstructions?.trim() || "Not provided";
  const detailsHtml = renderJobDetails(input.jobDetails);
  const contactEmailHtml = contactEmail === "Not provided"
    ? contactEmail
    : `<a href="mailto:${escapeHtml(contactEmail)}" style="color:#b45309;text-decoration:none;">${escapeHtml(contactEmail)}</a>`;
  const linkedinHtml = contactLinkedin === "Not provided"
    ? contactLinkedin
    : `<a href="${escapeHtml(contactLinkedin)}" style="color:#b45309;text-decoration:underline;">${escapeHtml(contactLinkedin)}</a>`;

  return {
    subject: `Job opportunity: ${input.jobTitle}`,
    text: [
      "Mohamed Ali — Career Gateway",
      "",
      input.jobTitle,
      "",
      input.jobDetails,
      "",
      "HOW TO APPLY",
      `Contact Name: ${contactName}`,
      `Contact Email: ${contactEmail}`,
      `LinkedIn URL: ${contactLinkedin}`,
      `Additional Instructions: ${additionalInstructions}`,
      "",
      "This opportunity was shared through Mohamed Ali's professional network. Please reach out to the contact above directly.",
    ].join("\n"),
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#eef2f7;color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#eef2f7;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;background:#ffffff;border:1px solid #dbe3ee;">
            <tr>
              <td style="padding:28px 30px;background:#070B14;color:#ffffff;">
                <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#F59E0B;font-weight:bold;">Professional opportunity</div>
                <div style="margin-top:8px;font-size:23px;line-height:1.25;font-weight:bold;color:#ffffff;">Mohamed Ali — Career Gateway</div>
                <div style="margin-top:7px;font-size:13px;line-height:1.5;color:#cbd5e1;">A verified opportunity shared through Mohamed Ali's professional network.</div>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 30px 24px;background:#ffffff;">
                <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#b45309;font-weight:bold;">New opportunity</div>
                <h1 style="margin:8px 0 20px;font-size:29px;line-height:1.2;color:#0c1f39;font-weight:700;">${escapeHtml(input.jobTitle)}</h1>
                <div style="font-size:15px;line-height:1.7;color:#334155;">${detailsHtml}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 30px 28px;background:#ffffff;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-top:1px solid #e2e8f0;">
                  <tr>
                    <td style="padding:22px 20px 18px;background:#f8fafc;">
                      <div style="font-size:16px;line-height:1.3;color:#0c1f39;font-weight:bold;">How to Apply</div>
                      <div style="margin-top:5px;font-size:12px;line-height:1.5;color:#64748b;">Use the contact information below for the next step.</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 20px 18px;background:#f8fafc;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;font-size:13px;line-height:1.55;color:#334155;">
                        <tr><td width="146" style="padding:8px 0;color:#b45309;font-size:10px;letter-spacing:1px;text-transform:uppercase;font-weight:bold;vertical-align:top;">Contact Name</td><td style="padding:8px 0;vertical-align:top;">${escapeHtml(contactName)}</td></tr>
                        <tr><td width="146" style="padding:8px 0;color:#b45309;font-size:10px;letter-spacing:1px;text-transform:uppercase;font-weight:bold;vertical-align:top;">Contact Email</td><td style="padding:8px 0;vertical-align:top;word-break:break-word;">${contactEmailHtml}</td></tr>
                        <tr><td width="146" style="padding:8px 0;color:#b45309;font-size:10px;letter-spacing:1px;text-transform:uppercase;font-weight:bold;vertical-align:top;">LinkedIn URL</td><td style="padding:8px 0;vertical-align:top;word-break:break-word;">${linkedinHtml}</td></tr>
                        <tr><td width="146" style="padding:8px 0;color:#b45309;font-size:10px;letter-spacing:1px;text-transform:uppercase;font-weight:bold;vertical-align:top;">Additional Instructions</td><td style="padding:8px 0;vertical-align:top;">${renderMultiline(additionalInstructions)}</td></tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 30px 28px;background:#ffffff;">
                <p style="margin:0;padding-top:18px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.7;">This opportunity was shared through Mohamed Ali's professional network. Please reach out to the contact above directly.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}

export async function sendBroadcastOpportunity(
  input: BroadcastOpportunityInput,
  submissions: CareerSubmission[],
  options: { audience?: BroadcastAudience; testRecipient?: string } = {},
): Promise<BroadcastResult> {
  const audience = options.audience ?? { type: "all" };
  const recipients = getRecipients(submissions, audience, options.testRecipient);

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
