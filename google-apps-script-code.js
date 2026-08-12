/**
 * Google Apps Script Webhook Receiver for Career Gateway
 * Paste this script into your Google Sheet (Extensions -> Apps Script)
 * then deploy as Web App (Execute as: Me, Who has access: Anyone).
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Append row: Date, Full Name, Phone, Email, Field, Experience, Availability, Training Exp, CV Link, Notes, Status
    sheet.appendRow([
      data.date || new Date().toISOString(),
      data.fullName || "",
      data.phoneNumber || "",
      data.email || "",
      data.field || "",
      data.yearsOfExperience || "",
      data.availability || "",
      data.trainingSectorExperience || "No",
      data.cvUrl || "",
      data.message || "",
      data.status || "New"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Career Gateway Webhook Receiver is Active.");
}
