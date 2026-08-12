/* مدار النفوذ: الصفحة الرئيسية تجمع بين السرد التحريري، الكوكبة المدارية، ووضوح الإنجاز. */
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  Facebook,
  FileText,
  Globe2,
  GraduationCap,
  Languages,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MoveUpRight,
  Phone,
  Play,
  Quote,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Language = "en" | "ar";
type CompanyType = "full-time" | "consulting";

type Company = {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  initials: string;
  role: string;
  dates: string;
  type: CompanyType;
  tag: string;
  description?: string;
  roles: string[];
  achievements: string[];
  color: string;
  chart?: { label: string; value: number; display: string }[];
  chartMax?: number;
};

const asset = {
  hero: "/manus-storage/mohamed-ali-space-hero_0ccd748c.jpg",
  orbit: "/manus-storage/mohamed-ali-orbit-field_3453ad26.jpg",
  career: "/manus-storage/mohamed-ali-career-texture_8082882e.jpg",
  contact: "/manus-storage/mohamed-ali-contact-atmosphere_d03246ec.jpg",
  mark: "/manus-storage/mohamed-ali-mark_3c86176b.png",
  profile: "/manus-storage/profile_cb7113aa.jpg",
  cv: "/manus-storage/Mohamed_Ali_CV_99df027a.pdf",
};

const linkedinUrl = "https://www.linkedin.com/in/mohamed-ali-88a49b29a";

