import { describe, expect, it } from "vitest";
import {
  CAREER_ROUTE_ANCHORS,
  findClosestPathProgress,
  getCareerRouteGeometry,
  getCareerRoutePoint,
  type CareerRoutePath,
} from "./careerRoute";

const lineThroughRouteAnchors = (): CareerRoutePath => ({
  getTotalLength: () => 1200,
  getPointAtLength: (length) => {
    const segment = Math.min(Math.floor(length / 300), CAREER_ROUTE_ANCHORS.length - 2);
    const localProgress = (length - segment * 300) / 300;
    const start = CAREER_ROUTE_ANCHORS[segment];
    const end = CAREER_ROUTE_ANCHORS[segment + 1];
    return {
      x: start.x + (end.x - start.x) * localProgress,
      y: start.y + (end.y - start.y) * localProgress,
    };
  },
});

describe("career route geometry", () => {
  it("finds the closest point on the SVG path instead of relying on CSS percentages", () => {
    const path: CareerRoutePath = {
      getTotalLength: () => 100,
      getPointAtLength: (length) => ({ x: length, y: 0 }),
    };

    expect(findClosestPathProgress(path, { x: 72, y: 0 })).toBeCloseTo(0.72, 2);
  });

  it("returns viewport percentages and tangent angle from a measured path point", () => {
    const path: CareerRoutePath = {
      getTotalLength: () => 100,
      getPointAtLength: (length) => ({ x: length, y: length }),
    };
    const point = getCareerRoutePoint(path, 0.5);

    expect(point.left).toBe("5%");
    expect(point.top).toBe(`${(50 / 330) * 100}%`);
    expect(point.angle).toBeCloseTo(45, 1);
  });

  it("maps each station to the matching point on the shared route geometry", () => {
    const geometry = getCareerRouteGeometry(lineThroughRouteAnchors());

    expect(geometry.stationProgress[0]).toBe(0);
    expect(geometry.stationProgress[1]).toBeCloseTo(1 / 4, 5);
    expect(geometry.stationProgress[2]).toBeCloseTo(2 / 4, 5);
    expect(geometry.stationProgress[3]).toBeCloseTo(3 / 4, 5);
    expect(geometry.stationProgress[4]).toBe(1);
    geometry.stations.forEach((station, index) => {
      expect(station.x).toBeCloseTo(CAREER_ROUTE_ANCHORS[index].x, 3);
      expect(station.y).toBeCloseTo(CAREER_ROUTE_ANCHORS[index].y, 3);
    });
  });
});
