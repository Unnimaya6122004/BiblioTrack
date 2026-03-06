ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_role_check;

-- Align legacy role values to the new enum set (ADMIN, USER).
UPDATE users
SET role = CASE
    WHEN UPPER(COALESCE(role, '')) = 'ADMIN' THEN 'ADMIN'
    ELSE 'USER'
END;

ALTER TABLE users
    ADD CONSTRAINT users_role_check
        CHECK (role IN ('ADMIN', 'USER'));