const companies: Company[] = [
  {
    id: "jcc",
    name: "JCC Training Academy",
    shortName: "JCC Training Academy",
    logo: "/manus-storage/jexora-campus_8d62abc5.jpeg",
    initials: "JCC",
    role: "Branch Manager & BD Lead",
    dates: "Jan 2026 — Present",
    type: "full-time",
    tag: "Executive Role",
    roles: ["Founding Member", "Branch Manager", "BD Lead"],
    description: "Founding member of the branch; opened the academy's operations and scaled it from launch.",
    achievements: [
      "Opened and established the branch from the ground up, including the initial 2-month setup and readiness phase before commercial launch",
      "Scaled monthly revenue from EGP 150,000 in month 1 to EGP 250,000 in month 2 and EGP 300,000 in month 3, reaching a peak of EGP 450,000/month — within an organization with 7 months total market presence",
      "Built the branch's operational structure and workflows across Sales, Operations, and Education departments",
      "Recruited, trained, and managed the sales team, implementing onboarding and continuous performance-development programs",
      "Designed sales processes that improved lead management, follow-up discipline, and conversion rates",
      "Conducted market and competitor research to identify opportunities and strengthen the academy's market position",
      "Established KPIs, performance-monitoring systems, and reporting mechanisms across departments",
      "Introduced competitive advantages, new educational services, and value-added offerings to differentiate the academy from competitors",
      "Coordinated cross-functional collaboration between Sales, Operations, and Academic teams to ensure seamless student experience",
    ],
    color: "#fbbf24",
    chart: [
      { label: "Month 1", value: 150, display: "EGP 150K" },
      { label: "Month 2", value: 250, display: "EGP 250K" },
      { label: "Month 3", value: 300, display: "EGP 300K" },
      { label: "Month 5 / Peak", value: 450, display: "EGP 450K" },
    ],
    chartMax: 500,
  },
  {
    id: "russian",
    name: "Russian Cultural Center",
    shortName: "Russian Cultural Center",
    logo: "/manus-storage/jcc-jexora_ae963fa5.jpeg",
    initials: "RCC",
    role: "Sales Team Leader → BD Specialist",
    dates: "2024 — 2025",
    type: "full-time",
    tag: "Executive Role",
    roles: ["Sales Team Leader", "BD Specialist"],
    achievements: [
      "Developed strategic partnerships and business-expansion opportunities as Business Development Specialist (2025)",
      "Led commercial sales operations and daily team performance as Sales Team Leader (2024–2025)",
      "Contributed to increasing monthly revenue from approximately EGP 2M to EGP 5M — the highest monthly revenue in the organization's history",
      "Led branch operations including sales, marketing, and student services",
      "Built and managed a high-performing sales team, achieving monthly and quarterly revenue targets",
      "Implemented CRM and structured sales funnels, increasing conversion and retention rates",
      "Designed and delivered sales training programs to enhance team skills and performance",
      "Improved customer experience and reduced service-related issues by applying quality control processes",
      "Monitored KPIs, forecasting, coaching, and sales quality across the team",
    ],
    color: "#38bdf8",
    chart: [
      { label: "Start", value: 2, display: "EGP 2M" },
      { label: "Peak / month", value: 5, display: "EGP 5M" },
    ],
    chartMax: 5,
  },
  {
    id: "be-fluent",
    name: "Be Fluent",
    shortName: "Be Fluent",
    logo: "/manus-storage/be-fluent_ed3866f1.jpeg",
    initials: "BF",
    role: "Business Development Consultant & Sales Trainer (current) / previously Branch Manager & Business Developer",
    dates: "Oct 2024 — Present",
    type: "full-time",
    tag: "Executive Role",
    roles: ["Business Developer", "Branch Manager", "Consultant"],
    description: "Transitioned from full-time Branch Manager to an ongoing consulting and training role for the sales team.",
    achievements: [
      "Oversaw branch performance, ensuring operational excellence and consistent enrollment growth",
      "Monitored and developed sales team performance through KPI-driven coaching",
      "Coordinated with marketing and academic teams to enhance student acquisition and satisfaction",
      "Implemented feedback-based service improvements increasing retention rates",
      "Managed end-to-end branch operations and launched two new business branches",
      "Continues providing business development consulting and sales training services to the organization's commercial team",
      "Designed commercial growth initiatives and operational improvements that carried into the current advisory engagement",
    ],
    color: "#67e8f9",
  },
  {
    id: "mec",
    name: "MEC Academy",
    shortName: "MEC Academy",
    logo: "",
    initials: "MEC",
    role: "Senior Sales Consultant → Sales Team Leader → Head of Quality Assurance",
    dates: "2023 — 2024",
    type: "full-time",
    tag: "Executive Role",
    roles: ["Senior Sales Consultant", "Sales Team Leader", "Head of Quality Assurance"],
    achievements: [
      "Progressed from Senior Sales Consultant to Sales Team Leader to Head of Quality Assurance based on performance",
      "Built quality-assurance standards and coaching frameworks focused on preventing service and sales-process issues, not just detecting them after the fact — designing the standards that shape the customer experience upfront",
      "Designed performance-evaluation systems and coaching frameworks; partnered with senior leadership to improve operational efficiency",
      "As Senior Sales Consultant, consistently achieved sales targets while mentoring junior team members",
      "Received a Certificate of Appreciation (dated May 17, 2024) in sincere recognition of outstanding efforts and valuable contribution to the success of \"AISPRINT\"",
    ],
    color: "#a78bfa",
  },
  {
    id: "harvest",
    name: "Harvest British College",
    shortName: "Harvest British College",
    logo: "/manus-storage/harvest_fbefaf15.jpeg",
    initials: "HBC",
    role: "Sales Executive → Senior Sales Consultant → Sales Team Leader → Acting Branch Manager → Branch Manager",
    dates: "2021 — 2023",
    type: "full-time",
    tag: "Executive Role",
    roles: ["Sales Executive", "Senior Sales Consultant", "Sales Team Leader", "Acting Branch Manager", "Branch Manager"],
    description: "Rapidly promoted through five leadership positions within approximately two years.",
    achievements: [
      "Progression: Sales Executive → Senior Sales Consultant → Sales Team Leader → Acting Branch Manager → Branch Manager",
      "Led branch operations, managing sales performance and operational KPIs",
      "Recruited, coached, and developed sales professionals, driving customer acquisition and commercial growth",
      "Played a key leadership role during organizational restructuring, handling responsibilities typically assigned to a Sales Manager",
      "Trained new sales hires and improved onboarding processes, boosting team productivity and closing efficiency",
      "Consistently achieved top performance ranking and contributed to maximizing enrollment and revenue growth",
    ],
    color: "#bef264",
  },
  {
    id: "planit",
    name: "PlanIT Software School",
    shortName: "PlanIT Software School",
    logo: "/manus-storage/planit_778aaca0.jpeg",
    initials: "PIT",
    role: "Sales Trainer & Business Development Consultant",
    dates: "2023 — Present",
    type: "consulting",
    tag: "Consulting Partner",
    roles: ["Sales Trainer", "BD Consultant"],
    description: "Delivered training and consulting engagements.",
    achievements: ["Delivered training and consulting engagements."],
    color: "#60a5fa",
  },
  {
    id: "eraasoft",
    name: "EraaSoft",
    shortName: "EraaSoft",
    logo: "/manus-storage/eraasoft_f29f8d15.jpeg",
    initials: "ES",
    role: "Sales Trainer & Business Development Consultant",
    dates: "2023 — Present",
    type: "consulting",
    tag: "Consulting Partner",
    roles: ["Sales Trainer", "BD Consultant"],
    description: "Delivered training and consulting engagements.",
    achievements: ["Delivered training and consulting engagements."],
    color: "#38bdf8",
  },
  {
    id: "smart",
    name: "SMART Creative Agency",
    shortName: "SMART Creative Agency",
    logo: "/manus-storage/smart_7365295d.jpeg",
    initials: "SCA",
    role: "Sales Trainer & Business Development Consultant",
    dates: "Consulting engagement",
    type: "consulting",
    tag: "Consulting Partner",
    roles: ["Sales Trainer", "BD Consultant"],
    description: "Delivered training and consulting engagements.",
    achievements: ["Delivered training and consulting engagements."],
    color: "#e5e7eb",
  },
  {
    id: "globe",
    name: "Globe Upscale",
    shortName: "Globe Upscale",
    logo: "/manus-storage/globe-upscale_4cdf96af.jpeg",
    initials: "GU",
    role: "Sales Trainer & Business Development Consultant",
    dates: "Consulting engagement",
    type: "consulting",
    tag: "Consulting Partner",
    roles: ["Sales Trainer", "BD Consultant"],
    description: "Delivered training and consulting engagements.",
    achievements: ["Delivered training and consulting engagements."],
    color: "#2dd4bf",
  },
  {
    id: "ibi",
    name: "IBI British",
    shortName: "IBI British",
    logo: "/manus-storage/ibi-british_10638c30.jpeg",
    initials: "IBI",
    role: "Sales Trainer & Business Development Consultant",
    dates: "Consulting engagement",
    type: "consulting",
    tag: "Consulting Partner",
    roles: ["Sales Trainer", "BD Consultant"],
    description: "Delivered training and consulting engagements.",
    achievements: ["Delivered training and consulting engagements."],
    color: "#93c5fd",
  },
  {
    id: "futuretech",
    name: "FutureTech",
    shortName: "FutureTech",
    logo: "/manus-storage/futuretech_107721b3.jpeg",
    initials: "FT",
    role: "Sales Trainer & Business Development Consultant",
    dates: "Consulting engagement",
    type: "consulting",
    tag: "Consulting Partner",
    roles: ["Sales Trainer", "BD Consultant"],
    description: "Delivered training and consulting engagements.",
    achievements: ["Delivered training and consulting engagements."],
    color: "#d946ef",
  },
  {
    id: "amit",
    name: "AMIT",
    shortName: "AMIT",
    logo: "/manus-storage/amit_2cead941.jpeg",
    initials: "AM",
    role: "Sales Trainer & Business Development Consultant",
    dates: "Consulting engagement",
    type: "consulting",
    tag: "Consulting Partner",
    roles: ["Sales Trainer", "BD Consultant"],
    description: "Delivered training and consulting engagements.",
    achievements: ["Delivered training and consulting engagements."],
    color: "#f87171",
  },
  {
    id: "middleware",
    name: "Middleware",
    shortName: "Middleware",
    logo: "/manus-storage/middleware_095a149d.jpeg",
    initials: "MW",
    role: "Sales Trainer & Business Development Consultant",
    dates: "Consulting engagement",
    type: "consulting",
    tag: "Consulting Partner",
    roles: ["Sales Trainer", "BD Consultant"],
    description: "Delivered training and consulting engagements.",
    achievements: ["Delivered training and consulting engagements."],
    color: "#22d3ee",
  },
];

