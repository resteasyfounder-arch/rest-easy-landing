-- Add report staleness tracking to assessments table
ALTER TABLE readiness_v1.assessments 
ADD COLUMN IF NOT EXISTS report_stale BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_answer_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN readiness_v1.assessments.report_stale IS 'True when answers/profile changed after report was generated';
COMMENT ON COLUMN readiness_v1.assessments.last_answer_at IS 'Timestamp of most recent answer modification';