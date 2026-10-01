import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { PagePreloader } from "@/components/page-preloader"
import { PwaInstallPrompt } from "@/components/pwa-install-prompt"
import { JsonLd } from "@/components/seo/json-ld"

import { siteConfig } from "@/lib/site-config"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const viewport: Viewport = {
  themeColor: "#1E3A8A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: siteConfig.url,
  },
  title: {
    default: "AIMS Salipur - Odisha's Premier Nursing Coaching Academy",
    template: "%s | AIMS Salipur",
  },
  description:
    "AIMS Salipur (Achyutanand Institute of Medical Science) is Odisha's premier nursing coaching academy in Salipur, Cuttack. High-yield classroom & online guidance for OSSSC Nursing Officer, AIIMS NORCET, ESIC, MNS, RRB, and OJEE exams.",
  keywords: [
    "Nursing coaching in Salipur",
    "Nursing coaching in Cuttack Odisha",
    "OSSSC Nursing Officer coaching",
    "AIIMS NORCET preparation Odisha",
    "ESIC Nursing Officer coaching",
    "MNS nursing exam preparation",
    "RRB Nursing Superintendent coaching",
    "OJEE Nursing entrance coaching",
    "ANM GNM Coaching",
    "B.Sc Nursing Coaching",
    "AIMS Salipur",
    "Achyutanand Institute of Medical Science",
    "Salipur Nursing Academy",
    "Nursing Officer recruitment coaching",
  ],
  authors: [{ name: "AIMS Salipur", url: siteConfig.url }],
  creator: "AIMS Salipur",
  publisher: "AIMS Salipur",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AIMS Salipur",
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google9f168a0707ff8051",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: "AIMS Salipur",
    title: "AIMS Salipur - Odisha's Premier Nursing Coaching Academy",
    description:
      "Odisha's premier nursing coaching academy in Salipur, Cuttack. Top-ranked coaching for OSSSC Nursing Officer, AIIMS NORCET, ESIC, MNS, RRB, and OJEE recruitments.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "AIMS Salipur - Achyutanand Institute of Medical Science Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIMS Salipur - Odisha's Premier Nursing Coaching Academy",
    description:
      "Odisha's premier nursing coaching academy in Salipur, Cuttack. Expert guidance for OSSSC, AIIMS NORCET, ESIC, MNS, and RRB exams.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <JsonLd />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="AIMS Salipur" />
        <meta name="apple-mobile-web-app-title" content="AIMS Salipur" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-white`}>
        <PagePreloader />
        {children}
        <PwaInstallPrompt />
        <Toaster />
      </body>
    </html>
  )
}


