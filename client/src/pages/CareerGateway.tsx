import React, { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, ArrowRight, Briefcase, CheckCircle2, ChevronRight, 
  Download, FileText, Globe2, Loader2, Mail, Phone, Upload, User, Check, X, ShieldAlert 
} from "lucide-react";

export default function CareerGateway() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    field: "Sales",
    yearsOfExperience: "1–3 years",
    availability: "Immediately",
    trainingSectorExperience: false,
    cvUrl: "",
    cvFileName: "",
    message: "",
  });

  const submitMutation = trpc.career.submitCv.useMutation({
    onSuccess: () => {
      setSubmitting(false);
      setSubmitted(true);
    },
    onError: (err) => {
      setSubmitting(false);
      setErrorMsg(err.message || (lang === "en" ? "Failed to submit. Please try again." : "فشل الإرسال. يرجى المحاولة مرة أخرى."));
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(lang === "en" ? "File size exceeds 10MB limit." : "حجم الملف يتجاوز الحد الأقصى 10 ميجابايت.");
      return;
    }

    setUploadingFile(true);
    setErrorMsg("");

    try {
      const data = new FormData();
      data.append("file", file);
      // Upload using built-in S3 proxy endpoint
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.url || json.fileUrl || json.key) {
        const fileUrl = json.url || json.fileUrl || `/manus-storage/${json.key}`;
        setFormData(prev => ({ ...prev, cvUrl: fileUrl, cvFileName: file.name }));
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(lang === "en" ? "File upload failed. Please try again." : "فشل رفع الملف. يرجى المحاولة مرة أخرى.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber || !formData.email || !formData.cvUrl) {
      setErrorMsg(lang === "en" ? "Please fill in all required fields and upload your CV." : "يرجى تعبئة الحقول الإجبارية ورفع السيرة الذاتية.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    submitMutation.mutate({
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      field: formData.field,
      yearsOfExperience: formData.yearsOfExperience,
      availability: formData.availability,
      trainingSectorExperience: formData.trainingSectorExperience ? 1 : 0,
      cvUrl: formData.cvUrl,
      cvFileName: formData.cvFileName,
      message: formData.message,
    });
  };

  const isRtl = lang === "ar";

  return (
    <div className={`min-h-screen bg-[#07090e] text-[#f1f5f9] font-sans selection:bg-[#d4af37]/30 selection:text-[#fde047] relative overflow-x-hidden ${isRtl ? "rtl" : "ltr"}`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Background Starfield */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#111827] via-[#07090e] to-[#030407] pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07090e]/80 border-b border-[#1f2937]/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#854d0e] p-[1px] shadow-lg shadow-[#d4af37]/10 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#07090e] rounded-[11px] flex items-center justify-center font-bold text-[#d4af37]">
                MA
              </div>
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight text-white block">Mohamed Ali</span>
              <span className="text-xs text-[#94a3b8] uppercase tracking-widest block">Growth Systems</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/admin/career-roster" className="text-xs font-semibold text-[#d4af37] hover:underline flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#374151]">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{lang === "en" ? "Admin Roster" : "لوحة المشرف"}</span>
            </Link>

            <Link href="/" className="text-sm font-medium text-[#94a3b8] hover:text-[#d4af37] transition-colors flex items-center gap-1.5">
              {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {isRtl ? "العودة للرئيسية" : "Back to Portfolio"}
            </Link>

            <button
              onClick={() => setLang(l => l === "en" ? "ar" : "en")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#374151] hover:border-[#d4af37]/50 text-xs font-medium text-white transition-all shadow-sm"
            >
              <Globe2 className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{lang === "en" ? "العربية" : "English"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero / Header Section */}
      <section className="relative z-10 pt-16 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#fde047] text-xs font-medium mb-6 shadow-inner">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{lang === "en" ? "Career Gateway — Centralized Application" : "بوابة الوظائف — التقديم المركزي"}</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
            {lang === "en" ? "Join the Growth Constellation" : "انضم إلى كوكبة النمو والتميز"}
          </h1>

          <p className="text-lg text-[#94a3b8] leading-relaxed max-w-2xl mx-auto">
            {lang === "en"
              ? "Submit your CV once — I'll reach out when there's a fit with an open role across the education, training, and commercial organizations I lead and advise."
              : "أرسل سيرتك الذاتية مرة واحدة — سأقوم بالتواصل معك فور توفر فرصة مناسبة في المؤسسات التعليمية والتدريبية والتجارية التي أديرها أو أقدم لها الاستشارات."}
          </p>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="relative z-10 pb-24 px-6">
        <div className="max-w-2xl mx-auto bg-[#111827]/80 backdrop-blur-md border border-[#1f2937] rounded-3xl p-8 md:p-10 shadow-2xl relative">
          
          {submitted ? (
            <div className="py-12 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {lang === "en" ? "CV Received Successfully!" : "تم استلام سيرتك الذاتية بنجاح!"}
              </h2>
              <p className="text-[#94a3b8] max-w-md mx-auto leading-relaxed">
                {lang === "en"
                  ? "Thanks! Your CV has been received and added to the centralized review roster. I'll review it and reach out if there's a good fit with upcoming branches or partner companies."
                  : "شكراً لك! تم استلام سيرتك الذاتية وإضافتها لسجل المراجعة المركزي. سأقوم بمراجعتها والتواصل معك فور وجود توافق مع الفروع الجديدة أو الشركات الشريكة."}
              </p>
              <div className="pt-4 flex justify-center gap-4">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      fullName: "",
                      phoneNumber: "",
                      email: "",
                      field: "Sales",
                      yearsOfExperience: "1–3 years",
                      availability: "Immediately",
                      trainingSectorExperience: false,
                      cvUrl: "",
                      cvFileName: "",
                      message: "",
                    });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#1f2937] hover:bg-[#374151] text-white text-sm font-semibold transition-all border border-[#374151]"
                >
                  {lang === "en" ? "Submit Another CV" : "إرسال سير ذاتية أخرى"}
                </button>
                <Link href="/" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-[#07090e] text-sm font-bold shadow-lg shadow-[#d4af37]/20 hover:opacity-95 transition-all flex items-center gap-2">
                  <span>{lang === "en" ? "Back to Portfolio" : "العودة للرئيسية"}</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-[#d4af37]" />
                    <span>{lang === "en" ? "Full Name *" : "الاسم الكامل *"}</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === "en" ? "e.g. Ahmed Mahmoud" : "مثال: أحمد محمود"}
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#07090e] border border-[#1f2937] text-white placeholder-[#4b5563] focus:outline-none focus:border-[#d4af37] transition-all text-sm"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#d4af37]" />
                    <span>{lang === "en" ? "Phone Number *" : "رقم الهاتف *"}</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={lang === "en" ? "+20 100 000 0000" : "+20 100 000 0000"}
                    value={formData.phoneNumber}
                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#07090e] border border-[#1f2937] text-white placeholder-[#4b5563] focus:outline-none focus:border-[#d4af37] transition-all text-sm"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#d4af37]" />
                  <span>{lang === "en" ? "Email Address *" : "البريد الإلكتروني *"}</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder={lang === "en" ? "name@example.com" : "name@example.com"}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#07090e] border border-[#1f2937] text-white placeholder-[#4b5563] focus:outline-none focus:border-[#d4af37] transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Field / Specialization */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white block">
                    {lang === "en" ? "Field / Specialization *" : "المجال / التخصص *"}
                  </label>
                  <select
                    value={formData.field}
                    onChange={e => setFormData({ ...formData, field: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#07090e] border border-[#1f2937] text-white focus:outline-none focus:border-[#d4af37] transition-all text-sm"
                  >
                    <option value="Sales">{lang === "en" ? "Sales" : "المبيعات (Sales)"}</option>
                    <option value="Business Development">{lang === "en" ? "Business Development" : "تطوير الأعمال (Business Development)"}</option>
                    <option value="Marketing">{lang === "en" ? "Marketing" : "التسويق (Marketing)"}</option>
                    <option value="Operations">{lang === "en" ? "Operations" : "العمليات (Operations)"}</option>
                    <option value="Customer Service">{lang === "en" ? "Customer Service" : "خدمة العملاء (Customer Service)"}</option>
                    <option value="Training & Education">{lang === "en" ? "Training & Education" : "التعليم والتدريب (Training & Education)"}</option>
                    <option value="HR">{lang === "en" ? "HR" : "الموارد البشرية (HR)"}</option>
                    <option value="Finance">{lang === "en" ? "Finance" : "المالية (Finance)"}</option>
                    <option value="Other">{lang === "en" ? "Other" : "أخرى (Other)"}</option>
                  </select>
                </div>

                {/* Years of Experience */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white block">
                    {lang === "en" ? "Years of Experience *" : "سنوات الخبرة *"}
                  </label>
                  <select
                    value={formData.yearsOfExperience}
                    onChange={e => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#07090e] border border-[#1f2937] text-white focus:outline-none focus:border-[#d4af37] transition-all text-sm"
                  >
                    <option value="0–1 years">{lang === "en" ? "0–1 years" : "0–1 سنوات"}</option>
                    <option value="1–3 years">{lang === "en" ? "1–3 years" : "1–3 سنوات"}</option>
                    <option value="3–5 years">{lang === "en" ? "3–5 years" : "3–5 سنوات"}</option>
                    <option value="5+ years">{lang === "en" ? "5+ years" : "أكثر من 5 سنوات"}</option>
                  </select>
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white block">
                  {lang === "en" ? "Availability *" : "جاهزية العمل *"}
                </label>
                <select
                  value={formData.availability}
                  onChange={e => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#07090e] border border-[#1f2937] text-white focus:outline-none focus:border-[#d4af37] transition-all text-sm"
                >
                  <option value="Immediately">{lang === "en" ? "Immediately" : "فورا"}</option>
                  <option value="Within 2 weeks">{lang === "en" ? "Within 2 weeks" : "خلال أسبوعين"}</option>
                  <option value="Within a month">{lang === "en" ? "Within a month" : "خلال شهر"}</option>
                  <option value="Not currently looking (just connecting)">
                    {lang === "en" ? "Not currently looking (just connecting)" : "لست أبحث حالياً (للتواصل المهني فقط)"}
                  </option>
                </select>
              </div>

              {/* Training Sector Checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="trainingSector"
                  checked={formData.trainingSectorExperience}
                  onChange={e => setFormData({ ...formData, trainingSectorExperience: e.target.checked })}
                  className="w-5 h-5 rounded border-[#374151] bg-[#07090e] text-[#d4af37] focus:ring-[#d4af37]"
                />
                <label htmlFor="trainingSector" className="text-sm text-[#cbd5e1] cursor-pointer">
                  {lang === "en" 
                    ? "I have experience in the training/education academy sector" 
                    : "لدي خبرة سابقة في قطاع الأكاديميات التدريبية والتعليمية"}
                </label>
              </div>

              {/* CV Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#d4af37]" />
                  <span>{lang === "en" ? "Upload CV (PDF, DOC, DOCX — Max 10MB) *" : "رفع السيرة الذاتية (PDF, DOC — بحد أقصى 10MB) *"}</span>
                </label>
                <div className="relative border-2 border-dashed border-[#2d3748] hover:border-[#d4af37]/60 rounded-2xl p-6 text-center bg-[#07090e]/50 transition-all group">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    {uploadingFile ? (
                      <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
                    ) : formData.cvFileName ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <FileText className="w-8 h-8 text-[#94a3b8] group-hover:text-[#d4af37] transition-colors" />
                    )}
                    <p className="text-sm font-medium text-white">
                      {formData.cvFileName 
                        ? formData.cvFileName 
                        : (lang === "en" ? "Click to upload or drag and drop your CV" : "اضغط للرفع أو اسحب وأسقط ملف السيرة الذاتية هنا")}
                    </p>
                    <p className="text-xs text-[#64748b]">PDF, DOC or DOCX (MAX. 10MB)</p>
                  </div>
                </div>
              </div>

              {/* Short Note */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white block">
                  {lang === "en" ? "Anything else you'd like me to know? (Optional)" : "أي تفاصيل أخرى تود إضافتها؟ (اختياري)"}
                </label>
                <textarea
                  rows={3}
                  placeholder={lang === "en" ? "Brief note about your career highlights or goals..." : "نبذة مختصرة عن تطلعاتك أو إنجازاتك البارزة..."}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#07090e] border border-[#1f2937] text-white placeholder-[#4b5563] focus:outline-none focus:border-[#d4af37] transition-all text-sm resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#eab308] to-[#b8860b] text-[#07090e] font-bold text-base shadow-xl shadow-[#d4af37]/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{lang === "en" ? "Submitting CV..." : "جاري إرسال السيرة الذاتية..."}</span>
                  </>
                ) : (
                  <>
                    <span>{lang === "en" ? "Submit My CV" : "إرسال سيرتي الذاتية"}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1f2937]/50 py-8 px-6 text-center text-xs text-[#64748b] bg-[#07090e]">
        <p>© 2026 Mohamed Ali — Career Gateway. All rights reserved.</p>
      </footer>
    </div>
  );
}
