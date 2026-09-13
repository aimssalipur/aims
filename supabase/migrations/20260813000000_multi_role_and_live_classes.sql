-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  thumbnail_url TEXT NOT NULL,
  youtube_playlist TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  progress INTEGER DEFAULT 0 NOT NULL,
  UNIQUE(student_id, course_id)
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_url TEXT NOT NULL,
  instagram_url TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_roles table for multi-role mapping
CREATE TABLE IF NOT EXISTS public.user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
  UNIQUE(user_id, role)
);

-- Create live_classes table
CREATE TABLE IF NOT EXISTS public.live_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  room_name TEXT NOT NULL UNIQUE,
  room_password TEXT NOT NULL,
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create youtube_resources table
CREATE TABLE IF NOT EXISTS public.youtube_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on new tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_resources ENABLE ROW LEVEL SECURITY;

-- Setup basic RLS Policies

-- 1. user_roles Policies
CREATE POLICY "user_roles are viewable by everyone" ON public.user_roles
  FOR SELECT USING (true);

CREATE POLICY "user_roles can be modified by admins" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 2. courses Policies
CREATE POLICY "courses are viewable by everyone" ON public.courses
  FOR SELECT USING (true);

CREATE POLICY "courses can be modified by admins and instructors" ON public.courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor')
    )
  );

-- 3. enrollments Policies
CREATE POLICY "enrollments viewable by own student, instructor or admin" ON public.enrollments
  FOR SELECT USING (
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "students can enroll themselves, admins can enroll anyone" ON public.enrollments
  FOR INSERT WITH CHECK (
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "enrollments can be modified by admins and instructors" ON public.enrollments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor')
    )
  );

-- 4. announcements Policies
CREATE POLICY "announcements are viewable by everyone" ON public.announcements
  FOR SELECT USING (true);

CREATE POLICY "announcements can be modified by admins and instructors" ON public.announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor')
    )
  );

-- 5. live_classes Policies
CREATE POLICY "live_classes viewable by enrolled students, instructors or admins" ON public.live_classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.student_id = auth.uid() AND enrollments.course_id = live_classes.course_id
    ) OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "live_classes can be managed by instructors and admins" ON public.live_classes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor')
    )
  );

-- 6. youtube_resources Policies
CREATE POLICY "youtube_resources viewable by enrolled students, instructors or admins" ON public.youtube_resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.student_id = auth.uid() AND enrollments.course_id = youtube_resources.course_id
    ) OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "youtube_resources can be managed by instructors and admins" ON public.youtube_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor')
    )
  );

-- Migrate existing profile roles into the new user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT id, role FROM public.profiles
ON CONFLICT DO NOTHING;

-- Modify new user trigger function to also insert roles into user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role TEXT := 'student';
  meta_full_name TEXT;
  meta_whatsapp TEXT;
  meta_course TEXT;
BEGIN
  -- Extract role and other custom fields from metadata if present
  IF (new.raw_user_meta_data->>'role') IS NOT NULL THEN
    default_role := new.raw_user_meta_data->>'role';
  END IF;

  meta_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '');
  meta_whatsapp := new.raw_user_meta_data->>'phone';
  meta_course := new.raw_user_meta_data->>'course';

  -- 1. Insert Profile
  INSERT INTO public.profiles (id, role, full_name, email, whatsapp, course_of_interest, avatar_url)
  VALUES (
    new.id,
    default_role,
    meta_full_name,
    new.email,
    meta_whatsapp,
    meta_course,
    new.raw_user_meta_data->>'avatar_url'
  );

  -- 2. Insert User Role (mapping table)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, default_role);

  -- 3. If the role created is admin or instructor, also automatically give student role for convenience
  IF default_role IN ('admin', 'instructor') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'student')
    ON CONFLICT DO NOTHING;
  END IF;

  -- 4. Automatically enroll the new user in all existing courses
  INSERT INTO public.enrollments (student_id, course_id)
  SELECT new.id, id FROM public.courses
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