const timeline = [
  {
    year: "2021 — 2023",
    company: "Harvest British College",
    role: "Branch Manager",
    logo: "/manus-storage/harvest_fbefaf15.jpeg",
    copy: "Rapidly promoted through five leadership positions within approximately two years.",
    icon: TrendingUp,
  },
  {
    year: "2024 — 2025",
    company: "Russian Cultural Center",
    role: "Sales Team Leader → BD Specialist",
    logo: "/manus-storage/jcc-jexora_ae963fa5.jpeg",
    copy: "Led the sales team and expansion strategy, contributing to peak monthly revenue growth from EGP 2M to EGP 5M.",
    icon: BarChart3,
  },
  {
    year: "2025 — Present",
    company: "Be Fluent",
    role: "Business Developer → Branch Manager → Consultant",
    logo: "/manus-storage/be-fluent_ed3866f1.jpeg",
    copy: "Managed end-to-end branch operations and launched two new business branches before transitioning into advisory work.",
    icon: Target,
  },
  {
    year: "Jan 2026 — Present",
    company: "JCC Training Academy",
    role: "Branch Manager & BD Lead",
    logo: "/manus-storage/jexora-campus_8d62abc5.jpeg",
    copy: "Founding member: opened a branch from the ground up, scaling monthly revenue from EGP 150K to EGP 450K peak in the first five operating months.",
    icon: Zap,
  },
];

