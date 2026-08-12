import { useMemo, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  buildCareerStats,
  filterCareerSubmissions,
} from "@/lib/careerStats";
import { 
  ArrowLeft, ArrowRight, BarChart3, Briefcase, CalendarDays, CheckCircle2, Clock, Download,
  ExternalLink, FileCheck2, FileText, Filter, Globe2, Loader2, Mail, Phone, Search, ShieldAlert, User, UserPlus, Users, Check, Lock, KeyRound, AlertCircle, X

} from "lucide-react";

export default function CareerDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("moh_admin_auth") === "true";
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [statsFilter, setStatsFilter] = useState<"all" | "new" | "week" | "cv">("all");
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

          <div className="flex items-center gap-4">
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
            <Link href="/" className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#07090e] text-xs font-bold shadow-lg shadow-[#d4af37]/20">
              Back to Site
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
                        <span className="text-xs text-[#64748b]">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
