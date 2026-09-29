-- Migration: Allow users with accountant/admin in user_roles or profiles to manage transactions & fees
DROP POLICY IF EXISTS "Admins and Accountants can manage transactions" ON public.business_transactions;
CREATE POLICY "Admins and Accountants can manage transactions" ON public.business_transactions
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

DROP POLICY IF EXISTS "Admins and Accountants can manage fees" ON public.fees_payments;
CREATE POLICY "Admins and Accountants can manage fees" ON public.fees_payments
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
