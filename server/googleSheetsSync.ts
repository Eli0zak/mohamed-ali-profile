import { ENV } from "./_core/env";

export async function syncSubmissionToGoogleSheet(submission: {
  fullName: string;
  phoneNumber: string;
  email: string;
  field: string;
  yearsOfExperience: string;
  availability: string;
  trainingSectorExperience: number;
  cvUrl: string;
  cvFileName?: string;
  message?: string;
  createdAt?: Date;
}) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  
  const payload = {
    timestamp: (submission.createdAt || new Date()).toISOString(),
    fullName: submission.fullName,
    phoneNumber: submission.phoneNumber,
    email: submission.email,
    field: submission.field,
    yearsOfExperience: submission.yearsOfExperience,
    availability: submission.availability,
    trainingSectorExperience: submission.trainingSectorExperience ? "Yes" : "No",
    cvUrl: submission.cvUrl,
    cvFileName: submission.cvFileName || "CV_Document",
    message: submission.message || "",
    status: "New"
  };

  if (!webhookUrl) {
    console.log("[Google Sheets] Webhook URL not configured yet. Submission stored in database and ready for sheet sync. Payload:", payload);
    return { success: true, syncedToSheet: false, reason: "Webhook URL not configured" };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Google Sheets Webhook returned status ${res.status}`);
    }

    console.log("[Google Sheets] Successfully synced submission to Google Sheet for:", submission.email);
    return { success: true, syncedToSheet: true };
  } catch (error) {
    console.error("[Google Sheets Sync Error]:", error);
    return { success: false, syncedToSheet: false, error: String(error) };
  }
}
