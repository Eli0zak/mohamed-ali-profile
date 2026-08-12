import { appendToGoogleSheet } from "./googleSheetsAutoSync";

async function runTest() {
  console.log("[Test] Sending test submission to Google Apps Script Webhook...");
  const result = await appendToGoogleSheet({
    fullName: "Test Candidate (Live Webhook Check)",
    phoneNumber: "+201000000000",
    email: "test.candidate@domain.com",
    field: "Business Development",
    yearsOfExperience: "5+ years",
    availability: "Immediately",
    trainingSectorExperience: "Yes",
    cvUrl: "/manus-storage/career-cvs/sample_test_cv.pdf",
    cvFileName: "sample_test_cv.pdf",
    message: "Verifying live webhook integration with Google Sheet.",
    status: "New"
  });
  console.log("[Test] Result:", result);
}

runTest().catch(console.error);
