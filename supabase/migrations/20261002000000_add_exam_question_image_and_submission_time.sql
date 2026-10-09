-- Migration: Add image_url to exam_questions and time_taken_seconds to exam_submissions

-- 1. Add image_url to exam_questions
ALTER TABLE public.exam_questions
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Add time_taken_seconds to exam_submissions
ALTER TABLE public.exam_submissions
  ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER;
