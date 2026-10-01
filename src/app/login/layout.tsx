import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Portal Login",
  description:
    "Sign in to the AIMS Salipur learning portal to access live classes, lecture video discussions, and syllabus study material.",
  alternates: {
    canonical: `${siteConfig.url}/login`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Student & Faculty Portal Login | AIMS Salipur",
    description:
      "Access live classes, study material, and exam schedules on the AIMS Salipur learning portal.",
    url: `${siteConfig.url}/login`,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
