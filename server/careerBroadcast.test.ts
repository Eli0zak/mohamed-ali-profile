import { describe, expect, it } from "vitest";
import { buildOpportunityEmail, sendBroadcastOpportunity } from "./careerBroadcast";

const submission = (email: string) => ({ email }) as any;

describe("career opportunity broadcast", () => {
  it("escapes user content and preserves multiline details in the email template", () => {
    const email = buildOpportunityEmail({
      jobTitle: "BD <Manager>",
      jobDetails: "Own the pipeline\nLead the team",
      contactName: "<Hiring Contact>",
      contactEmail: "contact@example.com",
      contactLinkedin: "https://www.linkedin.com/in/contact",
      otherInstructions: "Apply <here>",
    });

    expect(email.subject).toBe("Job opportunity: BD <Manager>");
    expect(email.html).toContain("BD &lt;Manager&gt;");
    expect(email.html).toContain("Own the pipeline<br />Lead the team");
    expect(email.html).toContain("&lt;Hiring Contact&gt;");
    expect(email.html).not.toContain("<Hiring Contact>");
    expect(email.html).toContain("https://www.linkedin.com/in/contact");
  });

  it("returns zero recipients without requiring SMTP when no valid candidate emails exist", async () => {
    const result = await sendBroadcastOpportunity(
      { jobTitle: "Sales role", jobDetails: "Details for the role" },
      [submission("not-an-email"), submission(""), submission(" ")],
    );

    expect(result).toEqual({ recipientCount: 0, successCount: 0, failureCount: 0 });
  });
});
