export type CareerStatus = "New" | "Reviewed" | "Shortlisted" | "Contacted" | "Archived";

export type CareerSubmissionForStats = {
  status: CareerStatus | string;
  cvUrl?: string | null;
  createdAt: Date | string | number;
};

export type DailySubmissionPoint = {
  key: string;
  label: string;
  count: number;
};

export type CareerStats = {
  total: number;
  newSubmissions: number;
  thisWeek: number;
  cvsUploaded: number;
  dailySubmissions: DailySubmissionPoint[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDate(value: Date | string | number) {
  const parsed = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidCvUrl(cvUrl?: string | null) {
  if (!cvUrl?.trim()) return false;
  try {
    const parsed = new URL(cvUrl, "https://portfolio.local");
    return Boolean(parsed.pathname && parsed.pathname !== "/");
  } catch {
    return false;
  }
}

export function buildCareerStats(
  submissions: CareerSubmissionForStats[],
  now = new Date(),
  locale = "en-US",
): CareerStats {
  const today = startOfLocalDay(now);
  const firstDay = new Date(today.getTime() - 6 * DAY_MS);
  const dailyMap = new Map<string, number>();
  const dailySubmissions = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(firstDay.getTime() + index * DAY_MS);
    const key = dateKey(date);
    dailyMap.set(key, 0);
    return {
      key,
      label: date.toLocaleDateString(locale, { weekday: "short" }),
      count: 0,
    };
  });

  let thisWeek = 0;
  for (const submission of submissions) {
    const createdAt = toDate(submission.createdAt);
    if (!createdAt) continue;
    const createdDay = startOfLocalDay(createdAt);
    const key = dateKey(createdDay);
    if (createdDay >= firstDay && createdDay <= today) {
      thisWeek += 1;
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
    }
  }

  return {
    total: submissions.length,
    newSubmissions: submissions.filter((submission) => submission.status === "New").length,
    thisWeek,
    cvsUploaded: submissions.filter((submission) => isValidCvUrl(submission.cvUrl)).length,
    dailySubmissions: dailySubmissions.map((point) => ({
      ...point,
      count: dailyMap.get(point.key) ?? 0,
    })),
  };
}

export function isValidCareerCvUrl(cvUrl?: string | null) {
  return isValidCvUrl(cvUrl);
}

export function isCareerSubmissionWithinLast7Days(
  createdAt: Date | string | number,
  now = new Date(),
) {
  const createdDate = toDate(createdAt);
  if (!createdDate) return false;
  const today = startOfLocalDay(now);
  const firstDay = new Date(today.getTime() - 6 * DAY_MS);
  const createdDay = startOfLocalDay(createdDate);
  return createdDay >= firstDay && createdDay <= today;
}

export type CareerStatsFilter = "all" | "new" | "week" | "cv";

export function filterCareerSubmissions<T extends CareerSubmissionForStats>(
  submissions: T[],
  filter: CareerStatsFilter,
  now = new Date(),
) {
  return submissions.filter((submission) => {
    if (filter === "all") return true;
    if (filter === "new") return submission.status === "New";
    if (filter === "week") return isCareerSubmissionWithinLast7Days(submission.createdAt, now);
    return isValidCareerCvUrl(submission.cvUrl);
  });
}

export function getCareerFilterForCard(card: "total" | "new" | "week" | "cv") {
  if (card === "new") return "New" as const;
  return "All" as const;
}
