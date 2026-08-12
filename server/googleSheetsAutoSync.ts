import { ENV } from "./_core/env";
import fs from "fs";
import path from "path";

export interface SubmissionData {
  createdAt?: Date | string;
  fullName: string;
  phoneNumber: string;
  email: string;
  field: string;
  yearsOfExperience: string;
  availability: string;
  trainingSectorExperience: number | string;
  cvUrl: string;
  cvFileName?: string;
  message?: string;
  status?: string;
}

export async function appendToGoogleSheet(sub: SubmissionData) {
  const timestamp = new Date(sub.createdAt || Date.now()).toISOString();
  const rowData = [
    timestamp,
    sub.fullName,
    sub.phoneNumber,
    sub.email,
    sub.field,
    sub.yearsOfExperience,
    sub.availability,
    sub.trainingSectorExperience ? "Yes" : "No",
    sub.cvUrl,
    sub.cvFileName || "CV_Document",
    sub.message || "",
    sub.status || "New"
  ];

  // Store locally in append-only csv backup and sync log for instant inspection and export
  const exportDir = path.join(process.cwd(), "storage", "sheets");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  const csvPath = path.join(exportDir, "candidate_submissions.csv");
  
  const line = rowData.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",") + "\n";
  if (!fs.existsSync(csvPath)) {
    const header = `"Date","Full Name","Phone","Email","Field / Specialization","Years of Experience","Availability","Training Sector Experience (Yes/No)","CV File Link","Message / Notes","Status"\n`;
    fs.writeFileSync(csvPath, header, "utf8");
  }
  fs.appendFileSync(csvPath, line, "utf8");

  // If a live Apps Script / Sheets Webhook URL is configured
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: timestamp,
          fullName: sub.fullName,
          phoneNumber: sub.phoneNumber,
          email: sub.email,
          field: sub.field,
          yearsOfExperience: sub.yearsOfExperience,
          availability: sub.availability,
          trainingSectorExperience: sub.trainingSectorExperience ? "Yes" : "No",
          cvUrl: sub.cvUrl,
          cvFileName: sub.cvFileName || "CV_Document",
          message: sub.message || "",
          status: sub.status || "New"
        }),
      });
      console.log("[Google Sheets AutoSync] Successfully posted row to Google Apps Script Webhook.");
    } catch (err) {
      console.error("[Google Sheets AutoSync Error] Failed to post to webhook:", err);
    }
  }

  return { success: true, rowData };
}
