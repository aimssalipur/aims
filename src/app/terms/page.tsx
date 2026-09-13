import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FileText, Calendar, BookOpen, AlertOctagon, Terminal } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the Terms and Conditions of service governing classroom conduct, piracy policies, intellectual properties, and role permissions.",
};

export default function TermsOfServicePage() {
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
              <FileText className="h-3.5 w-3.5" /> LEGAL AGREEMENT
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-slate-500 font-semibold flex items-center justify-center gap-1.5 text-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              Last Updated: August 13, 2026
            </p>
          </div>

          {/* Terms Document */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 sm:p-10 md:p-12 space-y-10 text-slate-750">
            
            <div className="space-y-4">
              <p className="text-base text-slate-600 leading-relaxed font-medium">
                Welcome to AIMS. Please read these Terms and Conditions carefully before using our platform, including our student dashboard, instructor workspaces, live classroom channels, and related educational resources.
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Section 1 */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span className="flex h-7 w-7 rounded-lg bg-aims-navy/10 text-aims-navy items-center justify-center text-xs font-bold shrink-0">1</span>
                Acceptance of Agreement
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                By registering an account, purchasing a program, watching a video lecture, or joining a live class, you agree to be legally bound by these Terms and our Privacy Policy. If you do not accept these terms, you must not use our services.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span className="flex h-7 w-7 rounded-lg bg-aims-navy/10 text-aims-navy items-center justify-center text-xs font-bold shrink-0">2</span>
                Role-Based Accounts & Privileges
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                We manage access permissions based on role definitions (Admin, Instructor, Student):
              </p>
              <ul className="grid gap-3 pt-1">
                {[
                  { title: "Student License", desc: "Grants a limited, revocable, non-transferable license to access lectures for personal educational growth." },
                  { title: "Instructor Mandates", desc: "Requires faculty to only upload course resources they own or have explicit legal rights to distribute." },
                  { title: "Admin Jurisdiction", desc: "Confers absolute control to suspend accounts, modify user privileges, or remove materials breaching this agreement." }
                ].map((item, idx) => (
                  <li key={idx} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-sm text-slate-900 block">{item.title}</span>
                      <span className="text-xs text-slate-500 font-semibold leading-relaxed block">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 3 - Alert Callout */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span className="flex h-7 w-7 rounded-lg bg-aims-navy/10 text-aims-navy items-center justify-center text-xs font-bold shrink-0">3</span>
                Classroom Conduct & Streaming Ethics
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Live classrooms operate under strict authentication checks. Students must join Jitsi lectures using their authenticated profile name.
              </p>
              
              <div className="p-5 rounded-2xl border border-red-200/50 bg-red-50/40 text-red-900 flex gap-4">
                <AlertOctagon className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-extrabold text-sm block">Strict Anti-Piracy Policy</span>
                  <span className="text-xs text-red-800/90 leading-relaxed block font-medium">
                    Any attempt to extract YouTube live iframe parameters, right-click and bypass our video overlays, share live classroom password credentials, or record and distribute lectures without written authorization will result in an immediate permanent ban and legal intellectual property claims.
                  </span>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span className="flex h-7 w-7 rounded-lg bg-aims-navy/10 text-aims-navy items-center justify-center text-xs font-bold shrink-0">4</span>
                Intellectual Property
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                All platform components, database structures, UI templates, graphics, trademarks, course syllabus notes, and video assets are the sole property of AIMS. No portion of this site may be duplicated or reverse-engineered.
              </p>
            </div>

            {/* Section 5 */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span className="flex h-7 w-7 rounded-lg bg-aims-navy/10 text-aims-navy items-center justify-center text-xs font-bold shrink-0">5</span>
                Limitations & Warranties
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                We make reasonable efforts to maintain 24/7 server uptime. However, we are not liable for occasional connection drops, ISP outages during live broadcasts, or storage interruptions. All courses are delivered on an "as-is" educational baseline.
              </p>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
