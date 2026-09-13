-- Add approved column to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

-- Update existing profiles to be approved
UPDATE public.profiles SET approved = true WHERE approved IS NULL OR approved = false;

-- Modify public.handle_new_user() trigger function to handle metadata.approved and multi-course enrollment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role TEXT := 'student';
  meta_full_name TEXT;
  meta_whatsapp TEXT;
  meta_course TEXT;
  meta_course_ids TEXT;
  meta_approved BOOLEAN := false;
BEGIN
  -- Extract role and other custom fields from metadata if present
  IF (new.raw_user_meta_data->>'role') IS NOT NULL THEN
    default_role := new.raw_user_meta_data->>'role';
  END IF;

  IF (new.raw_user_meta_data->>'approved') IS NOT NULL THEN
    meta_approved := (new.raw_user_meta_data->>'approved')::boolean;
  ELSE
    IF default_role IN ('admin', 'instructor') THEN
      meta_approved := true;
    ELSE
      meta_approved := false;
    END IF;
  END IF;

  meta_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '');
  meta_whatsapp := new.raw_user_meta_data->>'phone';
  meta_course := new.raw_user_meta_data->>'course';
  meta_course_ids := new.raw_user_meta_data->>'course_ids';

  -- 1. Insert Profile
  INSERT INTO public.profiles (id, role, full_name, email, whatsapp, course_of_interest, avatar_url, approved)
  VALUES (
    new.id,
    default_role,
    meta_full_name,
    new.email,
    meta_whatsapp,
    meta_course,
    new.raw_user_meta_data->>'avatar_url',
    meta_approved
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

  -- 4. Enroll the new user in courses
  IF meta_course_ids IS NOT NULL AND meta_course_ids <> '' THEN
    -- Enroll only in selected courses
    INSERT INTO public.enrollments (student_id, course_id)
    SELECT new.id, id FROM public.courses
    WHERE id = ANY(string_to_array(meta_course_ids, ',')::uuid[])
    ON CONFLICT DO NOTHING;
  ELSE
    -- Default/backward compatible: Enroll in all existing courses
    INSERT INTO public.enrollments (student_id, course_id)
    SELECT new.id, id FROM public.courses
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
