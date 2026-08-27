import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("portfolio conversion surfaces", () => {
  const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

  it("keeps the recruiter and client choice accessible in the hero", () => {
    expect(homeSource).toContain('className="visitor-path"');
    expect(homeSource).toContain("Recruiter · Sales leadership");
    expect(homeSource).toContain("Client · Training & consulting");
  });

  it("keeps GDG speaking profile actions connected to real contact paths", () => {
    expect(homeSource).toContain('className="speaking-profile"');
    expect(homeSource).toContain("Invite to speak");
    expect(homeSource).toContain("linkedinUrl");
  });

  it("keeps the smart contact menu available with direct channels", () => {
    expect(homeSource).toContain('className={`smart-contact');
    expect(homeSource).toContain("mailto:mohamed280ali90@gmail.com");
    expect(homeSource).toContain("https://wa.me/201030537773");
  });

  it("removes the inactive case study path while keeping the value snapshot action", () => {
    expect(homeSource).not.toContain('href="#case-study"');
    expect(homeSource).not.toContain('id="case-study"');
    expect(homeSource).toContain('value-snapshot value-snapshot--${visitorMode} container');
    expect(homeSource).toContain('href={visitorMode === "recruiter" ? "#companies" : "#training"}');
  });

  it("keeps every smart contact option actionable", () => {
    expect(homeSource).toContain('href="mailto:mohamed280ali90@gmail.com"');
    expect(homeSource).toContain('href={linkedinUrl}');
    expect(homeSource).toContain('href="https://wa.me/201030537773"');
    expect(homeSource).toContain("href={speakingInviteHref}");
    expect(homeSource).toContain("SPEAKING_INVITE_EMAIL");
  });
});
