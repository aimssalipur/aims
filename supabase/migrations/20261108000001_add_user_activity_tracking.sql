-- Migration: Add user activity tracking (DAU, MAU, time spent, live status)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS time_spent_today_seconds INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_spent_month_seconds INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_time_spent_seconds INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_date DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS last_active_month VARCHAR(7) NOT NULL DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM');

-- Ultra-lightweight daily rollup table: max 1 row per user per day (~50 bytes per row)
CREATE TABLE IF NOT EXISTS public.user_daily_activity (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  seconds_spent INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_user_daily_activity_date ON public.user_daily_activity(activity_date);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen_at ON public.profiles(last_seen_at);

-- Atomic Postgres function to log heartbeat with zero race conditions & minimal overhead
CREATE OR REPLACE FUNCTION public.record_user_heartbeat(
  p_user_id UUID,
  p_seconds INT DEFAULT 60
)
RETURNS VOID AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_month VARCHAR(7) := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
BEGIN
  -- 1. Update profiles table
  UPDATE public.profiles
  SET
    last_seen_at = NOW(),
    time_spent_today_seconds = CASE 
      WHEN last_active_date = v_today THEN time_spent_today_seconds + p_seconds
      ELSE p_seconds 
    END,
    time_spent_month_seconds = CASE 
      WHEN last_active_month = v_month THEN time_spent_month_seconds + p_seconds
      ELSE p_seconds 
    END,
    total_time_spent_seconds = total_time_spent_seconds + p_seconds,
    last_active_date = v_today,
    last_active_month = v_month
  WHERE id = p_user_id;

  -- 2. Upsert single daily rollup row
  INSERT INTO public.user_daily_activity (user_id, activity_date, seconds_spent)
  VALUES (p_user_id, v_today, p_seconds)
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET seconds_spent = public.user_daily_activity.seconds_spent + EXCLUDED.seconds_spent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

