# Visible Claims Audit

Date: 2026-08-27

## Confirmed counts

| Visible claim | Source in code | Verification status |
|---|---|---|
| 13 professional partners / companies | `Home.tsx`: `partnerCount = useCountUp(13, 1100)`; aligned with the 13-company portfolio orbit requested by the owner | Confirmed against the configured portfolio dataset and supplied professional materials |
| 750+ trained | `Home.tsx`: `trainedCount = useCountUp(750)` and the Training section renders the value with a `+` suffix | Confirmed as a portfolio claim supplied by the owner; displayed as `750+`, not as an exact count |
| EGP 150K → 450K/month at JCC | `companies` JCC chart and achievements; Case Study repeats the same values | Confirmed against the professional profile data already supplied for the JCC role; the page labels the figures as role-data based |
| EGP 2M → 5M/month at Russian Cultural Center | `companies` Russian Cultural Center achievements and chart | Confirmed against the professional profile data already supplied; shown as an achievement claim, not a universal company claim |
| 75 hours / Excellent grade | `proofCategories` Certifications item for Machinfy | Confirmed from the supplied certificate image metadata represented in the existing content |
| MEC certificate date: May 17, 2024 | `companies` MEC Academy achievement | Confirmed from the supplied certificate information |

## Language and scope controls

The page uses neutral wording for supplied evidence where the material does not specify an exact role or date, especially in Partnerships & Engagements. GDG is described as a featured speaking engagement based on the supplied event photos and is not presented as employment. The Case Study includes a source note: figures are based on role data provided in the professional profile.

## Speaking Profile content

GDG New Cairo includes three visible speaking topics: Sales mindset, Business Development, and Team performance, plus Invite to speak and LinkedIn CTAs. The topics are rendered in both Arabic/English-compatible UI context and are part of the event detail panel.

## Claims intentionally not added

No customer reviews, ratings, testimonials, client quotes, or fabricated outcomes were added. No unsupported conversion percentage, team-size claim, exact participant count, or external endorsement was introduced in this iteration.

## Follow-up recommendation

A future Value Snapshot can consolidate the confirmed role types, commercial problems solved, and evidence links above the fold. It should reuse the same verified claims rather than introduce new metrics.
