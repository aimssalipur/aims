export type UserRole = "admin" | "student" | "instructor" | "accountant";

export interface Profile {
  id: string;
  role: UserRole;
  roles?: UserRole[];
  full_name: string;
  email: string;
  whatsapp: string | null;
  avatar_url: string | null;
  created_at: string;
  active?: boolean;
  course_of_interest?: string;
}

export interface BusinessTransaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  description: string;
  recorded_by?: string | null;
  reference_no?: string | null;
  created_at: string;
  recorder?: Profile;
}

export interface FeePayment {
  id: string;
  student_id: string;
  amount_paid: number;
  payment_date: string;
  payment_method: "UPI" | "Cash" | "Bank Transfer" | "Card" | "Other";
  transaction_id?: string | null;
  status: "pending" | "verified" | "rejected";
  remarks?: string | null;
  verified_by?: string | null;
  receipt_url?: string | null;
  created_at: string;
  student?: Profile;
  verifier?: Profile;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  thumbnail_url: string;
  youtube_playlist: string | null;
  created_at: string;
  instructor?: Profile;
  exam_pattern?: {
    total_marks: string;
    total_questions: string;
    duration: string;
    negative_marking: string;
    type: string;
    sections: {
      name: string;
      marks?: string;
      questions?: string;
      topics?: string[];
      subsections?: { name: string; questions?: string; topics?: string[] }[];
    }[];
  };
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  progress: number;
  student?: Profile;
  course?: Course;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  author?: Profile;
}

export interface SiteSettings {
  id: string;
  youtube_url: string;
  instagram_url: string;
  whatsapp_number: string;
  contact_email: string;
  updated_at: string;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: "default" | "destructive" | "success";
}
