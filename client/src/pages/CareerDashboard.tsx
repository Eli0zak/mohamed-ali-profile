import { useMemo, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  buildCareerStats,
  filterCareerSubmissions,
} from "@/lib/careerStats";
import { 
  ArrowLeft, ArrowRight, BarChart3, Briefcase, CalendarDays, CheckCircle2, Clock, Download,
  ExternalLink, FileCheck2, FileText, Filter, Globe2, History, Loader2, Mail, MessageSquare, Phone, Search, Send, ShieldAlert, User, UserPlus, Users, Check, Lock, KeyRound, AlertCircle, X

} from "lucide-react";

type BroadcastAudienceType = "all" | "field";
type QuickReplyTemplate = "thanks" | "schedule" | "not_fit" | "custom";

const quickReplyTemplateOptions: Array<{ value: QuickReplyTemplate; label: string; description: string }> = [
  { value: "thanks", label: "Thanks for applying", description: "Confirm receipt and keep the door open." },
  { value: "schedule", label: "Schedule a call", description: "Ask the candidate for a convenient call time." },
  { value: "not_fit", label: "Not a fit right now", description: "Close the loop professionally for now." },
  { value: "custom", label: "Write a custom reply", description: "Send your own message to this candidate." },
];

type BroadcastForm = {
  jobTitle: string;
  jobDetails: string;
  contactName: string;
  contactEmail: string;
  contactLinkedin: string;
  otherInstructions: string;
  audienceType: BroadcastAudienceType;
  audienceField: string;
};

function isValidRecipientEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const emptyBroadcastForm: BroadcastForm = {
  jobTitle: "",
  jobDetails: "",
  contactName: "",
  contactEmail: "",
  contactLinkedin: "",
  otherInstructions: "",
  audienceType: "all",
  audienceField: "",
};

