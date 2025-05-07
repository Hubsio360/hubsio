
-- Create a table for storing CTI queries and results
CREATE TABLE public.cti_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  query TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security policies
ALTER TABLE public.cti_results ENABLE ROW LEVEL SECURITY;

-- Users can view their own CTI results
CREATE POLICY "Users can view own CTI results" 
  ON public.cti_results 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own CTI results
CREATE POLICY "Users can insert own CTI results" 
  ON public.cti_results 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own CTI results
CREATE POLICY "Users can update own CTI results" 
  ON public.cti_results 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own CTI results
CREATE POLICY "Users can delete own CTI results" 
  ON public.cti_results 
  FOR DELETE 
  USING (auth.uid() = user_id);
