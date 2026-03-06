CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'USER')),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS book_copies (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    barcode VARCHAR(50) NOT NULL UNIQUE,
    rack_location VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
        CHECK (status IN ('AVAILABLE', 'ISSUED', 'LOST', 'DAMAGED'))
);

CREATE INDEX IF NOT EXISTS idx_book_copies_book ON book_copies (book_id);

CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_copy_id INTEGER NOT NULL REFERENCES book_copies(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ISSUED'
        CHECK (status IN ('ISSUED', 'RETURNED'))
);

CREATE INDEX IF NOT EXISTS idx_loans_user ON loans (user_id);
CREATE INDEX IF NOT EXISTS idx_loans_book_copy ON loans (book_copy_id);

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    reservation_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations (user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_book ON reservations (book_id);

CREATE TABLE IF NOT EXISTS fines (
    id SERIAL PRIMARY KEY,
    loan_id INTEGER NOT NULL UNIQUE REFERENCES loans(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
    paid_date DATE,
    status VARCHAR(20) DEFAULT 'UNPAID'
        CHECK (status IN ('UNPAID', 'PAID', 'WAIVED'))
);
