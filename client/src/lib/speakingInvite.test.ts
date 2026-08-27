import { describe, expect, it } from "vitest";
import {
  SPEAKING_INVITE_BODY,
  SPEAKING_INVITE_EMAIL,
  SPEAKING_INVITE_SUBJECT,
  buildSpeakingInviteHref,
  getSpeakingInviteCopyText,
} from "./speakingInvite";

describe("speaking invite link", () => {
  it("builds an encoded mailto href with the default invitation details", () => {
    const href = buildSpeakingInviteHref();
    const parsed = new URL(href);

    expect(parsed.protocol).toBe("mailto:");
    expect(parsed.pathname).toBe(SPEAKING_INVITE_EMAIL);
    expect(parsed.searchParams.get("subject")).toBe(SPEAKING_INVITE_SUBJECT);
    expect(parsed.searchParams.get("body")).toBe(SPEAKING_INVITE_BODY);
    expect(href).toContain("%20");
  });

  it("keeps a copyable fallback with the same recipient and template", () => {
    const copyText = getSpeakingInviteCopyText();

    expect(copyText).toContain(`Email: ${SPEAKING_INVITE_EMAIL}`);
    expect(copyText).toContain(`Subject: ${SPEAKING_INVITE_SUBJECT}`);
    expect(copyText).toContain(SPEAKING_INVITE_BODY);
  });
});