const trainingTopics = [
  "Business Development",
  "Commercial Strategy",
  "Sales Leadership",
  "Consultative Selling",
  "CRM Management",
  "Sales Psychology",
  "Lead Management",
  "Branch Operations",
  "Team Leadership",
  "Performance Coaching",
  "Customer Experience",
];

const skillStack = [
  ["Excel", "Advanced"],
  ["Power BI", "Dashboards"],
  ["SQL", "Querying"],
  ["Python", "Data"],
  ["CRM", "Zoho · Tamkeen"],
  ["KPI", "Reporting"],
];

function useReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.12 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (target - start) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

function useScrollState() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return scrolled;
}

function Copy({ language, en, ar }: { language: Language; en: string; ar: string }) {
  return <>{language === "en" ? en : ar}</>;
}

function SectionIntro({
  eyebrow,
  title,
  copy,
  language,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  copy: string;
  language: Language;
  align?: "left" | "center";
}) {
  return (
    <div className={`section-intro ${align === "center" ? "section-intro--center" : ""}`} data-reveal>
      <p className="eyebrow"><span className="eyebrow-dot" />{eyebrow}</p>
      <h2>{title}</h2>
      <p className="section-intro__copy">{copy}</p>
    </div>
  );
}

function LogoImage({ company, className = "" }: { company: Company; className?: string }) {
  const [failed, setFailed] = useState(!company.logo);
  return failed ? (
    <span className={`logo-fallback ${className}`} style={{ "--logo-color": company.color } as React.CSSProperties}>
      {company.initials}
    </span>
  ) : (
    <img
      className={`company-logo ${className}`}
      src={company.logo}
      alt={`${company.name} logo`}
      onError={() => setFailed(true)}
    />
  );
}

function OrbitBadge({
  company,
  index,
  ring,
  onPause,
  onSelect,
}: {
  company: Company;
  index: number;
  ring: "inner" | "outer";
  onPause: (id: string | null) => void;
  onSelect: (company: Company) => void;
}) {
  const total = ring === "inner" ? 5 : 8;
  const duration = ring === "inner" ? 32 : 25;
  const radius = ring === "inner" ? "150px" : "235px";
  const angle = (index / total) * 360;
  return (
    <button
      type="button"
      className={`orbit-badge orbit-badge--${ring}`}
      style={{
        "--orbit-radius": radius,
        "--orbit-angle": `${angle}deg`,
        "--orbit-counter-angle": `${-angle}deg`,
        "--orbit-duration": `${duration}s`,
        "--badge-color": company.color,
      } as React.CSSProperties}
      onMouseEnter={() => onPause(company.id)}
      onMouseLeave={() => onPause(null)}
      onFocus={() => onPause(company.id)}
      onBlur={() => onPause(null)}
      onClick={() => onSelect(company)}
      aria-label={`Open achievements for ${company.name}`}
    >
      <span className="orbit-badge__halo" />
      <span className="orbit-badge__body"><LogoImage company={company} /></span>
      <span className="orbit-tooltip">{company.name}</span>
    </button>
  );
}

function OrbitTrack({
  companies,
  ring,
  paused,
  onPause,
  onSelect,
}: {
  companies: Company[];
  ring: "inner" | "outer";
  paused: boolean;
  onPause: (id: string | null) => void;
  onSelect: (company: Company) => void;
}) {
  const duration = ring === "inner" ? 32 : 25;
  return (
    <div
      className={`orbit-track orbit-track--${ring}`}
      style={{
        "--track-duration": `${duration}s`,
        animationPlayState: paused ? "paused" : "running",
      } as React.CSSProperties}
      aria-label={`${ring === "inner" ? "Executive roles" : "Training and consulting partners"} orbit`}
    >
      {companies.map((company, index) => (
        <OrbitBadge key={company.id} company={company} index={index} ring={ring} onPause={onPause} onSelect={onSelect} />
      ))}
    </div>
  );
}

