import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { PagePreloader } from "@/components/page-preloader"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default:
      "AIMS Salipur - Odisha's Premier Nursing Coaching Academy",
    template: "%s | AIMS Salipur",
  },
  description:
    "AIMS Salipur (Achyutanand Institute of Medical Science) is Odisha's leading coaching academy for Nursing Officer recruitments & entrance exams. High-yield guidance for OSSSC, AIIMS NORCET, ESIC, MNS, RRB, and OJEE.",
  keywords: [
    "Nursing Officer Coaching",
    "OSSSC Nursing Officer Prep",
    "AIIMS NORCET Coaching",
    "ESIC Nursing Officer Prep",
    "MNS Entrance Exam",
    "RRB Staff Nurse Prep",
    "OJEE Nursing Entrance",
    "ANM GNM Coaching",
    "B.Sc Nursing Coaching",
    "AIMS Salipur",
    "Achyutanand Institute of Medical Science",
    "Salipur Nursing Academy",
  ],
  authors: [{ name: "AIMS Salipur" }],
  creator: "AIMS Salipur",
  publisher: "AIMS Salipur",
  metadataBase: new URL("https://aimssalipur.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://aimssalipur.com",
    siteName: "AIMS Salipur",
    title:
      "AIMS Salipur - Odisha's Premier Nursing Coaching Academy",
    description:
      "Empowering nursing professionals to crack OSSSC, NORCET, ESIC, MNS, RRB, and OJEE exams.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "AIMS Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "AIMS Salipur - Odisha's Premier Nursing Coaching Academy",
    description:
      "Empowering nursing professionals to crack OSSSC, NORCET, ESIC, MNS, RRB, and OJEE exams.",
    images: ["/logo.png"],
  },
  themeColor: "#1E3A8A",
  icons: {
    icon: [
      { url: "/logo.png" },
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
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-white`}>
        <PagePreloader />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
