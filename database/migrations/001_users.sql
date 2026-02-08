-- ================================
-- USERS
-- ================================

-- ENUM: user_role
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'user_role'
    ) THEN
        CREATE TYPE user_role AS ENUM ('USER', 'DRIVER', 'ADMIN');
    END IF;
END$$;

-- ENUM: user_status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'user_status'
    ) THEN
        CREATE TYPE user_status AS ENUM ('ACTIVE', 'IRREGULAR', 'BANNED');
    END IF;
END$$;

-- TABLE: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'USER',
    status user_status NOT NULL DEFAULT 'ACTIVE',
    city VARCHAR(100),
    reputation_score NUMERIC(3,2) NOT NULL DEFAULT 5.0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
