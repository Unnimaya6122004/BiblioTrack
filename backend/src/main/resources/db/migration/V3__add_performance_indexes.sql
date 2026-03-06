ALTER TABLE fines
    ADD COLUMN IF NOT EXISTS user_id INTEGER;

UPDATE fines f
SET user_id = l.user_id
FROM loans l
WHERE f.loan_id = l.id
  AND f.user_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fines_user_id_fkey'
    ) THEN
        ALTER TABLE fines
            ADD CONSTRAINT fines_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_fines_user_id ON fines(user_id);
