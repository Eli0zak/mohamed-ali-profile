import React, { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, ArrowRight, Briefcase, CheckCircle2, Clock, Download, 
  ExternalLink, FileText, Filter, Globe2, Loader2, Mail, Phone, Search, ShieldAlert, User, Check 
} from "lucide-react";

export default function CareerDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const { data: submissions, isLoading, refetch } = trpc.career.listSubmissions.useQuery(undefined, {
    retry: false,
  });

  const updateStatusMutation = trpc.career.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  const filteredSubmissions = (submissions || []).filter(sub => {
    if (statusFilter === "All") return true;
    return sub.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f1f5f9] font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1f2937] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#fde047] text-xs font-medium mb-3">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Career Gateway Roster</h1>
            <p className="text-sm text-[#94a3b8]">Centralized record of all candidate CV submissions across your partner organizations.</p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/career-gateway" className="px-4 py-2 rounded-xl bg-[#111827] border border-[#374151] hover:border-[#d4af37]/50 text-xs font-medium text-white transition-all flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-[#d4af37]" />
              <span>Open Candidate Form</span>
            </Link>
            <Link href="/" className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#07090e] text-xs font-bold shadow-lg shadow-[#d4af37]/20">
              Back to Site
            </Link>
          </div>
        </div>

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
                onClick={() => setStatusFilter(st)}
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
              <p className="text-sm text-[#94a3b8]">Loading submissions roster...</p>
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
