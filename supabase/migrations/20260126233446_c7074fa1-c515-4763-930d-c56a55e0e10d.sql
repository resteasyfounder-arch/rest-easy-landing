-- Add missing columns to assessments table for report tracking
ALTER TABLE readiness_v1.assessments 
ADD COLUMN IF NOT EXISTS report_status text DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS report_url text;