import { siteConfig } from "@/lib/site-config";

export function JsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "LocalBusiness"],
    "@id": `${siteConfig.url}/#organization`,
    "name": siteConfig.name,
    "alternateName": [
      siteConfig.legalName,
      siteConfig.alternateName,
      "AIMS Nursing Academy Salipur"
    ],
    "legalName": siteConfig.legalName,
    "url": siteConfig.url,
    "logo": `${siteConfig.url}/logo.png`,
    "image": `${siteConfig.url}/logo.png`,
    "description":
      "AIMS Salipur (Achyutanand Institute of Medical Science) is Odisha's premier nursing coaching academy in Salipur, Cuttack. We specialize in high-yield preparation for OSSSC Nursing Officer, AIIMS NORCET, ESIC, MNS, and RRB recruitments.",
    "telephone": siteConfig.phoneRaw,
    "email": siteConfig.email,
    "priceRange": "₹₹",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": siteConfig.address.street,
      "addressLocality": siteConfig.address.city,
      "addressRegion": siteConfig.address.state,
      "postalCode": siteConfig.address.postalCode,
      "addressCountry": siteConfig.address.country
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": siteConfig.geo.latitude,
      "longitude": siteConfig.geo.longitude
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "08:00",
        "closes": "19:00"
      }
    ],
    "sameAs": [
      siteConfig.social.facebook,
      siteConfig.social.instagram,
      siteConfig.social.youtube
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteConfig.url
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Nursing Programs",
        "item": `${siteConfig.url}/#courses`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Admissions",
        "item": `${siteConfig.url}/signup`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Contact & Campus",
        "item": `${siteConfig.url}/#contact`
      }
    ]
  };

  const coursesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "Course",
        "position": 1,
        "name": "OSSSC Nursing Officer Exam Coaching",
        "description":
          "Targeted preparation batch for Odisha Sub-Ordinate Staff Selection Commission (OSSSC) Nursing Officer recruitment. Covers Medical Surgical Nursing, Community Health, OBG, Pediatric, HSC Arithmetic, Reasoning, and Odisha GK.",
        "provider": {
          "@type": "EducationalOrganization",
          "name": siteConfig.name,
          "sameAs": siteConfig.url
        },
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": ["Blended", "Onsite"],
          "location": {
            "@type": "Place",
            "name": "AIMS Salipur Campus",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": siteConfig.address.city,
              "addressRegion": siteConfig.address.state,
              "postalCode": siteConfig.address.postalCode,
              "addressCountry": siteConfig.address.country
            }
          }
        }
      },
      {
        "@type": "Course",
        "position": 2,
        "name": "AIIMS NORCET Coaching",
        "description":
          "High-yield coaching for Nursing Officer Recruitment Common Eligibility Test (NORCET) conducted by AIIMS New Delhi. In-depth clinical scenarios, CBT mock exams, and national syllabus coverage.",
        "provider": {
          "@type": "EducationalOrganization",
          "name": siteConfig.name,
          "sameAs": siteConfig.url
        },
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": ["Blended", "Onsite"],
          "location": {
            "@type": "Place",
            "name": "AIMS Salipur Campus",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": siteConfig.address.city,
              "addressRegion": siteConfig.address.state,
              "postalCode": siteConfig.address.postalCode,
              "addressCountry": siteConfig.address.country
            }
          }
        }
      },
      {
        "@type": "Course",
        "position": 3,
        "name": "ESIC Nursing Officer Coaching",
        "description":
          "Specialized coaching for Employees State Insurance Corporation (ESIC) Staff Nurse recruitments. Rigorous practice for nursing fundamentals, pharmacology, and aptitude sections.",
        "provider": {
          "@type": "EducationalOrganization",
          "name": siteConfig.name,
          "sameAs": siteConfig.url
        },
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": ["Blended", "Onsite"],
          "location": {
            "@type": "Place",
            "name": "AIMS Salipur Campus",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": siteConfig.address.city,
              "addressRegion": siteConfig.address.state,
              "postalCode": siteConfig.address.postalCode,
              "addressCountry": siteConfig.address.country
            }
          }
        }
      },
      {
        "@type": "Course",
        "position": 4,
        "name": "Military Nursing Services (MNS) Entrance Prep",
        "description":
          "Dedicated preparation program for female nursing candidates targeting Indian Armed Forces Military Nursing Service (MNS) B.Sc. Nursing entrance examinations.",
        "provider": {
          "@type": "EducationalOrganization",
          "name": siteConfig.name,
          "sameAs": siteConfig.url
        },
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": ["Blended", "Onsite"],
          "location": {
            "@type": "Place",
            "name": "AIMS Salipur Campus",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": siteConfig.address.city,
              "addressRegion": siteConfig.address.state,
              "postalCode": siteConfig.address.postalCode,
              "addressCountry": siteConfig.address.country
            }
          }
        }
      },
      {
        "@type": "Course",
        "position": 5,
        "name": "RRB Railway Nursing Superintendent Prep",
        "description":
          "Complete syllabus training for Railway Recruitment Board (RRB) Staff Nurse & Nursing Superintendent vacancies, covering professional nursing topics, general awareness, and arithmetic.",
        "provider": {
          "@type": "EducationalOrganization",
          "name": siteConfig.name,
          "sameAs": siteConfig.url
        },
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": ["Blended", "Onsite"],
          "location": {
            "@type": "Place",
            "name": "AIMS Salipur Campus",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": siteConfig.address.city,
              "addressRegion": siteConfig.address.state,
              "postalCode": siteConfig.address.postalCode,
              "addressCountry": siteConfig.address.country
            }
          }
        }
      },
      {
        "@type": "Course",
        "position": 6,
        "name": "OJEE Nursing Entrance Preparation",
        "description":
          "Targeted coaching for Odisha Joint Entrance Examination (OJEE) for admission into ANM, GNM, Basic B.Sc. Nursing, and Post Basic B.Sc. Nursing government and private colleges in Odisha.",
        "provider": {
          "@type": "EducationalOrganization",
          "name": siteConfig.name,
          "sameAs": siteConfig.url
        },
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": ["Blended", "Onsite"],
          "location": {
            "@type": "Place",
            "name": "AIMS Salipur Campus",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": siteConfig.address.city,
              "addressRegion": siteConfig.address.state,
              "postalCode": siteConfig.address.postalCode,
              "addressCountry": siteConfig.address.country
            }
          }
        }
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Which nursing exams does AIMS Salipur provide coaching for?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "AIMS Salipur delivers premier coaching for OSSSC Nursing Officer, AIIMS NORCET, ESIC Staff Nurse, Military Nursing Services (MNS), RRB Nursing Superintendent, OJEE Nursing Entrance, CHO (Community Health Officer), and Nursing Lecturer/Tutor examinations."
        }
      },
      {
        "@type": "Question",
        "name": "Where is AIMS Salipur located in Odisha?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "AIMS Salipur (Achyutanand Institute of Medical Science) is located in Salipur, Cuttack District, Odisha - 754202. The campus is accessible to students across Cuttack, Kendrapara, Jajpur, and Jagatsinghpur districts."
        }
      },
      {
        "@type": "Question",
        "name": "How can students apply for nursing coaching batches at AIMS Salipur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "Aspirants can apply online directly through the admissions page (/signup), reach out to admissions counselors on WhatsApp at +91 94379 59054, or visit the campus in Salipur for free academic counseling."
        }
      },
      {
        "@type": "Question",
        "name": "Does AIMS Salipur offer live classes and study materials?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "Yes, enrolled students receive classroom instruction, syllabus study notes, live interactive video classes, recorded video revisions, and weekly CBT mock test series tailored to the latest government recruitment exam patterns."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(coursesSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
