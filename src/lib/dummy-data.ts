import type { Course, Announcement, Profile, Enrollment } from "@/lib/types";

export const dummyInstructors: Profile[] = [
  {
    id: "inst_1",
    role: "instructor",
    full_name: "Dr. Priyanka Sharma",
    email: "priyanka.sharma@aims.edu",
    whatsapp: "+91-98765-43210",
    avatar_url:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=faces",
    created_at: new Date().toISOString(),
    active: true,
  },
  {
    id: "inst_2",
    role: "instructor",
    full_name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@aims.edu",
    whatsapp: "+91-98765-43211",
    avatar_url:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=faces",
    created_at: new Date().toISOString(),
    active: true,
  },
  {
    id: "inst_3",
    role: "instructor",
    full_name: "Dr. Anjali Gupta",
    email: "anjali.gupta@aims.edu",
    whatsapp: "+91-98765-43212",
    avatar_url:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=faces",
    created_at: new Date().toISOString(),
    active: true,
  },
  {
    id: "inst_4",
    role: "instructor",
    full_name: "Prof. Sunita Devi",
    email: "sunita.devi@aims.edu",
    whatsapp: "+91-98765-43213",
    avatar_url:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop&crop=faces",
    created_at: new Date().toISOString(),
    active: true,
  },
  {
    id: "inst_5",
    role: "instructor",
    full_name: "Dr. Manoj Patnaik",
    email: "manoj.patnaik@aims.edu",
    whatsapp: "+91-98765-43214",
    avatar_url:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=faces",
    created_at: new Date().toISOString(),
    active: true,
  },
];

