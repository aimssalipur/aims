-- Migration: Capital Inflow & Loans Management
-- Creates capital_inflow_records and capital_repayments tables with RLS and indexes

CREATE TABLE IF NOT EXISTS public.capital_inflow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('bank_loan', 'private_lender', 'investor', 'other')),
  lender_name TEXT NOT NULL,
  lender_contact TEXT,
  account_number TEXT,
  principal_amount NUMERIC(15,2) NOT NULL,
  interest_rate_percent NUMERIC(6,2) DEFAULT 0,
  tenure_months INTEGER DEFAULT 12,
  interest_type TEXT DEFAULT 'reducing_emi' CHECK (interest_type IN ('reducing_emi', 'flat_simple', 'zero_interest')),
  monthly_emi NUMERIC(15,2) DEFAULT 0,
  total_interest NUMERIC(15,2) DEFAULT 0,
  total_payable NUMERIC(15,2) NOT NULL,
  amount_repaid NUMERIC(15,2) DEFAULT 0,
  remaining_balance NUMERIC(15,2) NOT NULL,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  payment_method TEXT DEFAULT 'Bank Transfer' CHECK (payment_method IN ('Cash', 'UPI', 'Cheque', 'Bank Transfer', 'Demand Draft', 'Other')),
  payment_reference TEXT,
  purpose TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'settled', 'overdue')),
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.capital_repayments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES public.capital_inflow_records(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'Bank Transfer',
  payment_reference TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.capital_inflow_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_repayments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and Accountants can manage capital records" ON public.capital_inflow_records;
CREATE POLICY "Admins and Accountants can manage capital records" ON public.capital_inflow_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'accountant')
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'accountant')
    )
  );

DROP POLICY IF EXISTS "Admins and Accountants can manage capital repayments" ON public.capital_repayments;
CREATE POLICY "Admins and Accountants can manage capital repayments" ON public.capital_repayments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'accountant')
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'accountant')
    )
  );

CREATE INDEX IF NOT EXISTS idx_capital_inflow_type ON public.capital_inflow_records(type);
CREATE INDEX IF NOT EXISTS idx_capital_inflow_status ON public.capital_inflow_records(status);
CREATE INDEX IF NOT EXISTS idx_capital_inflow_received_date ON public.capital_inflow_records(received_date DESC);
CREATE INDEX IF NOT EXISTS idx_capital_repayments_loan_id ON public.capital_repayments(loan_id);
