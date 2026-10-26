"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

/** Fires PageView on in-app route changes. Base pixel snippet lives in root layout <head>. */
export function MetaPixel() {
  const pathname = usePathname()
  const isFirstLoad = useRef(true)

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      return
    }
    if (typeof window.fbq === "function") {
      window.fbq("track", "PageView")
    }
  }, [pathname])

  return null
}
