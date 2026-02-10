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

-- ================================
-- TABLE: drivers
-- ================================
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    total_trips INTEGER NOT NULL DEFAULT 0,
    total_deliveries INTEGER NOT NULL DEFAULT 0,
    daily_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_driver_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_active ON drivers(is_active);

-- SEED DRIVERS (1:1 com usuários DRIVER)
INSERT INTO drivers (id, user_id, total_trips, total_deliveries, daily_earnings, is_active)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','22222222-2222-2222-2222-222222222222',5,2,50.00,TRUE),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','33333333-3333-3333-3333-333333333333',12,5,20.00,TRUE),
('cccccccc-cccc-cccc-cccc-cccccccccccc','44444444-4444-4444-4444-444444444444',30,15,0.00,FALSE)
ON CONFLICT (id) DO NOTHING;

-- ================================
-- DOCUMENTS
-- - sem PDF/foto (somente datas + status)
-- ================================

-- ENUM: document_type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE document_type AS ENUM ('CNH', 'CRLV', 'CRIMINAL_RECORD');
    END IF;
END$$;

-- ENUM: document_status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
        CREATE TYPE document_status AS ENUM ('VALID', 'EXPIRING', 'EXPIRED');
    END IF;
END$$;

-- TABLE: documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL,
    type document_type NOT NULL,
    issued_at DATE NOT NULL,
    expires_at DATE NOT NULL,
    status document_status NOT NULL DEFAULT 'VALID',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_document_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_document_driver_type UNIQUE (driver_id, type)
);

CREATE INDEX IF NOT EXISTS idx_documents_driver_id ON documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_expires_at ON documents(expires_at);

-- SEED DOCUMENTOS (exemplos: em dia / expiring / vencido)
INSERT INTO documents (driver_id, type, issued_at, expires_at, status)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','CNH', DATE '2024-01-10', DATE '2028-01-10', 'VALID'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','CRLV', DATE '2025-03-01', DATE '2026-02-20', 'EXPIRING'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','CRIMINAL_RECORD', DATE '2023-06-15', DATE '2024-06-15', 'EXPIRED')
ON CONFLICT (driver_id, type) DO NOTHING;
