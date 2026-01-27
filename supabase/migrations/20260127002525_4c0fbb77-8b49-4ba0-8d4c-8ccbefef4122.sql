-- Step 1: First update the status constraint to allow 'archived'
ALTER TABLE readiness_v1.assessments 
DROP CONSTRAINT IF EXISTS assessments_status_check;

ALTER TABLE readiness_v1.assessments 
ADD CONSTRAINT assessments_status_check 
CHECK (status IN ('draft', 'in_progress', 'completed', 'archived'));

-- Step 2: Archive all duplicate assessments, keeping only the one with 57 answers
UPDATE readiness_v1.assessments
SET status = 'archived'
WHERE subject_id = '2254491d-7086-47ae-a2db-ea2fe3ff80f6'
  AND id != '787e8062-0574-417c-a4e9-346a93b92e39';

-- Step 3: Add unique constraint - one active assessment per subject
CREATE UNIQUE INDEX IF NOT EXISTS assessments_one_active_per_subject 
ON readiness_v1.assessments (subject_id, assessment_id) 
WHERE status != 'archived';