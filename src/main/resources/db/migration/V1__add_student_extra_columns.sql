-- Flyway migration: add new Student entity columns and backfill defaults
-- Applies to existing schema where table student already exists.
-- Uses IF NOT EXISTS to be idempotent on environments where columns may have been added manually.

ALTER TABLE student ADD COLUMN IF NOT EXISTS nationality VARCHAR(255);
ALTER TABLE student ADD COLUMN IF NOT EXISTS college VARCHAR(255);
ALTER TABLE student ADD COLUMN IF NOT EXISTS major VARCHAR(255);
ALTER TABLE student ADD COLUMN IF NOT EXISTS minor VARCHAR(255);

-- Backfill mandatory columns with safe placeholder values if blank or null
UPDATE student SET nationality = 'UNKNOWN'   WHERE nationality IS NULL OR nationality = '';
UPDATE student SET college     = 'UNASSIGNED' WHERE college     IS NULL OR college = '';

-- Enforce NOT NULL constraints only after data is backfilled
ALTER TABLE student ALTER COLUMN nationality SET NOT NULL;
ALTER TABLE student ALTER COLUMN college SET NOT NULL;

-- Optional: leave major/minor nullable (academic specialization may be absent).
