import { describe, expect, it } from "vitest";
import {
  SPEAKING_INVITE_BODY,
  SPEAKING_INVITE_EMAIL,
  SPEAKING_INVITE_SUBJECT,
  buildSpeakingInviteHref,
  getSpeakingInviteCopy,
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

  it("builds audience and session-specific English copy", () => {
    const copy = getSpeakingInviteCopy({ audience: "founders", kind: "workshop", language: "en" });

    expect(copy.subject).toBe("Workshop conversation with Mohamed Ali");
    expect(copy.formatLabel).toBe("Workshop");
    expect(copy.audienceLabel).toBe("Founders");
    expect(copy.body).toContain("Suggested audience: Founders");
    expect(copy.body).toContain("Format: Workshop");
  });

  it("keeps Arabic copy aligned with the selected audience and session", () => {
    const copy = getSpeakingInviteCopy({ audience: "training-communities", kind: "panel", language: "ar" });

    expect(copy.subject).toBe("دعوة للمشاركة في Panel مع محمد علي");
    expect(copy.audienceLabel).toBe("مجتمعات التدريب");
    expect(copy.formatLabel).toBe("حوار ضمن Panel");
    expect(copy.body).toContain("الجمهور المقترح: مجتمعات التدريب");
    expect(copy.body).toContain("الصيغة: حوار ضمن Panel");
  });
});
