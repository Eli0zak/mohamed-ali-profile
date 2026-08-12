import { getDb } from "./db";
import { careerSubmissions } from "../drizzle/schema";
import { appendToGoogleSheet } from "./googleSheetsAutoSync";

async function migrateAll() {
  const db = await getDb();
  if (!db) {
    console.error("Database connection unavailable");
    return;
  }
  const allSubs = await db.select().from(careerSubmissions);
  console.log(`[Migration] Found ${allSubs.length} candidate submissions in database. Exporting to Google Sheet sync target...`);
  
  for (const sub of allSubs) {
    await appendToGoogleSheet({
      createdAt: sub.createdAt,
      fullName: sub.fullName,
      phoneNumber: sub.phoneNumber,
      email: sub.email,
      field: sub.field,
      yearsOfExperience: sub.yearsOfExperience,
      availability: sub.availability,
      trainingSectorExperience: sub.trainingSectorExperience,
      cvUrl: sub.cvUrl,
      cvFileName: sub.cvFileName || "CV_Document",
      message: sub.message || "",
      status: sub.status
    });
  }
  console.log("[Migration] Successfully migrated all database submissions to the Google Sheet sync target.");
}

migrateAll().catch(console.error);
