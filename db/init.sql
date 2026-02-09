-- ================================
-- USERS ENUMS
-- ================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('USER', 'DRIVER', 'ADMIN');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('ACTIVE', 'IRREGULAR', 'BANNED');
    END IF;
END$$;

-- ================================
-- TABLE: users
-- ================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
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

-- ================================
-- SEED USERS
-- ================================
INSERT INTO users (id, name, email, password, role, status, city, reputation_score) VALUES
('11111111-1111-1111-1111-111111111111','Admin Buenos','admin@buenos.com','admin123','ADMIN','ACTIVE','Buenos Aires',5.0),
('22222222-2222-2222-2222-222222222222','Rafael Motorista','rafael@buenos.com','driver123','DRIVER','ACTIVE','Buenos Aires',4.9),
('33333333-3333-3333-3333-333333333333','Henrique Motorista','henrique@buenos.com','driver123','DRIVER','IRREGULAR','Buenos Aires',4.2),
('44444444-4444-4444-4444-444444444444','Antonio Motorista','antonio@buenos.com','driver123','DRIVER','BANNED','Buenos Aires',3.1),
('55555555-5555-5555-5555-555555555555','Usuario Cliente','cliente@buenos.com','user123','USER','ACTIVE','Buenos Aires',5.0)
ON CONFLICT (id) DO NOTHING;
