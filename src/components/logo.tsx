import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizes = {
    sm: { logo: 56, text: "text-base sm:text-lg", sub: "text-[10px]" },
    md: { logo: 76, text: "text-xl sm:text-2xl", sub: "text-xs" },
    lg: { logo: 110, text: "text-2xl sm:text-3xl", sub: "text-sm" },
  }

  return (
    <Link href="/" className={cn("flex items-center gap-3.5 group select-none", className)}>
      <div className="relative transition-transform duration-300 group-hover:scale-105 shrink-0 rounded-full bg-white shadow-md ring-1 ring-slate-200/90 p-0.5 flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="AIMS - Achyutanand Institute of Medical Science Logo"
          width={sizes[size].logo}
          height={sizes[size].logo}
          className="rounded-full object-contain drop-shadow-sm"
          priority
          quality={100}
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn("font-black text-aims-navy tracking-tight", sizes[size].text)}>
            AIMS
          </span>
          <span className={cn("text-slate-600 font-bold uppercase tracking-wider leading-tight mt-0.5", sizes[size].sub)}>
            Achyutananda Institute<br />of Medical Science
          </span>
        </div>
      )}
    </Link>
  )
}
