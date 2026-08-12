# Validation Notes

- Career Gateway test submission was saved as record 1 for Mohamed Ali.
- Admin authorization initially failed because the logged-in account had role `user` while `OWNER_OPEN_ID` differed from the account openId.
- The account `mohamed280ali90@gmail.com` was promoted to `admin` in the database.
- A permanent `isCareerAdmin` helper now allows explicit admins and the configured `OWNER_OPEN_ID`, and is used by `career.listSubmissions` and `career.updateStatus`.
- Admin roster verification now displays the saved record with Business Development, 5+ years, Immediately, New, and `Mohamed_Ali_CV.pdf`.
- Landing page and Career Gateway were visually checked in Arabic and English; RTL layout rendered correctly on Arabic views.
- Vitest and TypeScript checks passed after the authorization change.
