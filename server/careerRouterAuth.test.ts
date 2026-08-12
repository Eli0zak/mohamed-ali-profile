import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("career router authorization integration", () => {
  it("rejects listSubmissions for regular non-owner users", async () => {
    const ctx: TrpcContext = {
      user: {
        id: 2,
        openId: "regular-user-id",
        email: "user@example.com",
        name: "Regular User",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    await expect(caller.career.listSubmissions()).rejects.toThrow("Unauthorized access");
  });
});
