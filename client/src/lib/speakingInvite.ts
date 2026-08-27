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

export type SpeakingAudience = "sales-teams" | "founders" | "training-communities";
export type SpeakingInviteKind = "talk" | "workshop" | "panel";
export type SpeakingLanguage = "en" | "ar";

type LocalizedLabel = { en: string; ar: string };

type SpeakingOption<T extends string> = {
  id: T;
  label: LocalizedLabel;
  detail: LocalizedLabel;
};

export const speakingAudienceOptions: readonly SpeakingOption<SpeakingAudience>[] = [
  {
    id: "sales-teams",
    label: { en: "Sales teams", ar: "فرق المبيعات" },
    detail: { en: "Sales conversations and team performance", ar: "المحادثات البيعية وأداء الفريق" },
  },
  {
    id: "founders",
    label: { en: "Founders", ar: "المؤسسون" },
    detail: { en: "Commercial clarity and growth execution", ar: "الوضوح التجاري وتنفيذ النمو" },
  },
  {
    id: "training-communities",
    label: { en: "Training communities", ar: "مجتمعات التدريب" },
    detail: { en: "Practical learning and applied workshops", ar: "التعلم العملي والورش التطبيقية" },
  },
];

export const speakingInviteOptions: readonly SpeakingOption<SpeakingInviteKind>[] = [
  {
    id: "talk",
    label: { en: "Invite me to speak", ar: "دعوة للتحدث" },
    detail: { en: "A focused conversation for your audience", ar: "جلسة مركزة تناسب جمهورك" },
  },
  {
    id: "workshop",
    label: { en: "Discuss a workshop", ar: "مناقشة ورشة عمل" },
    detail: { en: "Turn a topic into an applied session", ar: "تحويل الموضوع إلى جلسة تطبيقية" },
  },
  {
    id: "panel",
    label: { en: "Ask about a panel", ar: "دعوة للمشاركة في Panel" },
    detail: { en: "Explore a practical panel conversation", ar: "استكشاف حوار عملي ضمن Panel" },
  },
];

const audienceFocus: Record<SpeakingAudience, LocalizedLabel> = {
  "sales-teams": {
    en: "sales conversations, team performance, and practical commercial habits",
    ar: "المحادثات البيعية وأداء الفريق والعادات التجارية العملية",
  },
  founders: {
    en: "commercial clarity, growth execution, and connecting teams to customer conversations",
    ar: "الوضوح التجاري وتنفيذ النمو وربط الفرق بمحادثات العملاء",
  },
  "training-communities": {
    en: "practical learning, sales thinking, and workshops grounded in real commercial rooms",
    ar: "التعلم العملي والتفكير البيعي وورش العمل المستندة إلى واقع العمل التجاري",
  },
};

const kindCopy: Record<SpeakingInviteKind, { subject: LocalizedLabel; format: LocalizedLabel; intro: LocalizedLabel }> = {
  talk: {
    subject: { en: "Speaking invitation for Mohamed Ali", ar: "دعوة للتحدث مع محمد علي" },
    format: { en: "Talk / speaking session", ar: "جلسة تحدث / تقديم" },
    intro: { en: "I would like to invite you to speak at our event.", ar: "أرغب في دعوتك للتحدث في فعاليتنا." },
  },
  workshop: {
    subject: { en: "Workshop conversation with Mohamed Ali", ar: "مناقشة ورشة عمل مع محمد علي" },
    format: { en: "Workshop", ar: "ورشة عمل" },
    intro: { en: "I would like to discuss a practical workshop with you.", ar: "أرغب في مناقشة ورشة عمل عملية معك." },
  },
  panel: {
    subject: { en: "Panel invitation for Mohamed Ali", ar: "دعوة للمشاركة في Panel مع محمد علي" },
    format: { en: "Panel conversation", ar: "حوار ضمن Panel" },
    intro: { en: "I would like to invite you to join a practical panel conversation.", ar: "أرغب في دعوتك للمشاركة في حوار عملي ضمن Panel." },
  },
};

function getOptionLabel<T extends string>(options: readonly SpeakingOption<T>[], id: T, language: SpeakingLanguage) {
  return options.find((option) => option.id === id)?.label[language] ?? id;
}

export function getSpeakingInviteCopy({
  audience = "sales-teams",
  kind = "talk",
  language = "en",
}: {
  audience?: SpeakingAudience;
  kind?: SpeakingInviteKind;
  language?: SpeakingLanguage;
} = {}) {
  const selectedKind = kindCopy[kind];
  const selectedAudience = getOptionLabel(speakingAudienceOptions, audience, language);
  const focus = audienceFocus[audience][language];
  const format = selectedKind.format[language];
  const intro = selectedKind.intro[language];
  const lines = language === "ar"
    ? ["مرحبًا محمد،", "", intro, "", `الجمهور المقترح: ${selectedAudience}`, `محاور الجلسة: ${focus}`, "الجهة / الفعالية:", "التاريخ المقترح:", `الصيغة: ${format}`, "", "مع التحية،"]
    : ["Hello Mohamed,", "", intro, "", `Suggested audience: ${selectedAudience}`, `Conversation direction: ${focus}`, "Event / organization:", "Proposed date:", `Format: ${format}`, "", "Best,"];

  return {
    subject: selectedKind.subject[language],
    body: lines.join("\n"),
    audienceLabel: selectedAudience,
    formatLabel: format,
    focus,
  };
}

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
