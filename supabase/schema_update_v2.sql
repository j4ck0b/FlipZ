-- Fix missing columns for Trade Offers
ALTER TABLE public.trade_offers ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id);
ALTER TABLE public.trade_offers ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Fix missing columns for Trade Conversations
ALTER TABLE public.trade_conversations ADD COLUMN IF NOT EXISTS participant_1_id UUID REFERENCES auth.users(id);
ALTER TABLE public.trade_conversations ADD COLUMN IF NOT EXISTS participant_2_id UUID REFERENCES auth.users(id);

-- Update RLS to use IDs as well as emails (already done in flipz_full_schema.sql, but let's be sure)
DROP POLICY IF EXISTS "trade_offers_select" ON public.trade_offers;
CREATE POLICY "trade_offers_select" ON public.trade_offers FOR SELECT USING (
  sender_email = auth.jwt()->>'email' OR 
  owner_email = auth.jwt()->>'email' OR 
  sender_id = auth.uid() OR 
  owner_id = auth.uid()
);

DROP POLICY IF EXISTS "trade_conversations_select" ON public.trade_conversations;
CREATE POLICY "trade_conversations_select" ON public.trade_conversations FOR SELECT USING (
  participant_1_email = auth.jwt()->>'email' OR 
  participant_2_email = auth.jwt()->>'email' OR
  participant_1_id = auth.uid() OR
  participant_2_id = auth.uid()
);
