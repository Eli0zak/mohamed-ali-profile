export const SPEAKING_INVITE_EMAIL = "mohamed280ali90@gmail.com";
export const SPEAKING_INVITE_SUBJECT = "Speaking invitation for Mohamed Ali";
export const SPEAKING_INVITE_BODY = [
  "Hello Mohamed,",
  "",
  "I would like to invite you to speak at our event.",
  "",
  "Event / organization:",
  "Proposed date:",
  "Audience:",
  "Format:",
  "",
  "Best,",
].join("\n");

export function buildSpeakingInviteHref({
  email = SPEAKING_INVITE_EMAIL,
  subject = SPEAKING_INVITE_SUBJECT,
  body = SPEAKING_INVITE_BODY,
}: {
  email?: string;
  subject?: string;
  body?: string;
} = {}) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function getSpeakingInviteCopyText({
  email = SPEAKING_INVITE_EMAIL,
  subject = SPEAKING_INVITE_SUBJECT,
  body = SPEAKING_INVITE_BODY,
}: {
  email?: string;
  subject?: string;
  body?: string;
} = {}) {
  return `Email: ${email}\nSubject: ${subject}\n\n${body}`;
}

export const speakingInviteHref = buildSpeakingInviteHref();
export const speakingInviteCopyText = getSpeakingInviteCopyText();
