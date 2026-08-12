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

const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbziXsCWZAD39pSvuM-8jF-Pz_rFYknWM1oWejqWBSBW4zNvFz3W1X13nQJLPBGoOQZOlQ/exec";

export async function appendToGoogleSheet(sub: SubmissionData) {
  const timestamp = new Date(sub.createdAt || Date.now()).toISOString();
  const statusVal = sub.status && sub.status.trim() !== "" ? sub.status : "New";

  const payload = {
    date: timestamp,
    fullName: sub.fullName || "",
    phoneNumber: sub.phoneNumber || "",
    email: sub.email || "",
    field: sub.field || "",
    yearsOfExperience: sub.yearsOfExperience || "",
    availability: sub.availability || "",
    trainingSectorExperience: sub.trainingSectorExperience ? "Yes" : "No",
    cvUrl: sub.cvUrl || "",
    cvFileName: sub.cvFileName || "CV_Document",
    message: sub.message || "",
    status: statusVal
  };

  // Local backup CSV
  const exportDir = path.join(process.cwd(), "storage", "sheets");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  const csvPath = path.join(exportDir, "candidate_submissions.csv");
  const rowData = [
    payload.date,
    payload.fullName,
    payload.phoneNumber,
    payload.email,
    payload.field,
    payload.yearsOfExperience,
    payload.availability,
    payload.trainingSectorExperience,
    payload.cvUrl,
    payload.message,
    payload.status
  ];
  const line = rowData.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",") + "\n";
  if (!fs.existsSync(csvPath)) {
    const header = `"Date","Full Name","Phone","Email","Field / Specialization","Years of Experience","Availability","Training Sector Experience (Yes/No)","CV File Link","Message / Notes","Status"\n`;
    fs.writeFileSync(csvPath, header, "utf8");
  }
  fs.appendFileSync(csvPath, line, "utf8");

  // Send to user's Google Apps Script Web App
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      redirect: "follow",
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    console.log("[Google Sheets Webhook Map Fix] Response received:", text);
    return { success: true, webhookResponse: text };
  } catch (err) {
    console.error("[Google Sheets Webhook Map Fix Error]:", err);
    return { success: false, error: String(err) };
  }
}
