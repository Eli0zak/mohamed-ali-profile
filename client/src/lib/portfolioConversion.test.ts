import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("portfolio conversion surfaces", () => {
  const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
  const stylesSource = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

  it("keeps the recruiter and client choice accessible in the hero", () => {
    expect(homeSource).toContain('className="visitor-path"');
    expect(homeSource).toContain("Recruiter · Sales leadership");
    expect(homeSource).toContain("Client · Training & consulting");
  });

  it("keeps GDG evidence and the image lightbox without a duplicate speaking profile", () => {
    expect(homeSource).toContain('selectedProofCategory.id === "events"');
    expect(homeSource).toContain('className="proof-detail__content"');
    expect(homeSource).toContain('className="proof-lightbox"');
    expect(homeSource).not.toContain('className="speaking-profile"');
  });

  it("keeps the public speaking invite engine available through the contact surface", () => {
    expect(homeSource).toContain('getSpeakingInviteCopy({ audience: "sales-teams", kind: "talk", language })');
    expect(homeSource).toContain("speakingInviteHref");
    expect(homeSource).not.toContain("speakingAudienceOptions.map");
    expect(homeSource).not.toContain("speakingInviteOptions.map");
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

  it("does not render the removed speaking profile or duplicate invitation controls", () => {
    expect(homeSource).not.toContain("speakingBuilderOpen");
    expect(homeSource).not.toContain("Tailor the speaking invitation");
    expect(homeSource).not.toContain("speaking-profile__");
    expect(homeSource).not.toContain("copySpeakingInvite");
    expect(homeSource).not.toContain("getSpeakingInviteCopyText");
  });

  it("keeps every smart contact option actionable", () => {
    expect(homeSource).toContain('href="mailto:mohamed280ali90@gmail.com"');
    expect(homeSource).toContain('href={linkedinUrl}');
    expect(homeSource).toContain('href="https://wa.me/201030537773"');
    expect(homeSource).toContain("href={speakingInviteHref}");
    expect(homeSource).toContain("SPEAKING_INVITE_EMAIL");
  });

  it("adds a gentle event-image hover without sacrificing reduced-motion support", () => {
    expect(stylesSource).toContain(".proof-detail__image-button::after");
    expect(stylesSource).toContain(".proof-detail__image-button::before");
    expect(stylesSource).toContain(".proof-detail__image-button:hover img");
    expect(stylesSource).toContain("transform: scale(1.045)");
    expect(stylesSource).toContain("transition: opacity 180ms ease");
    expect(stylesSource).toContain("transition: none;");
  });

  it("keeps the MA Impact Core clear and interactive without changing the constellation structure", () => {
    expect(homeSource).toContain('className={`orbit-center ${orbitCoreOpen ? "orbit-center--open" : ""}`}');
    expect(homeSource).toContain('className="brand-mark__monogram"');
    expect(stylesSource).toContain(".brand-mark__monogram");
    expect(stylesSource).toContain(".brand-mark img {\n    display: none;");
    expect(homeSource).toContain("Commercial Growth Core");
    expect(homeSource).not.toContain('className="orbit-center__micro-label"');
    expect(stylesSource).not.toContain(".orbit-center__micro-label");
    expect(homeSource).toContain("aria-controls=\"orbit-core-brief\"");
    expect(homeSource).toContain("paused={selectedCompany !== null || pausedBadge !== null || orbitCoreOpen}");
    expect(stylesSource).toContain(".orbit-center__caption");
    expect(stylesSource).toContain(".orbit-core-summary");
    expect(stylesSource).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