function RevenueChart({ company }: { company: Company }) {
  const points = company.chart ?? [];
  const [animatedValues, setAnimatedValues] = useState(() => points.map(() => 0));

  useEffect(() => {
    if (!points.length) return;
    let frame = 0;
    const startedAt = performance.now();
    const duration = 760;
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValues(points.map((point) => point.value * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    setAnimatedValues(points.map(() => 0));
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [company.id, points]);

  if (!points.length) return null;
  const isMillionChart = company.id === "russian";
  return (
    <div className="revenue-chart">
      <div className="chart-heading"><span><BarChart3 size={14} /> Revenue trajectory</span><span className="chart-heading__unit">EGP</span></div>
      <div className="chart-bars" aria-label={`${company.name} revenue chart`}>
        {points.map((point, index) => {
          const value = animatedValues[index] ?? 0;
          const displayValue = isMillionChart ? `EGP ${value.toFixed(1).replace(/\\.0$/, "")}M` : `EGP ${Math.round(value)}K`;
          return (
            <div className="chart-bar-group" key={point.label}>
              <span className="chart-value">{displayValue}</span>
              <div className="chart-bar-track"><div className="chart-bar" style={{ height: `${Math.max(value ? 5 : 0, (value / (company.chartMax ?? 100)) * 100)}%` }} /></div>
              <span className="chart-label">{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AchievementCard({ company, onClose }: { company: Company; onClose: () => void }) {
  return (
    <article className="achievement-card" data-reveal>
      <div className="achievement-card__topline"><span>{company.tag}</span><button type="button" onClick={onClose} aria-label="Close achievement card"><X size={18} /></button></div>
      <div className="achievement-card__identity">
        <div className="achievement-card__logo"><LogoImage company={company} /></div>
        <div><p className="company-kicker">Selected orbit</p><h3>{company.name}</h3><p className="achievement-card__dates">{company.dates}</p></div>
      </div>
      <p className="achievement-card__description">{company.description ?? "Delivered training and consulting engagements."}</p>
      <div className="achievement-card__role"><span className="company-kicker">Role title</span><strong>{company.role}</strong></div>
      <div className="role-progression">
        <p className="company-kicker">Role progression</p>
        <div className="role-progression__path">{company.roles.map((role, index) => <span key={role}><b>{role}</b>{index < company.roles.length - 1 && <ArrowRight size={13} />}</span>)}</div>
      </div>
      <div className="achievement-card__body">
        <div><p className="company-kicker">Impact notes</p><ul>{company.achievements.map((achievement, index) => <li key={achievement} style={{ "--item-delay": `${index * 70}ms` } as React.CSSProperties}><Check size={14} />{achievement}</li>)}</ul></div>
        <RevenueChart company={company} />
      </div>
    </article>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [pausedBadge, setPausedBadge] = useState<string | null>(null);
  const [formState, setFormState] = useState({ name: "", email: "", details: "" });
  const scrolled = useScrollState();
  useReveal();
  const trainedCount = useCountUp(750);
  const partnerCount = useCountUp(13, 1100);
  const fullTime = useMemo(() => companies.filter((company) => company.type === "full-time"), []);
  const consulting = useMemo(() => companies.filter((company) => company.type === "consulting"), []);

  useEffect(() => {
    document.documentElement.lang = language === "ar" ? "ar" : "en";
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const toggleLanguage = () => setLanguage((current) => current === "en" ? "ar" : "en");
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const sendWhatsApp = (event: React.FormEvent) => {
    event.preventDefault();
    const message = `Hello Mohamed, my name is ${formState.name}. Email: ${formState.email}. ${formState.details}`;
    window.open(`https://wa.me/201030537773?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="portfolio-shell">
      <div className="ambient-noise" aria-hidden="true" />
      <header className={`site-nav ${scrolled ? "site-nav--scrolled" : ""}`}>
        <a className="brand-lockup" href="#top" aria-label="Mohamed Ali home">
          <span className="brand-mark"><img src={asset.mark} alt="" /></span>
          <span><strong>Mohamed Ali</strong><small>Growth systems / 06</small></span>
        </a>
        <nav className={`desktop-nav ${menuOpen ? "desktop-nav--open" : ""}`} aria-label="Primary navigation">
          <a href="#companies" onClick={() => setMenuOpen(false)}>{language === "en" ? "Orbit" : "الكوكبة"}</a>
          <a href="#journey" onClick={() => setMenuOpen(false)}>{language === "en" ? "Journey" : "المسار"}</a>
          <a href="#training" onClick={() => setMenuOpen(false)}>{language === "en" ? "Training" : "التدريب"}</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>{language === "en" ? "Contact" : "التواصل"}</a>
          <Link href="/career-gateway" className="text-[#d4af37] font-semibold flex items-center gap-1" onClick={() => setMenuOpen(false)}>
            <Briefcase className="w-3.5 h-3.5" />
            <span>{language === "en" ? "Career Gateway" : "بوابة الوظائف"}</span>
          </Link>
        </nav>
        <div className="nav-actions">
          <button className="language-toggle" type="button" onClick={toggleLanguage} aria-label="Toggle Arabic and English"><Languages size={15} /><span>{language === "en" ? "العربية" : "English"}</span></button>
          <a className="nav-cv" href={asset.cv} download="Mohamed-Ali-CV.pdf"><Download size={15} /> <span>Download CV</span></a>
          <button className="menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section" style={{ backgroundImage: `linear-gradient(90deg, rgba(3,7,18,.98) 0%, rgba(3,7,18,.82) 45%, rgba(3,7,18,.25) 100%), url(${asset.hero})` }}>
          <div className="starfield" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
          <div className="hero-orbit hero-orbit--one" aria-hidden="true" /><div className="hero-orbit hero-orbit--two" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy" data-reveal>
              <p className="hero-pretitle"><span className="status-dot" /> Available for growth conversations <span className="hero-pretitle__line" /></p>
              <h1>Mohamed <em>Ali</em></h1>
              <p className="hero-role">Business Development <span>/</span> Commercial Operations <span>/</span> Sales Leadership</p>
              <p className="hero-lede">I build the systems behind commercial momentum — launching branches, scaling revenue, and training sales teams across Egypt's education and training sector.</p>
              <div className="hero-actions"><a className="button button--gold" href={asset.cv} download="Mohamed-Ali-CV.pdf"><Download size={17} /> Download CV</a><button className="button button--ghost" type="button" onClick={() => scrollTo("contact")}>Open a growth conversation <ArrowUpRight size={17} /></button></div>
              <div className="contact-strip">
                <a href="tel:+201030537773"><Phone size={14} />01030537773</a>
                <a href="mailto:mohamed280ali90@gmail.com"><Mail size={14} />mohamed280ali90@gmail.com</a>
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"><Linkedin size={14} />LinkedIn</a>
                <span><MapPin size={14} />Giza, Egypt</span>
              </div>
            </div>
            <div className="hero-portrait-wrap" data-reveal>
              <div className="portrait-rings" aria-hidden="true"><span /><span /><span /></div>
              <div className="portrait-card"><img src={asset.profile} alt="Mohamed Ali presenting a training session" /><div className="portrait-card__label"><span>MOHAMED ALI</span><small>BUSINESS DEVELOPMENT · EGYPT</small></div></div>
              <div className="portrait-data portrait-data--top"><span>05+</span><small>years in<br />commercial growth</small></div>
              <div className="portrait-data portrait-data--bottom"><span>750+</span><small>sales professionals<br />trained</small></div>
            </div>
          </div>
          <div className="hero-bottomline container"><span>Scroll to map the orbit</span><ArrowDown size={16} /><span className="hero-bottomline__code">MA / 001 — 2026</span></div>
        </section>

        <section className="signal-section container" data-reveal>
          <div className="signal-cell"><span className="signal-number">01</span><strong>Branches launched</strong><small>From the ground up</small></div>
          <div className="signal-cell"><span className="signal-number">EGP 5M</span><strong>Peak monthly revenue</strong><small>Russian Cultural Center</small></div>
          <div className="signal-cell"><span className="signal-number">15+</span><strong>Organizations served</strong><small>Training & consulting</small></div>
          <div className="signal-cell"><span className="signal-number">06</span><strong>Commercial disciplines</strong><small>Sales · Ops · CRM · KPI</small></div>
        </section>

        <section id="companies" className="orbit-section section-dark" style={{ backgroundImage: `linear-gradient(180deg, rgba(7,11,20,.88), rgba(7,11,20,.97)), url(${asset.orbit})` }}>
          <div className="container">
            <SectionIntro eyebrow="02 / Partner constellation" title="The companies inside my orbit." copy="Two rings. Thirteen partners. One operating pattern: turn commercial potential into repeatable performance." language={language} />
            <div className="orbit-layout">
              <div className="orbit-stage" data-reveal>
                <div className="orbit-guide orbit-guide--outer" /><div className="orbit-guide orbit-guide--inner" />
                <div className="orbit-center"><div className="orbit-center__pulse" /><img src={asset.mark} alt="" /><span>MA</span><small>impact<br />core</small></div>
                <OrbitTrack companies={fullTime} ring="inner" paused={selectedCompany !== null || pausedBadge !== null} onPause={setPausedBadge} onSelect={setSelectedCompany} />
                <OrbitTrack companies={consulting} ring="outer" paused={selectedCompany !== null || pausedBadge !== null} onPause={setPausedBadge} onSelect={setSelectedCompany} />
                <div className="orbit-annotation orbit-annotation--inner"><span />full-time roles</div>
                <div className="orbit-annotation orbit-annotation--outer"><span />training / consulting</div>
              </div>
              <div className="orbit-aside" data-reveal>
                {selectedCompany ? <AchievementCard company={selectedCompany} onClose={() => setSelectedCompany(null)} /> : <div className="orbit-prompt"><p className="eyebrow"><span className="eyebrow-dot" /> Explore the constellation</p><h3>Every badge holds a chapter of the work.</h3><p>Hover to pause a trajectory. Select any company to open the role progression, dates, and measurable impact behind the mark.</p><div className="orbit-prompt__hint"><span className="hint-ring" /><span>Inner ring<br /><b>Executive roles</b></span><span className="hint-ring hint-ring--small" /><span>Outer ring<br /><b>Consulting partners</b></span></div><div className="orbit-prompt__count"><strong>{partnerCount}</strong><span>partners<br />mapped</span></div></div>}
              </div>
            </div>
            <div className="orbit-legend"><span><i className="legend-dot legend-dot--gold" /> Inner ring: full-time executive roles</span><span><i className="legend-dot legend-dot--cyan" /> Outer ring: training & consulting engagements</span></div>
          </div>
        </section>

        <section id="journey" className="journey-section" style={{ backgroundImage: `linear-gradient(180deg, rgba(3,7,18,.98), rgba(3,7,18,.88)), url(${asset.career})` }}>
          <div className="container">
            <SectionIntro eyebrow="03 / Career progression" title="A track record that compounds." copy="Promotions, operating systems, and commercial growth — connected across the years." language={language} />
            <div className="timeline-wrap">
              <div className="timeline-rail" aria-hidden="true"><span /><span /><span /><span /></div>
              {timeline.map((item, index) => {
                const Icon = item.icon;
                return <article className="timeline-card" data-reveal key={item.company} style={{ "--timeline-delay": `${index * 90}ms` } as React.CSSProperties}><div className="timeline-card__index">0{index + 1}</div><div className="timeline-card__logo"><img src={item.logo} alt={`${item.company} logo`} /></div><div className="timeline-card__content"><p className="company-kicker">{item.company}</p><h3>{item.role}</h3><p>{item.copy}</p><div className="timeline-card__meta"><span><Icon size={14} /> trajectory point</span><span className="timeline-year">{item.year}</span></div></div><ArrowUpRight className="timeline-card__arrow" size={20} /></article>;
              })}
            </div>
          </div>
        </section>

        <section id="training" className="training-section section-dark">
          <div className="container training-grid">
            <div className="training-copy" data-reveal><SectionIntro eyebrow="04 / Consulting & corporate training" title="Turn the sales floor into a learning system." copy="I help education and training organizations build stronger commercial habits: clearer funnels, better coaching, and teams that know how to move a conversation forward." language={language} /><div className="training-stat"><span className="training-stat__number">{trainedCount}<sup>+</sup></span><span>sales professionals trained<br />across 15+ organizations</span></div><a className="text-link" href="#contact">Design a training track <ArrowRight size={15} /></a></div>
            <div className="training-topics" data-reveal><p className="company-kicker">Modules in the orbit</p><div className="topic-cloud">{trainingTopics.map((topic, index) => <span key={topic} style={{ "--topic-delay": `${index * 40}ms` } as React.CSSProperties}>{topic}</span>)}</div><div className="training-callout"><Quote size={26} /><p>“The best commercial system is one that makes good decisions easier to repeat.”</p><span>— Mohamed Ali / operating principle</span></div></div>
          </div>
        </section>

        <section className="skills-section">
          <div className="container skills-grid">
            <div data-reveal><SectionIntro eyebrow="05 / Capability stack" title="The tools behind the decisions." copy="A practical blend of commercial judgment, operational discipline, and data fluency." language={language} /><div className="skill-stack">{skillStack.map(([name, detail], index) => <div className="skill-chip" key={name} style={{ "--skill-delay": `${index * 60}ms` } as React.CSSProperties}><span className="skill-chip__icon">{index === 0 ? "EX" : index === 1 ? "BI" : index === 2 ? "SQL" : index === 3 ? "PY" : index === 4 ? "CRM" : "KPI"}</span><span><b>{name}</b><small>{detail}</small></span><ArrowUpRight size={15} /></div>)}</div></div>
            <div className="credential-stack" data-reveal><div className="credential-card credential-card--gold"><div className="credential-card__icon"><GraduationCap size={21} /></div><div><p className="company-kicker">Certifications & training</p><h3>PMP Training — 35 hours</h3><p>PMI exam eligibility completed · 2025</p><p>Data Analysis Certificate · Excel, Power BI, SQL, Python · 2025</p></div></div><div className="credential-card"><div className="credential-card__icon"><FileText size={21} /></div><div><p className="company-kicker">Academic education</p><h3>Bachelor of Laws (LL.B.)</h3><p>Helwan University · Faculty of Law</p></div></div><div className="credential-card"><div className="credential-card__icon"><Globe2 size={21} /></div><div><p className="company-kicker">Languages</p><h3>Arabic · English · French</h3><p>Native · Professional working proficiency · A2</p></div></div></div>
          </div>
        </section>

        <section id="contact" className="contact-section" style={{ backgroundImage: "linear-gradient(90deg, rgba(3,7,18,.99) 0%, rgba(3,7,18,.94) 55%, rgba(7,20,40,.88) 100%)" }}>
          <div className="container contact-grid">
            <div className="contact-copy" data-reveal><p className="eyebrow"><span className="eyebrow-dot" /> 06 / Open channel</p><h2>Let's put the next<br /><em>orbit</em> in motion.</h2><p>Reach out for branch launching, commercial consulting, sales leadership, or a corporate training engagement.</p><div className="contact-details"><a href="mailto:mohamed280ali90@gmail.com"><Mail size={16} />mohamed280ali90@gmail.com</a><a href="tel:+201030537773"><Phone size={16} />+20 10 3053 7773</a><span><MapPin size={16} />Giza, Egypt · GMT+2</span></div><div className="social-links"><a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a><a href="https://wa.me/201030537773" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={17} /></a><a href="mailto:mohamed280ali90@gmail.com" aria-label="Email"><Mail size={17} /></a></div></div>
            <form className="contact-form" onSubmit={sendWhatsApp} data-reveal><div className="form-heading"><span>Start a conversation</span><span className="form-status"><span /> direct channel</span></div><label>Full name<Input required value={formState.name} onChange={(event) => setFormState({ ...formState, name: event.target.value })} placeholder="Your name" /></label><label>Email address<Input required type="email" value={formState.email} onChange={(event) => setFormState({ ...formState, email: event.target.value })} placeholder="you@company.com" /></label><label>What are we building?<Textarea required value={formState.details} onChange={(event) => setFormState({ ...formState, details: event.target.value })} placeholder="Tell me about the branch, team, or commercial challenge..." /></label><button className="button button--gold button--full" type="submit">Send direct message via WhatsApp <MoveUpRight size={16} /></button><p className="form-note"><Sparkles size={14} /> Your message opens directly in WhatsApp — no inbox lost in space.</p></form>
          </div>
        </section>
      </main>

      <footer className="site-footer"><div className="container"><div className="footer-brand"><span className="brand-mark"><img src={asset.mark} alt="" /></span><span><strong>Mohamed Ali</strong><small>Build the system. Scale the signal.</small></span></div><div className="flex items-center gap-6"><Link href="/career-gateway" className="text-sm font-semibold text-[#d4af37] hover:underline flex items-center gap-1.5"><Briefcase className="w-4 h-4" /><span>{language === "en" ? "Career Gateway" : "بوابة الوظائف"}</span></Link></div><p>© 2026 Mohamed Ali. Business Development · Commercial Operations · Sales Leadership.</p><a href="#top" aria-label="Back to top"><ArrowUpRight size={17} /></a></div></footer>
    </div>
  );
}
