import { describe, expect, it } from "vitest";
import { getCareerProgressPercent, getNextCareerStationIndex } from "./careerNavigation";

describe("career route keyboard navigation", () => {
  it("moves one station at a time without wrapping at the route edges", () => {
    expect(getNextCareerStationIndex(0, 4, "ArrowLeft")).toBe(0);
    expect(getNextCareerStationIndex(0, 4, "ArrowRight")).toBe(1);
    expect(getNextCareerStationIndex(2, 4, "ArrowUp")).toBe(1);
    expect(getNextCareerStationIndex(3, 4, "ArrowDown")).toBe(3);
  });

  it("supports Home and End as direct waypoint shortcuts", () => {
    expect(getNextCareerStationIndex(2, 4, "Home")).toBe(0);
    expect(getNextCareerStationIndex(0, 4, "End")).toBe(3);
    expect(getNextCareerStationIndex(1, 4, "Tab")).toBeNull();
  });

  it("clamps route progress to a whole percentage for the HUD", () => {
    expect(getCareerProgressPercent(-0.2)).toBe(0);
    expect(getCareerProgressPercent(0.375)).toBe(38);
    expect(getCareerProgressPercent(1.4)).toBe(100);
    expect(getCareerProgressPercent(Number.NaN)).toBe(0);
  });
});