export default function CareerDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("moh_admin_auth") === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [statsFilter, setStatsFilter] = useState<"all" | "new" | "week" | "cv">("all");
  const [broadcastForm, setBroadcastForm] = useState<BroadcastForm>(emptyBroadcastForm);
  const [broadcastNotice, setBroadcastNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [quickReplyCandidateId, setQuickReplyCandidateId] = useState<number | null>(null);
  const [quickReplyTemplate, setQuickReplyTemplate] = useState<QuickReplyTemplate>("thanks");
  const [quickReplyCustomMessage, setQuickReplyCustomMessage] = useState("");
  const referenceNow = useMemo(() => new Date(), []);
  
  const { data: submissions, isLoading, refetch } = trpc.career.listSubmissions.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  const updateStatusMutation = trpc.career.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  const { data: broadcastHistoryRows, isLoading: isBroadcastHistoryLoading, refetch: refetchBroadcastHistory } = trpc.career.listBroadcastHistory.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  const broadcastMutation = trpc.career.broadcastOpportunity.useMutation({
    onSuccess: (result) => {
      refetchBroadcastHistory();
      setBroadcastNotice({
        type: result.success ? "success" : "error",
        text: result.recipientCount === 0
          ? "No valid candidate email addresses are available for this broadcast."
          : `Broadcast completed: ${result.successCount} sent, ${result.failureCount} failed, ${result.recipientCount} unique recipients.`,
      });
      if (result.success) setBroadcastForm(emptyBroadcastForm);
    },
    onError: (error) => {
      setBroadcastNotice({ type: "error", text: error.message || "Broadcast failed. No messages were sent." });
    },
  });

  const broadcastTestMutation = trpc.career.sendBroadcastTest.useMutation({
    onSuccess: (result) => {
      refetchBroadcastHistory();
      setBroadcastNotice({
        type: result.success ? "success" : "error",
        text: result.success
          ? `Test email sent to ${result.testRecipient}. Check the inbox before sending to candidates.`
          : "The test email could not be delivered to the owner inbox.",
      });
    },
    onError: (error) => {
      setBroadcastNotice({ type: "error", text: error.message || "Test email failed. No candidate messages were sent." });
    },
  });

  const quickReplyMutation = trpc.career.sendQuickReply.useMutation({
    onSuccess: (result) => {
      refetch();
      setQuickReplyCandidateId(null);
      setQuickReplyTemplate("thanks");
      setQuickReplyCustomMessage("");
      setBroadcastNotice({ type: "success", text: `Reply sent to ${result.candidateName}. Last contacted time updated.` });
    },
    onError: (error) => {
      setBroadcastNotice({ type: "error", text: error.message || "Quick Reply failed. No email was sent." });
    },
  });

  const quickReplyCandidate = useMemo(
    () => (submissions ?? []).find((submission) => submission.id === quickReplyCandidateId) ?? null,
    [quickReplyCandidateId, submissions],
  );

  const handleQuickReplySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!quickReplyCandidate) return;
    if (quickReplyTemplate === "custom" && !quickReplyCustomMessage.trim()) {
      setBroadcastNotice({ type: "error", text: "Write a message before sending a custom reply." });
      return;
    }
    const templateLabel = quickReplyTemplateOptions.find((option) => option.value === quickReplyTemplate)?.label ?? "Quick Reply";
    const confirmed = window.confirm(`Send “${templateLabel}” to ${quickReplyCandidate.fullName} at ${quickReplyCandidate.email}?`);
    if (!confirmed) return;
    quickReplyMutation.mutate({
      candidateId: quickReplyCandidate.id,
      template: quickReplyTemplate,
      customMessage: quickReplyTemplate === "custom" ? quickReplyCustomMessage.trim() : undefined,
    });
  };

  const fieldOptions = useMemo(
    () => Array.from(new Set((submissions ?? []).map((submission) => submission.field.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [submissions],
  );

  const broadcastRecipientEstimate = useMemo(() => {
    const candidateSubmissions = broadcastForm.audienceType === "field"
      ? (submissions ?? []).filter((submission) => submission.field.trim().toLocaleLowerCase() === broadcastForm.audienceField.trim().toLocaleLowerCase())
      : (submissions ?? []);
    return new Set(candidateSubmissions.map((submission) => submission.email.trim().toLowerCase()).filter(isValidRecipientEmail)).size;
  }, [broadcastForm.audienceField, broadcastForm.audienceType, submissions]);

  const stats = useMemo(
    () => buildCareerStats(submissions ?? [], referenceNow),
    [submissions, referenceNow],
  );

  const handleStatsCardClick = (filter: "all" | "new" | "week" | "cv") => {
    if (statsFilter === filter) {
      setStatsFilter("all");
      setStatusFilter("All");
      return;
    }

    setStatsFilter(filter);
    setStatusFilter(filter === "new" ? "New" : "All");
  };

  const handleStatusFilterClick = (status: string) => {
    setStatusFilter(status);
    setStatsFilter("all");
  };

  const handleBroadcastSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBroadcastNotice(null);
    if (!submissions || submissions.length === 0) {
      setBroadcastNotice({ type: "error", text: "There are no candidate submissions to receive this opportunity." });
      return;
    }

    if (broadcastForm.audienceType === "field" && !broadcastForm.audienceField.trim()) {
      setBroadcastNotice({ type: "error", text: "Choose a field before reviewing the broadcast." });
      return;
    }
    if (broadcastRecipientEstimate === 0) {
      setBroadcastNotice({ type: "error", text: "No valid candidate emails match this audience." });
      return;
    }
    const audienceLabel = broadcastForm.audienceType === "field"
      ? `${broadcastRecipientEstimate} candidate${broadcastRecipientEstimate === 1 ? "" : "s"} in ${broadcastForm.audienceField}`
      : `${broadcastRecipientEstimate} unique candidate email${broadcastRecipientEstimate === 1 ? "" : "s"}`;
    const confirmed = window.confirm(
      `This will be sent to ${audienceLabel}. Confirm? This action will send real emails.`,
    );
    if (!confirmed) return;

    broadcastMutation.mutate({
      jobTitle: broadcastForm.jobTitle.trim(),
      jobDetails: broadcastForm.jobDetails.trim(),
      contactName: broadcastForm.contactName.trim(),
      contactEmail: broadcastForm.contactEmail.trim(),
      contactLinkedin: broadcastForm.contactLinkedin.trim(),
      otherInstructions: broadcastForm.otherInstructions.trim(),
      audienceType: broadcastForm.audienceType,
      audienceField: broadcastForm.audienceType === "field" ? broadcastForm.audienceField.trim() : undefined,
    });
  };

  const handleBroadcastTest = () => {
    setBroadcastNotice(null);
    if (!broadcastForm.jobTitle.trim() || broadcastForm.jobTitle.trim().length < 3 || !broadcastForm.jobDetails.trim() || broadcastForm.jobDetails.trim().length < 10) {
      setBroadcastNotice({ type: "error", text: "Enter a valid job title and at least 10 characters of job details before sending a test." });
      return;
    }
    const confirmed = window.confirm("Send a design test email to mohamed280ali90@gmail.com only? No candidate will receive this test.");
    if (!confirmed) return;
    broadcastTestMutation.mutate({
      jobTitle: broadcastForm.jobTitle.trim(),
      jobDetails: broadcastForm.jobDetails.trim(),
      contactName: broadcastForm.contactName.trim(),
      contactEmail: broadcastForm.contactEmail.trim(),
      contactLinkedin: broadcastForm.contactLinkedin.trim(),
      otherInstructions: broadcastForm.otherInstructions.trim(),
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin password for Mohamed Ali
    if (passwordInput === "Mohamed2026!@#" || passwordInput === "moh280ali") {
      setIsAuthenticated(true);
      sessionStorage.setItem("moh_admin_auth", "true");
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] text-[#f1f5f9] font-sans flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111827]/90 border border-[#1f2937] rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="text-center space-y-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center mx-auto text-[#d4af37]">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Restricted Access</h1>
            <p className="text-xs text-[#94a3b8]">
              Authorized for <span className="text-[#d4af37] font-medium">mohamed280ali90@gmail.com</span> only. Please enter your secure admin password to view candidate submissions.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-[#d4af37]" />
                Admin Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError(false);
                }}
                placeholder="Enter secure admin password..."
                className="w-full bg-[#07090e] border border-[#374151] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37] transition-all"
                required
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Incorrect password. Please enter the valid admin passcode.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#07090e] text-sm font-bold shadow-lg shadow-[#d4af37]/20 hover:opacity-95 transition-all"
            >
              Unlock Roster
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-[#94a3b8] hover:text-[#d4af37] transition-colors inline-flex items-center gap-1.5">
              ← Return to Main Portfolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredSubmissions = filterCareerSubmissions(submissions || [], statsFilter, referenceNow).filter((sub) => {
    return statusFilter === "All" || sub.status === statusFilter;
  });

  const chartMax = Math.max(...stats.dailySubmissions.map((point) => point.count), 1);
  const activeFilterLabel =
    statsFilter === "new" ? "New submissions" :
    statsFilter === "week" ? "Last 7 days" :
    statsFilter === "cv" ? "CVs uploaded" :
    statusFilter !== "All" ? statusFilter : null;

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f1f5f9] font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1f2937] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#fde047] text-xs font-medium mb-3">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Admin Dashboard — Secure Roster</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Career Gateway Roster</h1>
            <p className="text-sm text-[#94a3b8]">Centralized secure record of all candidate CV submissions across your partner organizations.</p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <a
              href="#job-opportunity-broadcast-section"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#07090e] text-xs font-bold shadow-lg shadow-[#d4af37]/20 flex items-center gap-2 hover:opacity-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Job Opportunity</span>
            </a>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                sessionStorage.removeItem("moh_admin_auth");
              }}
              className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium hover:bg-rose-500/25 transition-all"
            >
              Lock Roster
            </button>
            <Link href="/career-gateway" className="px-4 py-2 rounded-xl bg-[#111827] border border-[#374151] hover:border-[#d4af37]/50 text-xs font-medium text-white transition-all flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-[#d4af37]" />
              <span>Open Candidate Form</span>
            </Link>
          </div>
        </div>

        {/* Live Stats Overview — admin-only, derived from the loaded MySQL submissions */}
        <section aria-labelledby="career-roster-stats-title" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#d4af37] font-semibold">Live overview</p>
              <h2 id="career-roster-stats-title" className="text-xl font-semibold text-white">Recruitment pulse</h2>
              <p className="text-xs text-[#94a3b8] mt-1">Calculated from the current candidate records on every load.</p>
            </div>
            {activeFilterLabel && (
              <button
                type="button"
                onClick={() => {
                  setStatsFilter("all");
                  setStatusFilter("All");
                }}
                className="inline-flex items-center gap-1.5 self-start sm:self-auto text-xs text-[#fde047] hover:text-white transition-colors"
                aria-label="Clear active dashboard filter"
              >
                <X className="w-3.5 h-3.5" />
                Clear filter: {activeFilterLabel}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              { key: "all" as const, label: "Total submissions", value: stats.total, icon: Users, accent: "text-[#fde047]", helper: "All-time records" },
              { key: "new" as const, label: "New submissions", value: stats.newSubmissions, icon: UserPlus, accent: "text-blue-400", helper: "Status: New" },
              { key: "week" as const, label: "This week", value: stats.thisWeek, icon: CalendarDays, accent: "text-emerald-400", helper: "Last 7 calendar days" },
              { key: "cv" as const, label: "CVs uploaded", value: stats.cvsUploaded, icon: FileCheck2, accent: "text-violet-400", helper: "Valid file links" },
            ].map((card) => {
              const Icon = card.icon;
              const isActive = statsFilter === card.key;
              return (
                <button
                  type="button"
                  key={card.key}
                  onClick={() => handleStatsCardClick(card.key)}
                  aria-pressed={isActive}
                  className={`group text-left rounded-2xl border p-4 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/80 ${
                    isActive
                      ? "bg-[#d4af37]/10 border-[#d4af37]/70 shadow-lg shadow-[#d4af37]/10"
                      : "bg-[#111827]/80 border-[#1f2937] hover:border-[#d4af37]/50 hover:bg-[#151f30]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`w-9 h-9 rounded-xl bg-[#07090e] border border-[#273244] flex items-center justify-center ${card.accent}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#64748b] group-hover:text-[#94a3b8] transition-colors">View</span>
                  </div>
                  <div className="mt-4 text-3xl font-bold text-white tabular-nums">{isLoading ? "—" : card.value}</div>
                  <div className="mt-1 text-sm font-medium text-[#e2e8f0]">{card.label}</div>
                  <div className="mt-1 text-[11px] text-[#64748b]">{card.helper}</div>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-[#1f2937] bg-[#111827]/80 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#d4af37]" />
                <div>
                  <h3 className="text-sm font-semibold text-white">Daily submissions</h3>
                  <p className="text-[11px] text-[#64748b]">Last 7 calendar days, based on submission timestamps</p>
                </div>
              </div>
              <span className="text-xs text-[#94a3b8] tabular-nums">{isLoading ? "Loading…" : `${stats.thisWeek} total`}</span>
            </div>
            <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-32" role="img" aria-label="Bar chart of submissions for the last seven calendar days">
              {stats.dailySubmissions.map((point) => (
                <div key={point.key} className="h-full flex flex-col items-center justify-end gap-2 min-w-0">
                  <span className="text-[11px] font-semibold text-[#e2e8f0] tabular-nums">{isLoading ? "—" : point.count}</span>
                  <div className="w-full max-w-12 h-20 rounded-lg bg-[#07090e] border border-[#1f2937] flex items-end overflow-hidden">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-[#b8860b] to-[#fde047] transition-[height] duration-300"
                      style={{ height: isLoading ? "0%" : `${Math.max((point.count / chartMax) * 100, point.count > 0 ? 10 : 0)}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-[10px] text-[#64748b] truncate max-w-full">{point.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Job Opportunity Broadcast — admin-only */}
        <section id="job-opportunity-broadcast-section" aria-labelledby="broadcast-title" className="rounded-2xl border border-[#d4af37]/25 bg-[#111827]/80 p-4 sm:p-6 shadow-xl shadow-black/10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#d4af37]" />
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#d4af37] font-semibold">Network connector</p>
              </div>
              <h2 id="broadcast-title" className="mt-2 text-xl font-semibold text-white">Broadcast a job opportunity</h2>
              <p className="mt-1 text-xs leading-5 text-[#94a3b8]">Share a verified opportunity with unique candidate email addresses stored in Career Gateway. The message will be sent only after your confirmation.</p>
            </div>
            <div className="shrink-0 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] leading-5 text-amber-200/80 max-w-xs">
              Use the opportunity contact details below so candidates know exactly who to contact.
            </div>
          </div>

          <form onSubmit={handleBroadcastSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-[#cbd5e1]">Job title <span className="text-rose-400">*</span></span>
                <input
                  required
                  minLength={3}
                  maxLength={255}
                  value={broadcastForm.jobTitle}
                  onChange={(event) => setBroadcastForm((current) => ({ ...current, jobTitle: event.target.value }))}
                  placeholder="e.g. Business Development Manager"
                  className="w-full rounded-xl border border-[#374151] bg-[#07090e] px-3.5 py-3 text-sm text-white placeholder:text-[#64748b] outline-none transition-colors focus:border-[#d4af37]"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-[#cbd5e1]">Opportunity contact name</span>
                <input
                  maxLength={255}
                  value={broadcastForm.contactName}
                  onChange={(event) => setBroadcastForm((current) => ({ ...current, contactName: event.target.value }))}
                  placeholder="Hiring manager or company contact"
                  className="w-full rounded-xl border border-[#374151] bg-[#07090e] px-3.5 py-3 text-sm text-white placeholder:text-[#64748b] outline-none transition-colors focus:border-[#d4af37]"
                />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[#cbd5e1]">Job details <span className="text-rose-400">*</span></span>
              <textarea
                required
                minLength={10}
                maxLength={20_000}
                rows={5}
                value={broadcastForm.jobDetails}
                onChange={(event) => setBroadcastForm((current) => ({ ...current, jobDetails: event.target.value }))}
                placeholder="Responsibilities, location, seniority, compensation context, and application instructions..."
                className="w-full resize-y rounded-xl border border-[#374151] bg-[#07090e] px-3.5 py-3 text-sm leading-6 text-white placeholder:text-[#64748b] outline-none transition-colors focus:border-[#d4af37]"
              />
            </label>

            <div className="rounded-2xl border border-[#d4af37]/40 bg-[#0c1322] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#d4af37]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">Target Audience & Recipient Filtering</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#cbd5e1]">Send to group <span className="text-rose-400">*</span></span>
                  <select
                    value={broadcastForm.audienceType}
                    onChange={(event) => setBroadcastForm((current) => ({
                      ...current,
                      audienceType: event.target.value as BroadcastAudienceType,
                      audienceField: event.target.value === "all" ? "" : (current.audienceField || fieldOptions[0] || ""),
                    }))}
                    className="w-full rounded-xl border border-[#d4af37]/40 bg-[#07090e] px-3.5 py-3 text-sm font-semibold text-white outline-none transition-colors focus:border-[#d4af37]"
                  >
                    <option value="all">⚡ All Unique Candidates (Send to everyone)</option>
                    <option value="field">🎯 Filter by Field / Specialization (e.g. Sales only)</option>
                  </select>
                </label>
                {broadcastForm.audienceType === "field" ? (
                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold text-[#cbd5e1]">Target Field / Specialization <span className="text-rose-400">*</span></span>
                    <select
                      required
                      value={broadcastForm.audienceField}
                      onChange={(event) => setBroadcastForm((current) => ({ ...current, audienceField: event.target.value }))}
                      className="w-full rounded-xl border border-[#d4af37]/40 bg-[#07090e] px-3.5 py-3 text-sm font-semibold text-[#fde047] outline-none transition-colors focus:border-[#d4af37]"
                    >
                      <option value="" disabled>Select specialization...</option>
                      {fieldOptions.map((field) => <option key={field} value={field}>{field}</option>)}
                    </select>
                  </label>
                ) : (
                  <div className="flex items-center text-xs text-[#94a3b8] px-2 pt-5">
                    ℹ️ Automatically sends to all unique candidate emails without duplication.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-[#cbd5e1]">Contact email</span>
                <input
                  type="email"
                  maxLength={320}
                  value={broadcastForm.contactEmail}
                  onChange={(event) => setBroadcastForm((current) => ({ ...current, contactEmail: event.target.value }))}
                  placeholder="contact@company.com"
                  className="w-full rounded-xl border border-[#374151] bg-[#07090e] px-3.5 py-3 text-sm text-white placeholder:text-[#64748b] outline-none transition-colors focus:border-[#d4af37]"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-[#cbd5e1]">LinkedIn profile or post</span>
                <input
                  type="url"
                  maxLength={512}
                  value={broadcastForm.contactLinkedin}
                  onChange={(event) => setBroadcastForm((current) => ({ ...current, contactLinkedin: event.target.value }))}
                  placeholder="https://linkedin.com/..."
                  className="w-full rounded-xl border border-[#374151] bg-[#07090e] px-3.5 py-3 text-sm text-white placeholder:text-[#64748b] outline-none transition-colors focus:border-[#d4af37]"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-[#cbd5e1]">Additional instructions</span>
                <input
                  maxLength={20_000}
                  value={broadcastForm.otherInstructions}
                  onChange={(event) => setBroadcastForm((current) => ({ ...current, otherInstructions: event.target.value }))}
                  placeholder="How candidates should apply"
                  className="w-full rounded-xl border border-[#374151] bg-[#07090e] px-3.5 py-3 text-sm text-white placeholder:text-[#64748b] outline-none transition-colors focus:border-[#d4af37]"
                />
              </label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={broadcastMutation.isPending || broadcastTestMutation.isPending || isLoading || broadcastRecipientEstimate === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8860b] px-5 py-3 text-sm font-bold text-[#07090e] shadow-lg shadow-[#d4af37]/15 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {broadcastMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {broadcastMutation.isPending ? "Sending..." : "Review and broadcast"}
              </button>
              <button
                type="button"
                onClick={handleBroadcastTest}
                disabled={broadcastMutation.isPending || broadcastTestMutation.isPending || isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d4af37]/50 bg-[#d4af37]/5 px-4 py-3 text-xs font-semibold text-[#fde047] transition-all hover:bg-[#d4af37]/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {broadcastTestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {broadcastTestMutation.isPending ? "Sending test..." : "Send test to owner"}
              </button>
              <span className="text-[11px] text-[#64748b]">Estimated recipients: {isLoading ? "—" : broadcastRecipientEstimate}{broadcastForm.audienceType === "field" && broadcastForm.audienceField ? ` in ${broadcastForm.audienceField}` : ""}</span>
            </div>

            {broadcastNotice && (
              <div className={`rounded-xl border px-3.5 py-3 text-xs ${broadcastNotice.type === "success" ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-rose-500/25 bg-rose-500/10 text-rose-300"}`} role="status">
                {broadcastNotice.text}
              </div>
            )}
          </form>

          <div className="mt-7 border-t border-[#1f2937] pt-5">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-[#d4af37]" />
              <h3 className="text-sm font-semibold text-white">Broadcast history</h3>
            </div>
            {isBroadcastHistoryLoading ? (
              <p className="text-xs text-[#64748b]">Loading broadcast history...</p>
            ) : !broadcastHistoryRows?.length ? (
              <p className="text-xs text-[#64748b]">No broadcasts have been sent yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#1f2937]">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead className="bg-[#07090e]/60 text-[#94a3b8]">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">Opportunity</th>
                      <th className="px-3 py-2.5 font-semibold">Audience</th>
                      <th className="px-3 py-2.5 font-semibold">Sent</th>
                      <th className="px-3 py-2.5 font-semibold">Delivered</th>
                      <th className="px-3 py-2.5 font-semibold">Failed</th>
                      <th className="px-3 py-2.5 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f2937] text-[#cbd5e1]">
                    {broadcastHistoryRows.slice(0, 10).map((broadcast) => (
                      <tr key={broadcast.id}>
                        <td className="px-3 py-3 font-medium text-white">{broadcast.jobTitle}</td>
                        <td className="px-3 py-3 text-[#fde047]">{broadcast.audienceType === "test" ? "Owner test" : broadcast.audienceType === "field" ? broadcast.audienceField || "Field" : "All candidates"}</td>
                        <td className="px-3 py-3 tabular-nums">{broadcast.recipientCount}</td>
                        <td className="px-3 py-3 tabular-nums text-emerald-300">{broadcast.successCount}</td>
                        <td className="px-3 py-3 tabular-nums text-rose-300">{broadcast.failureCount}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-[#94a3b8]">{new Date(broadcast.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Filters & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111827]/80 border border-[#1f2937] rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#d4af37]" />
            <span className="text-sm font-medium text-white">Filter Status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "New", "Reviewed", "Shortlisted", "Contacted", "Archived"].map(st => (
              <button
                key={st}
                onClick={() => handleStatusFilterClick(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === st 
                    ? "bg-[#d4af37] text-[#07090e] font-bold shadow-md shadow-[#d4af37]/20" 
                    : "bg-[#07090e] text-[#94a3b8] border border-[#1f2937] hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-[#111827]/80 border border-[#1f2937] rounded-2xl overflow-hidden shadow-2xl">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
              <p className="text-sm text-[#94a3b8]">Loading secure submissions roster...</p>
            </div>
          ) : !submissions || submissions.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <FileText className="w-12 h-12 text-[#4b5563] mx-auto" />
              <h3 className="text-lg font-semibold text-white">No CV submissions yet</h3>
              <p className="text-sm text-[#94a3b8] max-w-sm mx-auto">
                Candidates submitting their CVs through <code className="text-[#d4af37]">/career-gateway</code> will appear here instantly.
              </p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-[#94a3b8]">No submissions match the status filter "{statusFilter}".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1f2937] text-xs font-semibold text-[#94a3b8] uppercase tracking-wider bg-[#07090e]/50">
                    <th className="py-4 px-6">Candidate</th>
                    <th className="py-4 px-6">Specialization</th>
                    <th className="py-4 px-6">Experience / Training</th>
                    <th className="py-4 px-6">Availability</th>
                    <th className="py-4 px-6">CV Document</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937] text-sm">
                  {filteredSubmissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-[#1a2332]/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">{sub.fullName}</div>
                        <div className="text-xs text-[#94a3b8] flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#d4af37]" /> {sub.phoneNumber}</span>
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[#d4af37]" /> {sub.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md bg-[#1f2937] text-[#fde047] text-xs font-medium">
                          {sub.field}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-white text-xs">{sub.yearsOfExperience}</div>
                        {sub.trainingSectorExperience === 1 && (
                          <span className="inline-block mt-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Training Sector Exp
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-[#cbd5e1]">
                        {sub.availability}
                      </td>
                      <td className="py-4 px-6">
                        <a 
                          href={sub.cvUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#07090e] border border-[#374151] hover:border-[#d4af37] text-xs font-medium text-[#d4af37] transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{sub.cvFileName || "Download CV"}</span>
                        </a>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={sub.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: sub.id, status: e.target.value as any })}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border focus:outline-none transition-all ${
                            sub.status === "New" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                            sub.status === "Reviewed" ? "bg-purple-500/10 border-purple-500/30 text-purple-400" :
                            sub.status === "Shortlisted" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                            sub.status === "Contacted" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                            "bg-gray-500/10 border-gray-500/30 text-gray-400"
                          }`}
                        >
                          <option value="New" className="bg-[#07090e] text-white">New</option>
                          <option value="Reviewed" className="bg-[#07090e] text-white">Reviewed</option>
                          <option value="Shortlisted" className="bg-[#07090e] text-white">Shortlisted</option>
                          <option value="Contacted" className="bg-[#07090e] text-white">Contacted</option>
                          <option value="Archived" className="bg-[#07090e] text-white">Archived</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setQuickReplyCandidateId(sub.id);
                              setQuickReplyTemplate("thanks");
                              setQuickReplyCustomMessage("");
                              setBroadcastNotice(null);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4af37] bg-[#d4af37]/20 px-3.5 py-2 text-xs font-bold text-[#fde047] shadow-md shadow-[#d4af37]/10 transition-all hover:bg-[#d4af37]/30 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                          >
                            <MessageSquare className="h-4 w-4 text-[#fde047]" />
                            <span>Quick Reply</span>
                          </button>
                          <span className="text-xs text-[#64748b]">
                            {sub.lastContactedAt
                              ? `Last contacted ${new Date(sub.lastContactedAt).toLocaleDateString()}`
                              : `Applied ${new Date(sub.createdAt).toLocaleDateString()}`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {quickReplyCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="quick-reply-title">
            <div className="w-full max-w-lg rounded-2xl border border-[#d4af37]/30 bg-[#111827] p-6 shadow-2xl shadow-black/50">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d4af37]">Candidate follow-up</p>
                  <h2 id="quick-reply-title" className="mt-1 text-xl font-bold text-white">Reply to {quickReplyCandidate.fullName}</h2>
                  <p className="mt-1 break-all text-sm text-[#94a3b8]">{quickReplyCandidate.email}</p>
                </div>
                <button type="button" onClick={() => setQuickReplyCandidateId(null)} className="rounded-lg p-2 text-[#94a3b8] transition-colors hover:bg-white/10 hover:text-white" aria-label="Close Quick Reply">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleQuickReplySubmit} className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  {quickReplyTemplateOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setQuickReplyTemplate(option.value)}
                      className={`rounded-xl border p-3 text-left transition-all ${quickReplyTemplate === option.value ? "border-[#d4af37] bg-[#d4af37]/10" : "border-[#374151] bg-[#07090e]/60 hover:border-[#64748b]"}`}
                    >
                      <span className="block text-sm font-semibold text-white">{option.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#94a3b8]">{option.description}</span>
                    </button>
                  ))}
                </div>

                {quickReplyTemplate === "custom" && (
                  <textarea
                    value={quickReplyCustomMessage}
                    onChange={(event) => setQuickReplyCustomMessage(event.target.value)}
                    rows={5}
                    maxLength={10_000}
                    placeholder="Write the message you want to send..."
                    className="w-full resize-y rounded-xl border border-[#374151] bg-[#07090e] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#64748b] focus:border-[#d4af37]"
                  />
                )}

                {/* Live Email Preview Box */}
                <div className="rounded-xl border border-[#374151]/70 bg-[#07090e]/80 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-[#d4af37] uppercase">Live Email Preview</span>
                    <span className="text-[11px] text-[#64748b]">To: {quickReplyCandidate.email}</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p className="text-[#cbd5e1] font-medium">
                      <span className="text-[#94a3b8]">Subject:</span> {quickReplyTemplate === "custom" ? "A message from Mohamed Ali — Career Gateway" : `${quickReplyTemplateOptions.find(o => o.value === quickReplyTemplate)?.label} — Mohamed Ali`}
                    </p>
                    <div className="mt-2 rounded-lg bg-[#111827] p-3 text-[#cbd5e1] space-y-2 border border-[#1f2937]">
                      <p className="font-semibold text-white">Dear {quickReplyCandidate.fullName || "Candidate"},</p>
                      <p className="whitespace-pre-line text-[#94a3b8] leading-relaxed">
                        {quickReplyTemplate === "thanks" && "Thank you for submitting your application to our Career Gateway. We have received your CV and are currently reviewing your qualifications."}
                        {quickReplyTemplate === "schedule" && "Thank you for your application. I'd like to schedule a short call to discuss your experience. When are you available?"}
                        {quickReplyTemplate === "not_fit" && "Thank you for your interest in joining Mohamed Ali's professional network. While your profile is impressive, we are not moving forward at this time."}
                        {quickReplyTemplate === "custom" && (quickReplyCustomMessage.trim() || "(Type your custom message above to preview it here...)")}
                      </p>
                      <p className="pt-2 text-[11px] text-[#64748b] border-t border-[#1f2937]">
                        Best regards,<br /><strong className="text-[#cbd5e1]">Mohamed Ali</strong><br />Career Gateway
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-[#1f2937] pt-4 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setQuickReplyCandidateId(null)} className="rounded-xl border border-[#374151] px-4 py-2.5 text-sm font-semibold text-[#cbd5e1] transition-colors hover:border-[#64748b] hover:text-white">Cancel</button>
                  <button type="submit" disabled={quickReplyMutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2.5 text-sm font-bold text-[#07090e] transition-all hover:bg-[#fde047] disabled:cursor-not-allowed disabled:opacity-60">
                    {quickReplyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send reply
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
