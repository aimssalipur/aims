-- Migration: Create Online MCQ Exams, Questions, and Submissions Tables
-- Also links course_id to fees_payments table

-- 1. Add course_id to fees_payments if it doesn't already exist
ALTER TABLE public.fees_payments
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_fees_payments_course_id ON public.fees_payments(course_id);

-- 2. Create exams table
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  pass_percentage INTEGER NOT NULL DEFAULT 50,
  total_marks INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create exam_questions table
CREATE TABLE IF NOT EXISTS public.exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  marks INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create exam_submissions table
CREATE TABLE IF NOT EXISTS public.exam_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_marks NUMERIC(10, 2) NOT NULL DEFAULT 0,
  percentage NUMERIC(6, 2) NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_exams_course_id ON public.exams(course_id);
CREATE INDEX IF NOT EXISTS idx_exams_is_published ON public.exams(is_published);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON public.exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_exam_id ON public.exam_submissions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_student_id ON public.exam_submissions(student_id);

-- 7. Policies for exams
DROP POLICY IF EXISTS "Staff can manage all exams" ON public.exams;
CREATE POLICY "Staff can manage all exams" ON public.exams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor')
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'instructor')
    )
  );

DROP POLICY IF EXISTS "Published exams are viewable by students" ON public.exams;
CREATE POLICY "Published exams are viewable by students" ON public.exams
  FOR SELECT USING (is_published = true);

-- 8. Policies for exam_questions
DROP POLICY IF EXISTS "Staff can manage all questions" ON public.exam_questions;
CREATE POLICY "Staff can manage all questions" ON public.exam_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor')
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'instructor')
    )
  );

-- 9. Policies for exam_submissions
DROP POLICY IF EXISTS "Students can view their own submissions" ON public.exam_submissions;
CREATE POLICY "Students can view their own submissions" ON public.exam_submissions
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can submit exam results" ON public.exam_submissions;
CREATE POLICY "Students can submit exam results" ON public.exam_submissions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Staff can view all submissions" ON public.exam_submissions;
CREATE POLICY "Staff can view all submissions" ON public.exam_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor')
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'instructor')
    )
  );
