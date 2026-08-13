import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const careerSubmissions = mysqlTable("career_submissions", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 64 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  field: varchar("field", { length: 128 }).notNull(),
  yearsOfExperience: varchar("yearsOfExperience", { length: 64 }).notNull(),
  availability: varchar("availability", { length: 64 }).notNull(),
  trainingSectorExperience: int("trainingSectorExperience").default(0).notNull(),
  cvUrl: text("cvUrl").notNull(),
  cvFileName: varchar("cvFileName", { length: 255 }),
  message: text("message"),
  status: mysqlEnum("status", ["New", "Reviewed", "Shortlisted", "Contacted", "Archived"]).default("New").notNull(),
  lastContactedAt: timestamp("lastContactedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CareerSubmission = typeof careerSubmissions.$inferSelect;
export type InsertCareerSubmission = typeof careerSubmissions.$inferInsert;

export const broadcastHistory = mysqlTable("broadcast_history", {
  id: int("id").autoincrement().primaryKey(),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  jobDetails: text("jobDetails").notNull(),
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactLinkedin: varchar("contactLinkedin", { length: 512 }),
  otherInstructions: text("otherInstructions"),
  recipientCount: int("recipientCount").notNull(),
  successCount: int("successCount").notNull(),
  failureCount: int("failureCount").notNull(),
  audienceType: mysqlEnum("audienceType", ["all", "field", "test"]).default("all").notNull(),
  audienceField: varchar("audienceField", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BroadcastHistory = typeof broadcastHistory.$inferSelect;
export type InsertBroadcastHistory = typeof broadcastHistory.$inferInsert;
