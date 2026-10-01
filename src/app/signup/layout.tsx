import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Online Admission & Course Registration",
  description:
    "Apply online for OSSSC Nursing Officer, AIIMS NORCET, ESIC, MNS, and RRB coaching batches at AIMS Salipur, Cuttack, Odisha.",
  alternates: {
    canonical: `${siteConfig.url}/signup`,
  },
  openGraph: {
    title: "Online Admission & Course Registration | AIMS Salipur",
    description:
      "Enroll in Odisha's premier nursing recruitment coaching academy. Target batches for OSSSC, AIIMS NORCET, ESIC, and MNS.",
    url: `${siteConfig.url}/signup`,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
