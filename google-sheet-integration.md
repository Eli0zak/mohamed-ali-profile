# Google Sheets Primary Data Source & Secure Admin Roster

## Overview
As requested in the update specifications:
1. **Secure Admin Roster:** The `/admin/career-roster` page is now fully protected by a secure password screen requiring Mohamed Ali's dedicated admin passcode. Public candidates or visitors cannot access or view candidate submissions.
2. **Google Sheets Primary Data Source:** Every CV submission through `/career-gateway` automatically writes in real-time to the secure Google Sheets synchronization pipeline (shared with `mohamed280ali90@gmail.com` with full editing rights).
3. **Columns Tracked in Sheet:**
   - Submission Timestamp
   - Full Name
   - Phone Number
   - Email
   - Specialization / Field
   - Years of Experience
   - Availability
   - Training Sector Experience (Yes/No)
   - CV Document Link (S3 Secure URL)
   - Candidate Message / Notes
   - Status (Default: "New", with Reviewed, Shortlisted, Contacted, Archived)
