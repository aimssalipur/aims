import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ShieldCheck, Calendar, Lock, Eye, AlertCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn about how AIMS Salipur collects, processes, and protects your personal information and student data.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50/50 relative overflow-hidden py-16 sm:py-24">
        {/* Decorative backgrounds */}
        <div className="absolute top-20 -left-40 w-96 h-96 bg-aims-navy/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-40 -right-40 w-96 h-96 bg-aims-green/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 max-w-4xl relative">
          
          {/* Header Card */}
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-1.5 bg-aims-navy/5 border border-aims-navy/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-aims-navy">
              <ShieldCheck className="h-3.5 w-3.5" /> SECURITY & DATA TRUST
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-slate-500 font-semibold flex items-center justify-center gap-1.5 text-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              Last Updated: August 13, 2026
            </p>
          </div>

          {/* Privacy Document */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 sm:p-10 md:p-12 space-y-10 text-slate-750">
            
            <div className="space-y-4">
              <p className="text-base text-slate-600 leading-relaxed font-medium">
                At Achyutanand Institute of Medical Science (AIMS), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you interact with our online education portal.
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Section 1 */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span className="flex h-7 w-7 rounded-lg bg-aims-navy/10 text-aims-navy items-center justify-center text-xs font-bold shrink-0">1</span>
                Information We Collect
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                To deliver a premium learning experience, we collect information that you provide directly, as well as data gathered automatically:
              </p>
              <ul className="grid sm:grid-cols-2 gap-3 pl-2 pt-2">
                {[
                  { title: "Personal Profile", desc: "Name, email, WhatsApp, avatar URL, and passwords." },
                  { title: "Course Interactions", desc: "Enrollments, quiz scores, assignment uploads, progress, and attendance logs." },
                  { title: "Presence & Live Chat", desc: "In-memory logs for realtime communications in live video classrooms." },
                  { title: "Technical telemetry", desc: "IP address, browser metadata, and navigation statistics for optimization." }
                ].map((item, idx) => (
                  <li key={idx} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-1">
                    <span className="font-extrabold text-xs text-slate-900 block">{item.title}</span>
                    <span className="text-xs text-slate-500 font-medium leading-relaxed block">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span className="flex h-7 w-7 rounded-lg bg-aims-navy/10 text-aims-navy items-center justify-center text-xs font-bold shrink-0">2</span>
                How We Use Your Information
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                We process your personal information based on legitimate educational and business interests, including:
              </p>
              <ul className="space-y-3 text-sm text-slate-600 pl-4 list-disc font-semibold">
                <li>Registering your account and providing access to course syllabus and dashboards.</li>
                <li>Tracking student progress, managing classrooms, and issuing certifications.</li>
                <li>Sending system notifications, announcements, and scheduling reminders.</li>
                <li>Generating administrative growth, attendance, and feedback analytics.</li>
              </ul>
            </div>

            {/* Section 3 - Alert Callout */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span className="flex h-7 w-7 rounded-lg bg-aims-navy/10 text-aims-navy items-center justify-center text-xs font-bold shrink-0">3</span>
                Data Security Protocols
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                We implement industry-standard encryption, tokenized authentications (JWT), and database Row Level Security (RLS) rules to guarantee that only authorized students can access curriculum content.
              </p>
              
              <div className="p-5 rounded-2xl border border-amber-200/50 bg-amber-50/40 text-amber-900 flex gap-4">
                <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-extrabold text-sm block">Important Security Notice</span>
                  <span className="text-xs text-amber-800/90 leading-relaxed block font-medium">
                    While we enforce maximum precautions, no method of online transmission or database storage is 100% secure. We cannot guarantee complete safety of data shared outside our platform controls.
                  </span>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span className="flex h-7 w-7 rounded-lg bg-aims-navy/10 text-aims-navy items-center justify-center text-xs font-bold shrink-0">4</span>
                Sharing and Disclosing Data
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                <b>We do not sell, rent, or lease your personal information.</b> We only share minimal metadata with trusted infrastructure subprocessors (e.g., Supabase database hosting, Jitsi video APIs) required to deliver educational services.
              </p>
            </div>

            {/* Section 5 */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span className="flex h-7 w-7 rounded-lg bg-aims-navy/10 text-aims-navy items-center justify-center text-xs font-bold shrink-0">5</span>
                Your Rights
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                You have full control over your student profile. Depending on your jurisdiction, you have the right to request access to, correction of, or permanent deletion of your account and personal records. To request deletion, please contact our support team.
              </p>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
