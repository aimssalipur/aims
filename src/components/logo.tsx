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
    sm: { logo: 56, text: "text-base" },
    md: { logo: 72, text: "text-lg sm:text-xl" },
    lg: { logo: 108, text: "text-2xl sm:text-3xl" },
  }

  return (
    <Link href="/" className={cn("flex items-center gap-4 group", className)}>
      <div className="relative transition-transform duration-300 group-hover:scale-105 shrink-0">
        <Image
          src="/logo.png"
          alt="AIMS - Achyutanand Institute of Medical Science Logo"
          width={sizes[size].logo}
          height={sizes[size].logo}
          className="drop-shadow-lg object-contain"
          priority
          quality={100}
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn("font-extrabold text-aims-navy tracking-tight", sizes[size].text)}>
            AIMS
          </span>
          <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider leading-tight mt-0.5">
            Achyutanand Institute<br />of Medical Science
          </span>
        </div>
      )}
    </Link>
  )
}
