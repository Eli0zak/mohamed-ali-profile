import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { broadcastHistory, careerSubmissions } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { storagePut } from "./storage";
import { isCareerAdmin } from "./careerAdmin";
import { appendToGoogleSheet } from "./googleSheetsAutoSync";
import { sendBroadcastOpportunity } from "./careerBroadcast";

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
    uploadCv: publicProcedure
      .input(
        z.object({
          fileName: z.string().min(1),
          contentType: z.string().min(1),
          data: z.string().min(1),
        }),
      )
      .mutation(async ({ input }) => {
        const extension = input.fileName.toLowerCase().match(/\.(pdf|docx?|)$/)?.[1];
        if (!extension) {
          throw new Error("Only PDF, DOC, and DOCX files are supported");
        }

        const buffer = Buffer.from(input.data, "base64");
        if (buffer.byteLength > 10 * 1024 * 1024) {
          throw new Error("CV file must be 10MB or smaller");
        }

        const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const uploaded = await storagePut(`career-cvs/${Date.now()}-${safeFileName}`, buffer, input.contentType);
        return { ...uploaded, fileName: input.fileName };
      }),

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

        // Sync to Google Sheets and local sheet CSV sink
        await appendToGoogleSheet({
          fullName: input.fullName,
          phoneNumber: input.phoneNumber,
          email: input.email,
          field: input.field,
          yearsOfExperience: input.yearsOfExperience,
          availability: input.availability,
          trainingSectorExperience: input.trainingSectorExperience,
          cvUrl: input.cvUrl,
          cvFileName: input.cvFileName,
          message: input.message,
          status: "New"
        });

        return { success: true };
      }),

    listSubmissions: protectedProcedure.query(async ({ ctx }) => {
      if (!isCareerAdmin(ctx.user)) {
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
        if (!isCareerAdmin(ctx.user)) {
          throw new Error("Unauthorized access");
        }
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.update(careerSubmissions).set({ status: input.status }).where(eq(careerSubmissions.id, input.id));
        return { success: true };
      }),

    listBroadcastHistory: protectedProcedure.query(async ({ ctx }) => {
      if (!isCareerAdmin(ctx.user)) {
        throw new Error("Unauthorized access");
      }
      const db = await getDb();
      if (!db) return [];
      return db.select().from(broadcastHistory).orderBy(desc(broadcastHistory.createdAt));
    }),

    broadcastOpportunity: protectedProcedure
      .input(
        z.object({
          jobTitle: z.string().trim().min(3).max(255),
          jobDetails: z.string().trim().min(10).max(20_000),
          contactName: z.string().trim().max(255).optional(),
          contactEmail: z.union([z.string().email(), z.literal("")]).optional(),
          contactLinkedin: z.union([
            z.string().trim().url().refine((value) => value.startsWith("http://") || value.startsWith("https://"), "LinkedIn URL must use http or https"),
            z.literal(""),
          ]).optional(),
          otherInstructions: z.string().trim().max(20_000).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        if (!isCareerAdmin(ctx.user)) {
          throw new Error("Unauthorized access");
        }
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        const submissions = await db.select().from(careerSubmissions);
        const result = await sendBroadcastOpportunity(input, submissions);
        const [history] = await db.insert(broadcastHistory).values({
          jobTitle: input.jobTitle,
          jobDetails: input.jobDetails,
          contactName: input.contactName || null,
          contactEmail: input.contactEmail || null,
          contactLinkedin: input.contactLinkedin || null,
          otherInstructions: input.otherInstructions || null,
          recipientCount: result.recipientCount,
          successCount: result.successCount,
          failureCount: result.failureCount,
        }).$returningId();

        return {
          success: result.recipientCount > 0 && result.failureCount === 0,
          ...result,
          historyId: history?.id ?? null,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
