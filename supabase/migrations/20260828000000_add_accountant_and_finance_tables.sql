-- Alter check constraints on profiles and user_roles to include 'accountant'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'instructor', 'admin', 'accountant'));

ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN ('student', 'instructor', 'admin', 'accountant'));

-- Create business_transactions table
CREATE TABLE IF NOT EXISTS public.business_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  description TEXT NOT NULL,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reference_no TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create fees_payments table
CREATE TABLE IF NOT EXISTS public.fees_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount_paid NUMERIC(12, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'Cash', 'Bank Transfer', 'Card', 'Other')),
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  remarks TEXT,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.business_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees_payments ENABLE ROW LEVEL SECURITY;

-- business_transactions Policies
DROP POLICY IF EXISTS "Admins and Accountants can manage transactions" ON public.business_transactions;
CREATE POLICY "Admins and Accountants can manage transactions" ON public.business_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'accountant')
    )
  );

-- fees_payments Policies
DROP POLICY IF EXISTS "Admins and Accountants can manage fees" ON public.fees_payments;
CREATE POLICY "Admins and Accountants can manage fees" ON public.fees_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'accountant')
    )
  );

DROP POLICY IF EXISTS "Students can view their own fees" ON public.fees_payments;
CREATE POLICY "Students can view their own fees" ON public.fees_payments
  FOR SELECT USING (
    auth.uid() = student_id
  );

DROP POLICY IF EXISTS "Students can insert their own fees" ON public.fees_payments;
CREATE POLICY "Students can insert their own fees" ON public.fees_payments
  FOR INSERT WITH CHECK (
    auth.uid() = student_id
  );
