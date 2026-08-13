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
import { sendBroadcastOpportunity, sendQuickReplyEmail } from "./careerBroadcast";

const careerBroadcastInput = z.object({
  jobTitle: z.string().trim().min(3).max(255),
  jobDetails: z.string().trim().min(10).max(20_000),
  contactName: z.string().trim().max(255).optional(),
  contactEmail: z.union([z.string().email(), z.literal("")]).optional(),
  contactLinkedin: z.union([
    z.string().trim().url().refine((value) => value.startsWith("http://") || value.startsWith("https://"), "LinkedIn URL must use http or https"),
    z.literal(""),
  ]).optional(),
  otherInstructions: z.string().trim().max(20_000).optional(),
});

type CareerBroadcastInput = z.infer<typeof careerBroadcastInput>;

const CAREER_TEST_RECIPIENT = "mohamed280ali90@gmail.com";

const quickReplyInput = z.object({
  candidateId: z.number().int().positive(),
  template: z.enum(["thanks", "schedule", "not_fit", "custom"]),
  customMessage: z.string().trim().max(10_000).optional(),
}).superRefine((value, context) => {
  if (value.template === "custom" && !value.customMessage) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["customMessage"], message: "Custom message is required" });
  }
});

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

    sendQuickReply: protectedProcedure
      .input(quickReplyInput)
      .mutation(async ({ ctx, input }) => {
        if (!isCareerAdmin(ctx.user)) {
          throw new Error("Unauthorized access");
        }
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        const [candidate] = await db.select().from(careerSubmissions).where(eq(careerSubmissions.id, input.candidateId)).limit(1);
        if (!candidate) throw new Error("Candidate not found");

        const { sentAt } = await sendQuickReplyEmail({
          candidateName: candidate.fullName,
          candidateEmail: candidate.email,
          template: input.template,
          customMessage: input.customMessage,
        });
        await db.update(careerSubmissions)
          .set({ lastContactedAt: sentAt })
          .where(eq(careerSubmissions.id, candidate.id));

        return {
          success: true,
          candidateId: candidate.id,
          candidateName: candidate.fullName,
          sentAt,
          template: input.template,
        };
      }),

    sendManualQuickReply: protectedProcedure
      .input(
        z.object({
          recipientEmail: z.string().email(),
          recipientName: z.string().trim().min(1).default("Valued Recipient"),
          template: z.enum(["thanks", "schedule", "not_fit", "custom"]),
          customMessage: z.string().trim().max(10_000).optional(),
        }).superRefine((val, ctx) => {
          if (val.template === "custom" && !val.customMessage) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["customMessage"], message: "Custom message is required" });
          }
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!isCareerAdmin(ctx.user)) {
          throw new Error("Unauthorized access");
        }
        const { sentAt } = await sendQuickReplyEmail({
          candidateName: input.recipientName,
          candidateEmail: input.recipientEmail,
          template: input.template,
          customMessage: input.customMessage,
        });
        return {
          success: true,
          recipientEmail: input.recipientEmail,
          sentAt,
        };
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
      .input(careerBroadcastInput.extend({
        audienceType: z.enum(["all", "field"]).default("all"),
        audienceField: z.string().trim().max(128).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!isCareerAdmin(ctx.user)) {
          throw new Error("Unauthorized access");
        }
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        const submissions = await db.select().from(careerSubmissions);
        const audience = input.audienceType === "field"
          ? { type: "field" as const, field: input.audienceField?.trim() ?? "" }
          : { type: "all" as const };
        const result = await sendBroadcastOpportunity(input, submissions, { audience });
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
          audienceType: input.audienceType,
          audienceField: input.audienceType === "field" ? input.audienceField?.trim() || null : null,
        }).$returningId();

        return {
          success: result.recipientCount > 0 && result.failureCount === 0,
          ...result,
          historyId: history?.id ?? null,
          audienceType: input.audienceType,
          audienceField: input.audienceType === "field" ? input.audienceField?.trim() || null : null,
        };
      }),

    sendBroadcastTest: protectedProcedure
      .input(careerBroadcastInput)
      .mutation(async ({ ctx, input }) => {
        if (!isCareerAdmin(ctx.user)) {
          throw new Error("Unauthorized access");
        }
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        const result = await sendBroadcastOpportunity(input, [], {
          audience: { type: "test" },
          testRecipient: CAREER_TEST_RECIPIENT,
        });
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
          audienceType: "test",
          audienceField: CAREER_TEST_RECIPIENT,
        }).$returningId();

        return {
          success: result.recipientCount === 1 && result.successCount === 1 && result.failureCount === 0,
          ...result,
          historyId: history?.id ?? null,
          testRecipient: CAREER_TEST_RECIPIENT,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
