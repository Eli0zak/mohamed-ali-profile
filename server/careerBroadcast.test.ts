import { describe, expect, it } from "vitest";
import { buildOpportunityEmail, buildQuickReplyEmail, filterBroadcastSubmissions, getQuickReplyMessage, sendBroadcastOpportunity } from "./careerBroadcast";

const submission = (email: string, field = "Sales") => ({ email, field }) as any;

describe("career opportunity broadcast", () => {
  it("renders a branded Gmail-compatible template with a separated How to Apply section", () => {
    const email = buildOpportunityEmail({
      jobTitle: "BD <Manager>",
      jobDetails: "Own the pipeline\n- Lead the team\n• Report weekly",
      contactName: "<Hiring Contact>",
      contactEmail: "contact@example.com",
      contactLinkedin: "https://www.linkedin.com/in/contact",
      otherInstructions: "Apply <here>",
    });

    expect(email.subject).toBe("Job opportunity: BD <Manager>");
    expect(email.html).toContain("Mohamed Ali — Career Gateway");
    expect(email.html).toContain("#070B14");
    expect(email.html).toContain("#F59E0B");
    expect(email.html).toContain("How to Apply");
    expect(email.html).toContain("Contact Name");
    expect(email.html).toContain("Contact Email");
    expect(email.html).toContain("LinkedIn URL");
    expect(email.html).toContain("Additional Instructions");
    expect(email.html).toContain("Lead the team");
    expect(email.html).toContain("This opportunity was shared through Mohamed Ali's professional network.");
    expect(email.html).toContain("mailto:contact@example.com");
    expect(email.html).toContain("https://www.linkedin.com/in/contact");
    expect(email.html).not.toContain("<Hiring Contact>");
    expect(email.html).not.toContain("<here>");
  });

  it("renders each Quick Reply template with the branded header and escaped candidate data", () => {
    const email = buildQuickReplyEmail({
      candidateName: "<Candidate>",
      candidateEmail: "candidate@example.com",
      template: "schedule",
    });

    expect(email.subject).toContain("Schedule a call");
    expect(email.html).toContain("Mohamed Ali — Career Gateway");
    expect(email.html).toContain("#070B14");
    expect(email.html).toContain("#F59E0B");
    expect(email.html).toContain("Schedule a call");
    expect(email.html).not.toContain("<Candidate>");
    expect(email.text).toContain("Dear <Candidate>");
  });

  it("requires and renders a custom Quick Reply message", () => {
    expect(getQuickReplyMessage("custom", "  Please send your availability.  ")).toBe("Please send your availability.");
    expect(getQuickReplyMessage("custom")).toBe("");
    const email = buildQuickReplyEmail({
      candidateName: "Mona",
      candidateEmail: "mona@example.com",
      template: "custom",
      customMessage: "Line one\nLine two",
    });
    expect(email.html).toContain("Line one<br />Line two");
    expect(email.text).toContain("Line one\nLine two");
  });

  it("includes every How to Apply label even when optional values are omitted", () => {
    const email = buildOpportunityEmail({ jobTitle: "Sales role", jobDetails: "Details for the role" });
    expect(email.html).toContain("Contact Name");
    expect(email.html).toContain("Contact Email");
    expect(email.html).toContain("LinkedIn URL");
    expect(email.html).toContain("Additional Instructions");
    expect(email.html).toContain("Not provided");
  });

  it("filters candidates by field case-insensitively", () => {
    const candidates = [submission("sales@example.com", "Sales"), submission("bd@example.com", "Business Development"), submission("sales-two@example.com", "sales")];
    expect(filterBroadcastSubmissions(candidates, { type: "all" })).toHaveLength(3);
    expect(filterBroadcastSubmissions(candidates, { type: "field", field: "SALES" }).map((candidate) => candidate.email)).toEqual([
      "sales@example.com",
      "sales-two@example.com",
    ]);
  });

  it("returns zero recipients without requiring SMTP when no valid candidate emails exist", async () => {
    const result = await sendBroadcastOpportunity(
      { jobTitle: "Sales role", jobDetails: "Details for the role" },
      [submission("not-an-email"), submission("", "Marketing"), submission(" ", "Sales")],
    );

    expect(result).toEqual({ recipientCount: 0, successCount: 0, failureCount: 0 });
  });

  it("returns zero recipients when a selected field has no valid candidates", async () => {
    const result = await sendBroadcastOpportunity(
      { jobTitle: "Sales role", jobDetails: "Details for the role" },
      [submission("marketing@example.com", "Marketing")],
      { audience: { type: "field", field: "Sales" } },
    );

    expect(result).toEqual({ recipientCount: 0, successCount: 0, failureCount: 0 });
  });

  it("supports the owner-only test audience without using candidate submissions", async () => {
    const result = await sendBroadcastOpportunity(
      { jobTitle: "Owner test", jobDetails: "A safe owner-only email test" },
      [submission("candidate@example.com")],
      { audience: { type: "test" }, testRecipient: "not-an-email" },
    );

    expect(result).toEqual({ recipientCount: 0, successCount: 0, failureCount: 0 });
  });
});

  it("filters submissions correctly and tracks audience metadata", () => {
    const list = [
      submission("a@example.com", "Sales"),
      submission("b@example.com", "Marketing"),
      submission("c@example.com", "sales"),
    ];
    const filtered = filterBroadcastSubmissions(list, { type: "field", field: "sales" });
    expect(filtered).toHaveLength(2);
    expect(filtered.map(s => s.email)).toEqual(["a@example.com", "c@example.com"]);
  });
