import Link from "next/link";
import { Logo } from "@/components/logo";
import {
  Mail,
  Phone,
  MapPin,
  Youtube,
  Instagram,
  Heart,
  GraduationCap,
  BookOpen,
  Users,
  ArrowUpRight,
  MessageCircle,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappMessage = encodeURIComponent(
    "Hello RG Tech, I saw your work on the AIMS Salipur website and would like to connect regarding website development / tech services!"
  );
  const rgTechWhatsAppUrl = `https://wa.me/916370810878?text=${whatsappMessage}`;

  return (
    <footer className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Decorative ambient gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-aims-navy/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-aims-green/15 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 pt-10 pb-8 sm:pt-16 sm:pb-10">
        {/* Main Footer Grid: 1 col on xs mobile (<640px) or 2 cols on mobile, 2 cols on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-8 lg:gap-10">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3.5 sm:mb-5">
              <div className="bg-white rounded-2xl p-1.5 shadow-xl ring-2 sm:ring-4 ring-white/10 shrink-0">
                <Logo showText={false} size="sm" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  AIMS Salipur
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Odisha&apos;s #1 Academy
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 max-w-sm">
              Empowering nursing aspirants in Odisha through top-tier recruitment
              and entrance coaching with proven results.
            </p>

            {/* Social Icons with comfortable 40px+ touch targets */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <a
                href="https://www.youtube.com/@AIMS_Official"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-white/10 hover:bg-red-500 active:scale-95 flex items-center justify-center transition-all duration-200"
                aria-label="YouTube Channel"
              >
                <Youtube className="h-5 w-5 text-white" />
              </a>
              <a
                href="https://instagram.com/aims_medical"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-white/10 hover:bg-pink-500 active:scale-95 flex items-center justify-center transition-all duration-200"
                aria-label="Instagram Profile"
              >
                <Instagram className="h-5 w-5 text-white" />
              </a>
              <a
                href="https://wa.me/919437959054"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-white/10 hover:bg-emerald-500 active:scale-95 flex items-center justify-center transition-all duration-200"
                aria-label="WhatsApp Contact"
              >
                <Phone className="h-5 w-5 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links & Programs subgrid on mobile */}
          <div className="grid grid-cols-2 sm:col-span-2 lg:col-span-2 gap-4 sm:gap-8">
            {/* Quick Links */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200 mb-3 sm:mb-4">
                Quick Links
              </h4>
              <ul className="space-y-1 sm:space-y-2">
                {[
                  { name: "Home", href: "/#home", icon: ArrowUpRight },
                  { name: "Programs", href: "/#courses", icon: BookOpen },
                  { name: "About Us", href: "/#about", icon: Users },
                  { name: "Contact", href: "/#contact", icon: MapPin },
                  { name: "Apply Now", href: "/signup", icon: GraduationCap },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="group inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors py-1.5 sm:py-1 active:text-aims-green"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Programs */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200 mb-3 sm:mb-4">
                Programs
              </h4>
              <ul className="space-y-1 sm:space-y-2">
                {[
                  "OSSSC Nursing Officer",
                  "AIIMS NORCET",
                  "ESIC Nursing Officer",
                  "MNS Entrance Prep",
                  "RRB Nursing Prep",
                  "OJEE Nursing",
                  "Lecturer & Tutor",
                ].map((program) => (
                  <li key={program}>
                    <Link
                      href="/#courses"
                      className="group inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors py-1.5 sm:py-1 active:text-aims-green"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-aims-green/60 group-hover:bg-aims-green group-hover:scale-125 transition-all shrink-0" />
                      <span className="truncate">{program}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200 mb-3 sm:mb-4">
              Get In Touch
            </h4>
            <ul className="space-y-3 sm:space-y-3.5">
              <li>
                <a
                  href="mailto:aimssalipur@gmail.com"
                  className="group flex items-start gap-2.5 sm:gap-3 text-slate-400 hover:text-white transition-colors"
                >
                  <div className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center text-aims-green group-hover:bg-aims-green group-hover:text-white transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Email Us
                    </p>
                    <p className="text-xs sm:text-sm text-slate-300 group-hover:text-white truncate">
                      aimssalipur@gmail.com
                    </p>
                  </div>
                </a>
              </li>

              <li>
                <a
                  href="tel:+919437959054"
                  className="group flex items-start gap-2.5 sm:gap-3 text-slate-400 hover:text-white transition-colors"
                >
                  <div className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center text-aims-green group-hover:bg-aims-green group-hover:text-white transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Call / WhatsApp
                    </p>
                    <p className="text-xs sm:text-sm text-slate-300 group-hover:text-white font-medium">
                      +91 94379 59054
                    </p>
                  </div>
                </a>
              </li>

              <li>
                <div className="flex items-start gap-2.5 sm:gap-3 text-slate-400">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center text-aims-green">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Campus Location
                    </p>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Salipur, Cuttack District, Odisha - 754202
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Perfect on all screens (320px up to desktop) */}
        <div className="mt-10 sm:mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          {/* Copyright */}
          <p className="flex items-center justify-center gap-1.5 order-2 sm:order-1 text-center sm:text-left text-[11px] sm:text-xs">
            © {currentYear} AIMS Salipur. All rights reserved. Made with
            <Heart className="h-3.5 w-3.5 text-red-400 fill-red-400 shrink-0" />
            in Odisha
          </p>

          {/* Small, refined Developer Credit */}
          <a
            href={rgTechWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat with RG Tech on WhatsApp (+91 63708 10878)"
            className="order-1 sm:order-2 group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Developed by</span>
            <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 group-hover:from-emerald-300 group-hover:to-cyan-300 transition-all tracking-wide">
              RG TECH
            </span>
            <MessageCircle className="h-3 w-3 text-emerald-400/80 group-hover:text-emerald-400 transition-colors" />
          </a>

          {/* Legal Links */}
          <div className="flex items-center justify-center gap-5 order-3 text-[11px] sm:text-xs">
            <Link
              href="/privacy"
              className="py-1 hover:text-slate-200 transition-colors active:text-aims-green"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-700">·</span>
            <Link
              href="/terms"
              className="py-1 hover:text-slate-200 transition-colors active:text-aims-green"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
