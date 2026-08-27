export const CAREER_ROUTE_D = "M80 205 C170 60 245 60 350 105 S500 290 625 190 S800 55 930 120";

export const CAREER_ROUTE_VIEWBOX = { width: 1000, height: 330 } as const;

/** The four milestone anchors are points from the SVG path itself, not CSS percentages. */
export const CAREER_ROUTE_ANCHORS = [
  { x: 80, y: 205 },
  { x: 350, y: 105 },
  { x: 625, y: 190 },
  { x: 930, y: 120 },
] as const;

type PathPoint = { x: number; y: number };

export type CareerRoutePath = {
  getTotalLength: () => number;
  getPointAtLength: (length: number) => PathPoint;
};

export type CareerRoutePoint = PathPoint & {
  angle: number;
  progress: number;
  left: string;
  top: string;
};

export type CareerRouteGeometry = {
  totalLength: number;
  stationProgress: number[];
  stations: CareerRoutePoint[];
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const distanceSquared = (first: PathPoint, second: PathPoint) => {
  const dx = first.x - second.x;
  const dy = first.y - second.y;
  return dx * dx + dy * dy;
};

/** Find the path position closest to an anchor using the browser's SVG geometry API. */
export const findClosestPathProgress = (path: CareerRoutePath, anchor: PathPoint) => {
  const totalLength = path.getTotalLength();
  if (!Number.isFinite(totalLength) || totalLength <= 0) return 0;

  const coarseSteps = 800;
  let bestLength = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let step = 0; step <= coarseSteps; step += 1) {
    const length = (totalLength * step) / coarseSteps;
    const distance = distanceSquared(path.getPointAtLength(length), anchor);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestLength = length;
    }
  }

  const window = (totalLength / coarseSteps) * 2;
  let left = clamp(bestLength - window, 0, totalLength);
  let right = clamp(bestLength + window, 0, totalLength);

  // Refine the coarse match locally so the handoff remains stable on every viewport.
  for (let iteration = 0; iteration < 6; iteration += 1) {
    const step = (right - left) / 10;
    let localBest = left;
    let localDistance = Number.POSITIVE_INFINITY;
    for (let index = 0; index <= 10; index += 1) {
      const length = left + step * index;
      const distance = distanceSquared(path.getPointAtLength(length), anchor);
      if (distance < localDistance) {
        localDistance = distance;
        localBest = length;
      }
    }
    const refinedWindow = Math.max(step * 1.5, totalLength / 1_000_000);
    left = clamp(localBest - refinedWindow, 0, totalLength);
    right = clamp(localBest + refinedWindow, 0, totalLength);
    bestLength = localBest;
  }

  return clamp(bestLength / totalLength, 0, 1);
};

export const getCareerRoutePoint = (path: CareerRoutePath, progress: number): CareerRoutePoint => {
  const totalLength = path.getTotalLength();
  const safeProgress = clamp(progress, 0, 1);
  const length = totalLength * safeProgress;
  const point = path.getPointAtLength(length);
  const tangentWindow = Math.max(totalLength * 0.0015, 0.5);
  const before = path.getPointAtLength(clamp(length - tangentWindow, 0, totalLength));
  const after = path.getPointAtLength(clamp(length + tangentWindow, 0, totalLength));
  const angle = Math.atan2(after.y - before.y, after.x - before.x) * (180 / Math.PI);

  return {
    ...point,
    angle,
    progress: safeProgress,
    left: `${(point.x / CAREER_ROUTE_VIEWBOX.width) * 100}%`,
    top: `${(point.y / CAREER_ROUTE_VIEWBOX.height) * 100}%`,
  };
};

export const getCareerRouteGeometry = (path: CareerRoutePath): CareerRouteGeometry => {
  const totalLength = path.getTotalLength();
  if (!Number.isFinite(totalLength) || totalLength <= 0) {
    return { totalLength: 0, stationProgress: [0, 0, 0, 0], stations: [] };
  }

  const stationProgress = CAREER_ROUTE_ANCHORS.map((anchor, index) => {
    if (index === 0) return 0;
    if (index === CAREER_ROUTE_ANCHORS.length - 1) return 1;
    return findClosestPathProgress(path, anchor);
  });

  return {
    totalLength,
    stationProgress,
    stations: stationProgress.map((progress) => getCareerRoutePoint(path, progress)),
  };
};
