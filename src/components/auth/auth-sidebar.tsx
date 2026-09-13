import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/logo";
import {
  GraduationCap,
  BookOpenCheck,
  HeartHandshake,
  ShieldCheck,
  Quote,
  Users,
  Award,
} from "lucide-react";

export function AuthSidebar() {
  return (
    <div className="relative hidden lg:flex lg:flex-col lg:justify-between bg-aims-gradient text-white overflow-hidden min-h-screen p-10 xl:p-14 w-[48%] xl:w-[45%]">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-aims-green/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-aims-gold/20 rounded-full blur-2xl animate-pulse" />

      {/* Logo */}
      <div className="relative z-10">
        <div className="bg-white/95 backdrop-blur rounded-2xl p-2.5 inline-block shadow-2xl ring-4 ring-white/30">
          <Logo showText={true} size="md" />
        </div>
      </div>

      {/* Middle content */}
      <div className="relative z-10 max-w-md space-y-10">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur border border-white/20 mb-6">
            <Award className="h-4 w-4 text-amber-300" />
            <span className="text-sm font-bold uppercase tracking-wider">
              INC Approved Institute
            </span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.1] mb-5 tracking-tight">
            Welcome to AIMS,
            <br />
            Where <span className="text-aims-gold">Careers Begin</span>
          </h1>
          <p className="text-white/85 text-lg leading-relaxed">
            Join Odisha's premier coaching academy for Nursing Officer recruitments & entrance exams. Shaping compassionate leaders since 16 July 2026.
          </p>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: GraduationCap, label: "95% Placement" },
            { icon: Users, label: "500+ Students" },
            { icon: BookOpenCheck, label: "7 Exam Batches" },
            { icon: HeartHandshake, label: "Expert Mentors" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white/10 backdrop-blur border border-white/15 hover:bg-white/15 transition-colors"
              >
                <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="text-sm font-bold">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Testimonial */}
        <div className="relative p-6 rounded-2xl bg-white/10 backdrop-blur border border-white/15">
          <Quote className="absolute top-4 right-5 h-10 w-10 text-white/20 -scale-x-100" />
          <div className="flex items-center gap-2 mb-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-3.5 w-3.5 text-amber-400"
              >★</div>
            ))}
          </div>
          <p className="text-white/90 leading-relaxed mb-4">
            AIMS gave me everything I needed to succeed — excellent training,
            caring faculty, and placements at top hospitals. My life changed
            completely after joining.
          </p>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-aims-gold to-aims-green rounded-full blur" />
              <Image
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces"
                alt=""
                width={44}
                height={44}
                className="relative h-11 w-11 rounded-full object-cover ring-2 ring-white"
              />
            </div>
            <div>
              <div className="font-extrabold text-sm">Riya Sahu</div>
              <div className="text-xs text-white/70 font-semibold">
                Staff Nurse, Apollo Hospitals
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between gap-4 text-sm text-white/75">
        <p>© {new Date().getFullYear()} AIMS Salipur</p>
        <div className="flex items-center gap-5">
          <Link href="#" className="hover:text-white transition-colors font-semibold">
            Privacy
          </Link>
          <Link href="#" className="hover:text-white transition-colors font-semibold">
            Terms
          </Link>
        </div>
      </div>
    </div>
  );
}
