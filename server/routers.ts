import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { careerSubmissions } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  career: router({
    submitCv: publicProcedure
      .input(
        z.object({
          fullName: z.string().min(2),
          phoneNumber: z.string().min(5),
          email: z.string().email(),
          field: z.string().min(2),
          yearsOfExperience: z.string(),
          availability: z.string(),
          trainingSectorExperience: z.number().default(0),
          cvUrl: z.string(),
          cvFileName: z.string().optional(),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) {
          throw new Error("Database connection unavailable");
        }
        await db.insert(careerSubmissions).values({
          fullName: input.fullName,
          phoneNumber: input.phoneNumber,
          email: input.email,
          field: input.field,
          yearsOfExperience: input.yearsOfExperience,
          availability: input.availability,
          trainingSectorExperience: input.trainingSectorExperience,
          cvUrl: input.cvUrl,
          cvFileName: input.cvFileName || "CV_Document",
          message: input.message || "",
          status: "New",
        });
        return { success: true };
      }),

    listSubmissions: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized access");
      }
      const db = await getDb();
      if (!db) return [];
      const rows = await db.select().from(careerSubmissions).orderBy(desc(careerSubmissions.createdAt));
      return rows;
    }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["New", "Reviewed", "Shortlisted", "Contacted", "Archived"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized access");
        }
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.update(careerSubmissions).set({ status: input.status }).where(eq(careerSubmissions.id, input.id));
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
