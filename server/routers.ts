import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { careerHistory, careerSubmissions } from "../drizzle/schema";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { storagePut } from "./storage";
import { appendToGoogleSheet } from "./googleSheetsAutoSync";

/** Public-profile API surface. Recruiting procedures live in mohamed-ali-careers. */
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  career: router({
    listHistory: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db.select().from(careerHistory).where(eq(careerHistory.published, 1)).orderBy(asc(careerHistory.sortOrder));
      return rows.map((row) => ({ ...row, highlights: JSON.parse(row.highlights || "[]"), highlightsAr: JSON.parse(row.highlightsAr || "[]") }));
    }),
    uploadCv: publicProcedure
      .input(z.object({ fileName: z.string().min(1), contentType: z.string().min(1), data: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const extension = input.fileName.toLowerCase().match(/\.(pdf|docx?)$/)?.[1];
        if (!extension) throw new Error("Only PDF, DOC, and DOCX files are supported");
        const buffer = Buffer.from(input.data, "base64");
        if (buffer.byteLength > 10 * 1024 * 1024) throw new Error("CV file must be 10MB or smaller");
        const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const uploaded = await storagePut(`career-cvs/${Date.now()}-${safeFileName}`, buffer, input.contentType);
        return { ...uploaded, fileName: input.fileName };
      }),
    submitCv: publicProcedure
      .input(z.object({
        fullName: z.string().min(2), phoneNumber: z.string().min(5), email: z.string().email(),
        field: z.string().min(2), yearsOfExperience: z.string(), availability: z.string(),
        trainingSectorExperience: z.number().default(0), cvUrl: z.string(), cvFileName: z.string().optional(), message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database connection unavailable");
        await db.insert(careerSubmissions).values({ ...input, cvFileName: input.cvFileName || "CV_Document", message: input.message || "", status: "New" });
        await appendToGoogleSheet({ ...input, status: "New" });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
