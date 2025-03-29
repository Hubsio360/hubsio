
-- Add the new column to store impact scale ratings
ALTER TABLE risk_scenarios 
ADD COLUMN IF NOT EXISTS impact_scale_ratings JSONB DEFAULT '{}'::jsonb;
