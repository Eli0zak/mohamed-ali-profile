import { describe, expect, it } from "vitest";
import {
  buildCareerStats,
  filterCareerSubmissions,
  isCareerSubmissionWithinLast7Days,
  isValidCareerCvUrl,
} from "./careerStats";

const now = new Date(2026, 7, 13, 12, 0, 0);

const submission = (overrides: Record<string, unknown> = {}) => ({
  status: "New",
  cvUrl: "https://files.example.com/candidate.pdf",
  createdAt: new Date(2026, 7, 13, 10, 0, 0),
  ...overrides,
});

describe("career roster stats", () => {
  it("calculates all four summary counts from live submission rows", () => {
    const stats = buildCareerStats(
      [
        submission(),
        submission({ status: "Reviewed", createdAt: new Date(2026, 7, 10, 9, 0, 0) }),
        submission({ status: "Archived", cvUrl: null, createdAt: new Date(2026, 7, 7, 9, 0, 0) }),
        submission({ status: "New", cvUrl: "", createdAt: new Date(2026, 7, 6, 9, 0, 0) }),
      ],
      now,
    );

    expect(stats.total).toBe(4);
    expect(stats.newSubmissions).toBe(2);
    expect(stats.thisWeek).toBe(3);
    expect(stats.cvsUploaded).toBe(2);
  });

  it("creates seven ordered chart points and counts only rows in the seven-day window", () => {
    const stats = buildCareerStats(
      [
        submission({ createdAt: new Date(2026, 7, 13, 8, 0, 0) }),
        submission({ createdAt: new Date(2026, 7, 10, 8, 0, 0) }),
        submission({ createdAt: new Date(2026, 7, 7, 8, 0, 0) }),
        submission({ createdAt: new Date(2026, 7, 6, 23, 59, 0) }),
      ],
      now,
    );

    expect(stats.dailySubmissions).toHaveLength(7);
    expect(stats.dailySubmissions.map((point) => point.key)).toEqual([
      "2026-08-07",
      "2026-08-08",
      "2026-08-09",
      "2026-08-10",
      "2026-08-11",
      "2026-08-12",
      "2026-08-13",
    ]);
    expect(stats.dailySubmissions.map((point) => point.count)).toEqual([1, 0, 0, 1, 0, 0, 1]);
  });

  it("filters the table using the same rules as each summary card", () => {
    const rows = [
      submission({ id: 1, status: "New", createdAt: new Date(2026, 7, 13, 8, 0, 0) }),
      submission({ id: 2, status: "Reviewed", createdAt: new Date(2026, 7, 10, 8, 0, 0) }),
      submission({ id: 3, status: "Archived", cvUrl: null, createdAt: new Date(2026, 7, 6, 8, 0, 0) }),
    ];

    expect(filterCareerSubmissions(rows, "all", now).map((row) => row.id)).toEqual([1, 2, 3]);
    expect(filterCareerSubmissions(rows, "new", now).map((row) => row.id)).toEqual([1]);
    expect(filterCareerSubmissions(rows, "week", now).map((row) => row.id)).toEqual([1, 2]);
    expect(filterCareerSubmissions(rows, "cv", now).map((row) => row.id)).toEqual([1, 2]);
  });

  it("uses the same inclusive calendar-day boundary for the filter", () => {
    expect(isCareerSubmissionWithinLast7Days(new Date(2026, 7, 7, 0, 1), now)).toBe(true);
    expect(isCareerSubmissionWithinLast7Days(new Date(2026, 7, 6, 23, 59), now)).toBe(false);
    expect(isCareerSubmissionWithinLast7Days("not-a-date", now)).toBe(false);
  });

  it("accepts only non-empty file paths or URLs as CV attachments", () => {
    expect(isValidCareerCvUrl("https://files.example.com/candidate.pdf")).toBe(true);
    expect(isValidCareerCvUrl("/manus-storage/candidate.pdf")).toBe(true);
    expect(isValidCareerCvUrl("")).toBe(false);
    expect(isValidCareerCvUrl(null)).toBe(false);
    expect(isValidCareerCvUrl("https://files.example.com/")).toBe(false);
  });
});
