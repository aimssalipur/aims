"use client";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";
import { GraduationCap, BookOpen, ShieldCheck, DollarSign } from "lucide-react";

type Style = {
  card: string;
  info: string;
  chip: string;
  dot: string;
  icon: string;
  label: string;
  desc: string;
};

const STYLES: Record<UserRole, Style> = {
  student: {
    card: "bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white border-transparent shadow-lg shadow-[#1E3A8A]/25",
    info: "bg-[#1E3A8A]/[0.05] border-[#1E3A8A]/15",
    chip: "bg-[#1E3A8A]/10 text-[#1E3A8A]",
    dot: "bg-[#1E3A8A]",
    icon: "text-[#1E3A8A]",
    label: "text-[#1E3A8A]",
    desc: "text-[#1E3A8A]/70",
  },
  instructor: {
    card: "bg-gradient-to-br from-[#059669] to-[#10B981] text-white border-transparent shadow-lg shadow-[#059669]/25",
    info: "bg-[#059669]/[0.05] border-[#059669]/15",
    chip: "bg-[#059669]/10 text-[#059669]",
    dot: "bg-[#059669]",
    icon: "text-[#059669]",
    label: "text-[#059669]",
    desc: "text-[#059669]/70",
  },
  accountant: {
    card: "bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white border-transparent shadow-lg shadow-[#4F46E5]/25",
    info: "bg-[#4F46E5]/[0.05] border-[#4F46E5]/15",
    chip: "bg-[#4F46E5]/10 text-[#4F46E5]",
    dot: "bg-[#4F46E5]",
    icon: "text-[#4F46E5]",
    label: "text-[#4F46E5]",
    desc: "text-[#4F46E5]/70",
  },
  admin: {
    card: "bg-gradient-to-br from-[#F59E0B] to-[#F97316] text-white border-transparent shadow-lg shadow-[#F59E0B]/25",
    info: "bg-[#F59E0B]/[0.07] border-[#F59E0B]/20",
    chip: "bg-[#F59E0B]/12 text-[#B45309]",
    dot: "bg-[#F59E0B]",
    icon: "text-[#B45309]",
    label: "text-[#B45309]",
    desc: "text-[#B45309]/70",
  },
};

const ITEMS: { id: UserRole; label: string; desc: string; icon: any }[] = [
  { id: "student", label: "Student", desc: "Courses, progress & announcements", icon: GraduationCap },
  { id: "instructor", label: "Instructor", desc: "Courses, students & updates", icon: BookOpen },
  { id: "accountant", label: "Accountant", desc: "Ledgers, student fees & audits", icon: DollarSign },
  { id: "admin", label: "Administrator", desc: "Analytics, users & settings", icon: ShieldCheck },
];

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  className?: string;
}

export function RoleSelector({ selectedRole, onRoleChange, className }: RoleSelectorProps) {
  const sel = STYLES[selectedRole];
  const active = ITEMS.find((r) => r.id === selectedRole)!;

  const pick = (id: UserRole) => {
    onRoleChange(id);
  };

  return (
    <div className={cn("w-full space-y-2.5", className)}>
      {/* 3 cards row */}
      <div className="flex w-full gap-2 sm:gap-2.5">
        {ITEMS.map((r) => {
          const s = STYLES[r.id];
          const Icon = r.icon;
          const on = selectedRole === r.id;

          return (
            <div
              key={r.id}
              onClick={() => pick(r.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") pick(r.id);
              }}
              role="radio"
              tabIndex={0}
              aria-checked={on}
              className={cn(
                "relative flex-1 shrink-0 flex flex-col items-center justify-center text-center",
                "cursor-pointer select-none rounded-2xl border-2 px-1.5 sm:px-2 py-2.5 sm:py-3",
                "transition-all duration-200 ease-out outline-none",
                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E3A8A]/40",
                "hover:-translate-y-0.5 hover:shadow-[0_2px_10px_rgba(15,23,42,0.08)]",
                on ? `${s.card} -translate-y-0.5 z-10` : "bg-white border-slate-200 text-slate-600"
              )}
            >
              <div
                className={cn(
                  "h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center mb-1",
                  on ? "bg-white/20 text-white" : s.chip
                )}
              >
                <Icon
                  className={cn("h-4 w-4 sm:h-[18px] sm:w-[18px]", on ? "text-white" : s.icon)}
                  strokeWidth={2.2}
                />
              </div>
              <div className={cn("font-bold text-[11px] sm:text-xs leading-tight mb-0.5", on ? "text-white" : "text-slate-800")}>
                {r.label}
              </div>
              <div className="text-[9px] sm:text-[10px] leading-tight line-clamp-2 max-w-full px-0.5">
                <span className={cn(on ? "text-white/85" : "text-slate-500")}>{r.desc}</span>
              </div>
              {on && (
                <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <svg className={cn("h-2.5 w-2.5", s.icon)} viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* info bar */}
      <div className={cn("flex items-center gap-2.5 px-3 sm:px-3.5 py-2.5 rounded-2xl border", sel.info)}>
        <div className={cn("h-7 w-7 shrink-0 rounded-lg flex items-center justify-center", sel.chip)}>
          <active.icon className="h-4 w-4" strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs sm:text-[13px] font-extrabold text-slate-900 leading-tight">
            Signing in as {active.label}
          </div>
          <div className="text-[11px] sm:text-xs text-slate-500 leading-snug truncate">{active.desc}</div>
        </div>
        <div className={cn("h-2 w-2 shrink-0 rounded-full animate-pulse", sel.dot)} />
      </div>
    </div>
  );
}
