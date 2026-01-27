-- Add report_data column to store the generated report JSON
ALTER TABLE readiness_v1.assessments 
ADD COLUMN IF NOT EXISTS report_data JSONB;

-- Add report_generated_at timestamp for tracking
ALTER TABLE readiness_v1.assessments 
ADD COLUMN IF NOT EXISTS report_generated_at TIMESTAMP WITH TIME ZONE;