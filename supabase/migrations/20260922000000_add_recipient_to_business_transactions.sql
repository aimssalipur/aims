-- Migration: Add recipient_id to business_transactions for staff/admin salary tracking
ALTER TABLE public.business_transactions 
ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create an index for faster lookup of transactions by recipient
CREATE INDEX IF NOT EXISTS idx_business_transactions_recipient_id 
ON public.business_transactions(recipient_id);
