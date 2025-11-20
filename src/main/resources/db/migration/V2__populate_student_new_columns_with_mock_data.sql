-- V2 migration: populate newly added student columns with mock data
-- Applies deterministic, repeatable assignments (no randomness) so migration is idempotent.
-- Only overrides placeholder values (nationality='UNKNOWN', college='UNASSIGNED') or null majors/minors.

-- Nationality mapping based on email domain; defaults to 'Brazil' when no pattern matches.
UPDATE student
SET nationality = CASE
    WHEN nationality = 'UNKNOWN' THEN (
        CASE
            WHEN email ILIKE '%@gmail.%'   THEN 'USA'
            WHEN email ILIKE '%@hotmail.%' THEN 'Canada'
            WHEN email ILIKE '%@yahoo.%'   THEN 'USA'
            WHEN email ILIKE '%@outlook.%' THEN 'UK'
            WHEN email ILIKE '%@edu.%'     THEN 'USA'
            ELSE 'Brazil'
        END
    )
    ELSE nationality
END;

-- College assignment using similar domain heuristic; defaults to 'General Studies'.
UPDATE student
SET college = CASE
    WHEN college = 'UNASSIGNED' THEN (
        CASE
            WHEN email ILIKE '%@gmail.%'   THEN 'Engineering'
            WHEN email ILIKE '%@hotmail.%' THEN 'Business'
            WHEN email ILIKE '%@yahoo.%'   THEN 'Arts'
            WHEN email ILIKE '%@outlook.%' THEN 'Science'
            WHEN email ILIKE '%@edu.%'     THEN 'Liberal Arts'
            ELSE 'General Studies'
        END
    )
    ELSE college
END;

-- Deterministic major assignment based on primary key modulo; preserves existing non-null values.
UPDATE student
SET major = COALESCE(major, CASE (id % 5)
    WHEN 0 THEN 'Computer Science'
    WHEN 1 THEN 'Economics'
    WHEN 2 THEN 'Biology'
    WHEN 3 THEN 'Mathematics'
    ELSE 'History'
END);

-- Deterministic minor assignment based on primary key modulo; preserves existing non-null values.
UPDATE student
SET minor = COALESCE(minor, CASE (id % 4)
    WHEN 0 THEN 'Philosophy'
    WHEN 1 THEN 'Statistics'
    WHEN 2 THEN 'Spanish'
    ELSE 'Music'
END);

-- Verification suggestions (not executed by Flyway):
-- SELECT id, email, nationality, college, major, minor FROM student LIMIT 20;
