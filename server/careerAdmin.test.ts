import { describe, expect, it } from "vitest";
import { isCareerAdmin } from "./careerAdmin";

describe("career roster authorization", () => {
  it("allows an explicit admin role", () => {
    expect(isCareerAdmin({ role: "admin", openId: "admin-user" }, "owner-user")).toBe(true);
  });

  it("allows the configured owner even when the stored role is user", () => {
    expect(isCareerAdmin({ role: "user", openId: "owner-user" }, "owner-user")).toBe(true);
  });

  it("rejects a non-owner regular user", () => {
    expect(isCareerAdmin({ role: "user", openId: "regular-user" }, "owner-user")).toBe(false);
  });

  it("rejects an unauthenticated request", () => {
    expect(isCareerAdmin(null, "owner-user")).toBe(false);
  });
});