export const dummyCourses: Course[] = [
  {
    id: "c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1",
    title: "OSSSC Nursing Officer Exam Coaching",
    description: "Exclusively designed preparation course for the OSSSC Nursing Officer recruitment exam, covering core GNM/B.Sc. Nursing subjects, HSC-level Arithmetic, Reasoning, General English, Odisha GK, and Computer basics.",
    instructor_id: "inst_1",
    thumbnail_url: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&h=600&fit=crop",
    youtube_playlist: "https://www.youtube.com/@AIMS_Official",
    created_at: new Date().toISOString(),
    instructor: dummyInstructors[0],
    exam_pattern: {
      total_marks: "100 Marks",
      total_questions: "100 Questions",
      duration: "2 Hours",
      negative_marking: "No negative marking",
      type: "MCQ - Objective (CBT)",
      sections: [
        {
          name: "Nursing Subjects",
          marks: "60 Marks",
          questions: "60 Questions",
          topics: [
            "Medical Surgical Nursing - Diseases, procedures, instruments",
            "Community Health Nursing - National programs, immunization",
            "OBG Nursing - Pregnancy, labor, newborn care",
            "Child Health Nursing - Pediatric diseases, nutrition",
            "Mental Health Nursing - Psychiatric disorders",
            "Fundamentals of Nursing - Basic procedures, infection control",
            "Pharmacology - Drugs, doses, side effects",
            "Anatomy & Physiology"
          ]
        },
        {
          name: "Arithmetic + Math",
          marks: "15 Marks",
          questions: "15 Questions",
          topics: ["Percentage", "Ratio & Proportion", "Average", "Profit-Loss", "Time & Work", "Simplification"]
        },
        {
          name: "Reasoning",
          marks: "10 Marks",
          questions: "10 Questions",
          topics: ["Coding-Decoding", "Blood Relation", "Series", "Analogy", "Direction Sense"]
        },
        {
          name: "General English",
          marks: "5 Marks",
          questions: "5 Questions",
          topics: ["Grammar", "Synonyms & Antonyms", "One Word Substitution", "Spelling", "Comprehension"]
        },
        {
          name: "General Knowledge",
          marks: "5 Marks",
          questions: "5 Questions",
          topics: ["Odisha specific GK", "Current Affairs", "Awards & Schemes", "Capitals"]
        },
        {
          name: "Computer Knowledge",
          marks: "5 Marks",
          questions: "5 Questions",
          topics: ["Basics of Computer", "MS Office", "Internet & Email"]
        }
      ]
    }
  },
  {
    id: "c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2",
    title: "AIIMS NORCET Coaching",
    description: "High-yield preparation program for the Nursing Officer Recruitment Common Eligibility Test (NORCET) conducted by AIIMS New Delhi, featuring 150 CBT MCQs across general aptitude and nursing streams.",
    instructor_id: "inst_2",
    thumbnail_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&h=600&fit=crop",
    youtube_playlist: "https://www.youtube.com/@AIMS_Official",
    created_at: new Date().toISOString(),
    instructor: dummyInstructors[1],
    exam_pattern: {
      total_marks: "150 Marks",
      total_questions: "150 Questions",
      duration: "3 Hours",
      negative_marking: "1/3 mark deducted for each wrong answer",
      type: "CBT - Computer Based Test, MCQs",
      sections: [
        {
          name: "Part 1: General Section",
          marks: "50 Marks",
          questions: "50 Questions",
          subsections: [
            { name: "General Knowledge", questions: "10 Q", topics: ["Current affairs", "History & Geography", "Odisha + India GK"] },
            { name: "General Aptitude & Reasoning", questions: "10 Q", topics: ["Number series", "Blood relation", "Coding", "Analogy"] },
            { name: "Computer Knowledge", questions: "10 Q", topics: ["Basics", "MS Office", "Internet", "AIIMS systems"] },
            { name: "General English", questions: "10 Q", topics: ["Grammar", "Vocabulary", "Comprehension", "Error detection"] },
            { name: "Quantitative Aptitude", questions: "10 Q", topics: ["Percentage", "Average", "Ratio", "Time & Work", "HCF-LCM"] }
          ]
        },
        {
          name: "Part 2: Nursing Subjects",
          marks: "100 Marks",
          questions: "100 Questions",
          subsections: [
            { name: "Medical Surgical Nursing", questions: "20 Q", topics: ["Systemic diseases", "Surgical nursing protocols"] },
            { name: "OBG Nursing", questions: "15 Q", topics: ["Antenatal care", "Intranatal & postnatal protocols"] },
            { name: "Community Health Nursing", questions: "15 Q", topics: ["Epidemiology", "National programs"] },
            { name: "Child Health / Mental Health Nursing", questions: "20 Q", topics: ["Pediatrics (10 Q)", "Psychiatry (10 Q)"] },
            { name: "Fundamentals of Nursing", questions: "10 Q", topics: ["Clinical skills", "Infection control"] },
            { name: "Basic Sciences & Specialty", questions: "20 Q", topics: ["Anatomy & Physiology (5 Q)", "Pharmacology (5 Q)", "Nutrition (5 Q)", "Research & Mgmt (5 Q)"] }
          ]
        }
      ]
    }
  },
  {
    id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
    title: "ESIC Nursing Officer Coaching",
    description: "Complete preparation for the Employees' State Insurance Corporation (ESIC) Nursing Officer CBT exam, targeting core GNM/B.Sc. nursing topics and general sections.",
    instructor_id: "inst_3",
    thumbnail_url: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=800&h=600&fit=crop",
    youtube_playlist: "https://www.youtube.com/@AIMS_Official",
    created_at: new Date().toISOString(),
    instructor: dummyInstructors[2],
    exam_pattern: {
      total_marks: "150 Marks",
      total_questions: "150 Questions",
      duration: "2 Hours",
      negative_marking: "0.25 marks deducted for each wrong answer",
      type: "CBT - Computer Based Test, MCQs (English + Hindi)",
      sections: [
        {
          name: "Part A: General Section",
          marks: "50 Marks",
          questions: "50 Questions",
          subsections: [
            { name: "General Awareness", questions: "10 Q", topics: ["Current affairs", "ESIC schemes", "Health schemes"] },
            { name: "Reasoning Ability", questions: "10 Q", topics: ["Coding", "Blood relation", "Series", "Analogy"] },
            { name: "General English", questions: "10 Q", topics: ["Grammar", "Vocabulary", "Synonyms", "Comprehension"] },
            { name: "Quantitative Aptitude", questions: "10 Q", topics: ["Percentage", "Average", "Profit-Loss", "Time & Work"] },
            { name: "Computer Knowledge", questions: "10 Q", topics: ["Basic Computer", "MS Office", "Internet"] }
          ]
        },
        {
          name: "Part B: Nursing Subject",
          marks: "100 Marks",
          questions: "100 Questions",
          subsections: [
            { name: "Medical Surgical Nursing", questions: "25 Q", topics: ["Disease conditions", "Nursing management"] },
            { name: "OBG + Child Health Nursing", questions: "20 Q", topics: ["Midwifery", "Pediatrics"] },
            { name: "Community Health Nursing", questions: "15 Q", topics: ["Primary healthcare", "Public health programs"] },
            { name: "Mental Health Nursing", questions: "10 Q", topics: ["Psychiatric disorders"] },
            { name: "Fundamentals + Anatomy + Pharma + Nutrition", questions: "20 Q", topics: ["Core nursing foundations", "Sciences"] },
            { name: "Nursing Management + Research", questions: "10 Q", topics: ["Administration", "Methodology"] }
          ]
        }
      ]
    }
  },
  {
    id: "c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4",
    title: "MNS Entrance Exam Prep",
    description: "Highly focused preparation program for the Military Nursing Service (MNS) Entrance Exam, leading to BSC Nursing and commissions in Armed Forces Hospitals.",
    instructor_id: "inst_4",
    thumbnail_url: "https://images.unsplash.com/photo-1599493758264-b51e0066aa4c?w=800&h=600&fit=crop",
    youtube_playlist: "https://www.youtube.com/@AIMS_Official",
    created_at: new Date().toISOString(),
    instructor: dummyInstructors[3],
    exam_pattern: {
      total_marks: "150 Marks",
      total_questions: "150 Questions",
      duration: "90 Minutes",
      negative_marking: "0.5 marks deducted for each wrong answer",
      type: "MCQ - 4 options (CBT, English Only, 11th/12th CBSE Level)",
      sections: [
        {
          name: "Section A: General (50 Marks)",
          questions: "50 Questions",
          subsections: [
            { name: "General Intelligence", questions: "25 Q", topics: ["Number Series", "Coding-Decoding", "Blood Relation", "Direction", "Analogy", "Venn Diagram", "Puzzles"] },
            { name: "General English", questions: "25 Q", topics: ["Grammar", "Synonyms-Antonyms", "One Word", "Spelling", "Sentence Correction", "Comprehension Passage", "Idioms"] }
          ]
        },
        {
          name: "Section B: Science + GK (100 Marks)",
          questions: "100 Questions",
          subsections: [
            { name: "Biology", questions: "40 Q", topics: ["Human Body Systems", "Cell Biology", "Genetics", "Ecology", "Diseases", "Nutrition", "Botany", "Zoology"] },
            { name: "Physics", questions: "20 Q", topics: ["Laws of Motion", "Work-Energy", "Gravitation", "Current Electricity", "Light", "Magnetism", "Modern Physics"] },
            { name: "Chemistry", questions: "20 Q", topics: ["Mole Concept", "Chemical Bonding", "Organic Chemistry basics", "Acids-Bases", "Periodic Table"] },
            { name: "General Awareness", questions: "20 Q", topics: ["Current Affairs", "Defence GK - Army/Navy/Airforce", "Awards", "Sports", "History", "Geography", "Odisha + India GK"] }
          ]
        }
      ]
    }
  },
  {
    id: "c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5",
    title: "RRB Railway Nursing Superintendent Prep",
    description: "Complete course for RRB Staff Nurse and Nursing Superintendent exams, focusing on nursing professional abilities, general science, arithmetic, and intelligence reasoning.",
    instructor_id: "inst_5",
    thumbnail_url: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&h=600&fit=crop",
    youtube_playlist: "https://www.youtube.com/@AIMS_Official",
    created_at: new Date().toISOString(),
    instructor: dummyInstructors[4],
    exam_pattern: {
      total_marks: "100 Marks",
      total_questions: "100 Questions",
      duration: "90 Minutes",
      negative_marking: "1/3 mark deducted for each wrong answer",
      type: "CBT - Computer Based Test, MCQs (Odia, English, Hindi)",
      sections: [
        {
          name: "Professional Ability",
          marks: "70 Marks",
          questions: "70 Questions",
          topics: [
            "Anatomy, Physiology, Nutrition, Biochemistry",
            "Nursing Foundations, Psychology, Sociology",
            "Microbiology, Pharmacology, Pathology, Genetics",
            "Medical-Surgical Nursing, Community Health Nursing",
            "Child Health Nursing, Mental Health Nursing",
            "Midwifery & Obstetrical Nursing",
            "Nursing Research & Statistics, Management of Nursing Services"
          ]
        },
        {
          name: "General Science",
          marks: "10 Marks",
          questions: "10 Questions",
          topics: ["Physics, Chemistry, and Life Sciences as per Class 10 CBSE syllabus"]
        },
        {
          name: "General Awareness",
          marks: "10 Marks",
          questions: "10 Questions",
          topics: ["Current Affairs", "Indian Geography & History", "Polity & Constitution", "Economy & Environment", "Sports", "Science & Tech"]
        },
        {
          name: "Arithmetic, Reasoning & Intelligence",
          marks: "10 Marks",
          questions: "10 Questions",
          topics: ["Number System", "Percentage & Ratio", "Time & Work", "Time & Distance", "SI & CI", "Algebra", "Coding-Decoding", "Series", "Venn Diagram", "Data Interpretation"]
        }
      ]
    }
  },
  {
    id: "c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6",
    title: "OJEE Nursing Entrance Prep",
    description: "Preparation for Odisha Joint Entrance Examination (OJEE) Nursing streams, covering ANM, GNM, Basic B.Sc. Nursing, Post Basic B.Sc. Nursing, and M.Sc. Nursing entrance exams.",
    instructor_id: "inst_1",
    thumbnail_url: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=800&h=600&fit=crop",
    youtube_playlist: "https://www.youtube.com/@AIMS_Official",
    created_at: new Date().toISOString(),
    instructor: dummyInstructors[0],
    exam_pattern: {
      total_marks: "100 - 200 Marks",
      total_questions: "100 - 200 Questions",
      duration: "2 - 3 Hours",
      negative_marking: "No negative marking (except standard courses: +4/-1 if applicable)",
      type: "CBT - Computer Based Test, MCQs",
      sections: [
        {
          name: "OJEE ANM / GNM Entrance",
          questions: "100 Questions (100 Marks)",
          topics: ["General Knowledge (20 Q)", "General English (20 Q)", "Arithmetic / Math (20 Q)", "Life Science - Biology (20 Q)", "Physical Science - Phy + Chem (20 Q)"]
        },
        {
          name: "OJEE Basic B.Sc Nursing",
          questions: "200 Questions (200 Marks)",
          topics: ["Physics (50 Q)", "Chemistry (50 Q)", "Biology (50 Q)", "Mathematics (50 Q)"]
        },
        {
          name: "OJEE Post Basic B.Sc Nursing",
          questions: "150 Questions (150 Marks)",
          topics: [
            "Nursing Subjects (100 Q - Med-Surg 25, OBG 15, Child 10, Community 15, Mental 10, Fundamentals 15, Pharma 10)",
            "General Section (50 Q - GK 15, Reasoning 15, English 10, Aptitude 10)"
          ]
        },
        {
          name: "OJEE M.Sc Nursing Entrance",
          questions: "150 Questions (150 Marks)",
          topics: [
            "Nursing Subjects (100 Q - All specialties + Fundamentals + Pharma)",
            "Research + Education + Management (30 Q - Methodology, Statistics, Teaching methods)",
            "General Section (20 Q - GK, Reasoning, English)"
          ]
        }
      ]
    }
  },
  {
    id: "c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7",
    title: "Nursing Lecturer & Tutor Prep",
    description: "Advanced coaching program for Govt Nursing Colleges, AIIMS, ESIC, and State PSC Nursing Lecturer, Tutor, and Tutor Grade-II competitive recruitment exams.",
    instructor_id: "inst_2",
    thumbnail_url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&h=600&fit=crop",
    youtube_playlist: "https://www.youtube.com/@AIMS_Official",
    created_at: new Date().toISOString(),
    instructor: dummyInstructors[1],
    exam_pattern: {
      total_marks: "150 - 200 Marks",
      total_questions: "150 - 200 Questions",
      duration: "2 - 3 Hours",
      negative_marking: "1/3 marks (varies by board)",
      type: "CBT - Computer Based Test, MCQs",
      sections: [
        {
          name: "Part 1: Nursing Subjects",
          marks: "80-100 Marks",
          questions: "80-100 Questions",
          topics: ["Medical Surgical Nursing (20 Q)", "Community Health Nursing (15 Q)", "OBG Nursing (15 Q)", "Child Health Nursing (10 Q)", "Mental Health Nursing (10 Q)", "Fundamentals + Anatomy + Physiology (10 Q)", "Pharmacology + Pathology + Micro (10 Q)", "Nursing Education, Admin & Research (10 Q)"]
        },
        {
          name: "Part 2: Nursing Education & Teaching Aptitude",
          marks: "20-30 Marks",
          questions: "20-30 Questions",
          topics: ["Principles of Education", "Methods of Teaching (Lecture, Demo, Case study)", "Curriculum Development (Standard Nursing Syllabus)", "Evaluation Methods & Educational Technology", "Guidance & Counseling"]
        },
        {
          name: "Part 3: Research & Statistics",
          marks: "10-20 Marks",
          questions: "10-20 Questions",
          topics: ["Research Methodology (Types, Sampling, Tools)", "Statistics (Mean, Median, T-test, Chi-square)", "Evidence Based Practice"]
        },
        {
          name: "Part 4: General Section",
          marks: "20-30 Marks",
          questions: "20-30 Questions",
          topics: ["General Knowledge & Current affairs", "General Reasoning", "General English"]
        }
      ]
    }
  },
];

