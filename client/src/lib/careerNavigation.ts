export type CareerNavigationKey = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "Home" | "End";

/** Return the next station without wrapping, so keyboard focus never jumps unexpectedly. */
export const getNextCareerStationIndex = (
  currentIndex: number,
  stationCount: number,
  key: string,
): number | null => {
  if (stationCount <= 0) return null;
  const current = Math.min(Math.max(Math.trunc(currentIndex), 0), stationCount - 1);

  if (key === "Home") return 0;
  if (key === "End") return stationCount - 1;
  if (key === "ArrowRight" || key === "ArrowDown") return Math.min(current + 1, stationCount - 1);
  if (key === "ArrowLeft" || key === "ArrowUp") return Math.max(current - 1, 0);
  return null;
};

export const getCareerProgressPercent = (progress: number) => {
  if (!Number.isFinite(progress)) return 0;
  return Math.round(Math.min(Math.max(progress, 0), 1) * 100);
};