export const dummyAnnouncements: Announcement[] = [
  {
    id: "a1",
    title: "Admissions Open for 2026-27 Session",
    content:
      "We are delighted to announce that admissions are now open for all nursing and hospitality courses for the academic session 2026-27. Interested candidates can apply online or visit the campus for offline admission. Limited seats available!",
    created_by: "admin_1",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a2",
    title: "Orientation Day: Welcome New Students",
    content:
      "Orientation program for newly admitted students will be held on 1st August 2026 at the institute auditorium starting at 9:00 AM. All parents are cordially invited. Lunch will be provided for all attendees.",
    created_by: "admin_1",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a3",
    title: "Clinical Posting Schedule Update",
    content:
      "All 3rd year B.Sc. Nursing students are hereby informed that their clinical postings at SCB Medical College will commence from next Monday. Students must report at 7:30 AM sharp in full uniform with ID cards.",
    created_by: "inst_1",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a4",
    title: "Semester Examination Timetable Released",
    content:
      "The timetable for the upcoming mid-semester examinations has been published on the notice board and student portal. Examinations will commence from 20th September. Students are requested to check their individual schedules.",
    created_by: "inst_2",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a5",
    title: "Cultural Fest: AIMS Fiesta 2026 🎉",
    content:
      "Get ready for the most awaited event of the year! AIMS Fiesta 2026 will be celebrated from 5th to 7th October. Students can participate in various cultural, sports, and academic competitions. Registration open now!",
    created_by: "admin_1",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const dummyTestimonials = [
  {
    id: "t1",
    name: "Riya Sahu",
    role: "OSSSC Nursing Officer Success",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=faces",
    quote:
      "AIMS Salipur transformed my career. The daily MCQ practice, focused coaching for OSSSC Nursing Officer, and expert faculty gave me the confidence to secure my government posting!",
    rating: 5,
  },
  {
    id: "t2",
    name: "Amit Kumar Behera",
    role: "AIIMS NORCET Rank Holder",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces",
    quote:
      "I cleared the AIIMS NORCET exam on my first attempt! The mock test series, detailed rationales for every answer, and the secure live classroom sessions made all the difference in my prep.",
    rating: 5,
  },
  {
    id: "t3",
    name: "Sneha Das",
    role: "ESIC Nursing Officer Placement",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=faces",
    quote:
      "I'm so grateful to AIMS for the structured syllabus coverage. Currently working at ESIC Hospital as a Staff Nurse. The test discussion videos in the portal were extremely helpful.",
    rating: 5,
  },
  {
    id: "t4",
    name: "Bikash Jena",
    role: "MNS Entrance Qualifier",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=faces",
    quote:
      "The specialized focus on both Nursing subjects and General section (GK, Aptitude, English) at AIMS is unmatched. The teachers are always available on WhatsApp for doubt-clearing.",
    rating: 5,
  },
];

export const dummyStudents: Profile[] = [
  "Riya Sahu",
  "Amit Kumar Behera",
  "Sneha Das",
  "Bikash Jena",
  "Priyanshi Mohanty",
  "Debashis Rout",
  "Ananya Nanda",
  "Suryakant Pradhan",
  "Laxmipriya Behera",
  "Rahul Choudhury",
  "Monalisa Dhal",
  "Sujit Kumar Sethy",
  "Subhashree Mishra",
  "Sambit Kumar Patra",
  "Bandana Parida",
  "Prasanta Kumar Barik",
  "Rashmi Sahoo",
  "Rupesh Kumar Bhoi",
  "Sasmita Nayak",
  "Chinmay Kumar Panda",
  "Diptimayee Mishra",
].map((name, i) => ({
  id: `stud_${i + 1}`,
  role: "student" as const,
  full_name: name,
  email: `${name.toLowerCase().replace(/\s+/g, ".")}@aims.edu`,
  whatsapp: `+91-99000-000${String(i + 10).padStart(2, "0")}`,
  avatar_url:
    i % 2 === 0
      ? `https://images.unsplash.com/photo-${
          [
            "1438761681033-6461ffad8d80",
            "1544005313-94ddf0286df2",
            "1529626455594-4ff0802cfb7e",
            "1534528741775-53994a69daeb",
            "1517841905240-472988babdf9",
            "1488426862026-3ee34a7d66df",
            "1521146764736-56c929d59c83",
            "1502823403499-6ccfcf4fb453",
            "1531123897727-8f129e1688ce",
            "1524250502761-1ac6f2e30d43",
          ][i % 10]
        }?w=400&h=400&fit=crop&crop=faces`
      : `https://images.unsplash.com/photo-${
          [
            "1507003211169-0a1dd7228f2d",
            "1472099645785-5658abf4ff4e",
            "1500648767791-00dcc994a43e",
            "1463453091185-61582044d556",
            "1519085360753-af0119f7cbe7",
            "1492562080023-ab3db95bfbce",
            "1506794778202-cad84cf45f1d",
            "1493225457124-a3eb161ffa5f",
            "1522075469751-3a6694fb2f61",
            "1492562080023-ab3db95bfbce",
          ][i % 10]
        }?w=400&h=400&fit=crop&crop=faces`,
  created_at: new Date(Date.now() - (i + 10) * 86400000).toISOString(),
  active: true,
  course_of_interest: [
    "OSSSC Nursing Officer",
    "AIIMS NORCET",
    "ESIC Nursing Officer",
    "MNS Entrance Prep",
    "RRB Nursing Superintendent",
    "OJEE Nursing Entrance",
  ][i % 6],
}));

export const dummyEnrollments: Enrollment[] = dummyStudents.flatMap(
  (student, sIdx) =>
    dummyCourses.slice(0, 4).map((course, cIdx) => ({
      id: `enr_${sIdx}_${cIdx}`,
      student_id: student.id,
      course_id: course.id,
      enrolled_at: new Date(Date.now() - (sIdx + cIdx + 50) * 86400000).toISOString(),
      progress:
        [15, 42, 68, 89, 100, 23, 55, 77, 33, 91, 8, 60, 48, 72, 100, 38, 85, 52, 95, 65][
          (sIdx + cIdx * 3) % 20
        ],
      student,
      course,
    }))
);

export const instagramImages = [
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=500&h=500&fit=crop",
];

export const monthlyEnrollments = [
  { month: "Jan", enrollments: 12 },
  { month: "Feb", enrollments: 19 },
  { month: "Mar", enrollments: 28 },
  { month: "Apr", enrollments: 35 },
  { month: "May", enrollments: 42 },
  { month: "Jun", enrollments: 58 },
  { month: "Jul", enrollments: 73 },
  { month: "Aug", enrollments: 89 },
  { month: "Sep", enrollments: 67 },
  { month: "Oct", enrollments: 52 },
  { month: "Nov", enrollments: 41 },
  { month: "Dec", enrollments: 33 },
];

export const dailyActiveUsers = [
  { day: "Mon", students: 18, instructors: 4, admin: 1 },
  { day: "Tue", students: 22, instructors: 5, admin: 2 },
  { day: "Wed", students: 19, instructors: 5, admin: 1 },
  { day: "Thu", students: 25, instructors: 4, admin: 2 },
  { day: "Fri", students: 20, instructors: 5, admin: 1 },
  { day: "Sat", students: 15, instructors: 3, admin: 1 },
  { day: "Sun", students: 8, instructors: 2, admin: 0 },
];

export const courseCompletionRates = [
  { name: "Completed", value: 65, color: "#059669" },
  { name: "In Progress", value: 25, color: "#2563EB" },
  { name: "Not Started", value: 10, color: "#94A3B8" },
];

export const dummyDeadlines = [
  { id: "d1", title: "OSSSC Mock Test 3", date: new Date(Date.now() + 3 * 86400000).toISOString(), course: "OSSSC Nursing Officer" },
  { id: "d2", title: "AIIMS NORCET Grand Test", date: new Date(Date.now() + 7 * 86400000).toISOString(), course: "AIIMS NORCET" },
  { id: "d3", title: "OJEE Biology Section Test", date: new Date(Date.now() + 14 * 86400000).toISOString(), course: "OJEE Nursing Entrance" },
];
