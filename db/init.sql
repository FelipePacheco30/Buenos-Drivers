-- ================================
-- EXTENSIONS
-- ================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
('66666666-6666-6666-6666-666666666666','Lucas Motorista','lucas@buenos.com','driver123','DRIVER','ACTIVE','Buenos Aires',4.8),
('77777777-7777-7777-7777-777777777777','Diego Motorista','diego@buenos.com','driver123','DRIVER','IRREGULAR','Buenos Aires',4.1),
('88888888-8888-8888-8888-888888888888','Sofia Motorista','sofia@buenos.com','driver123','DRIVER','ACTIVE','Buenos Aires',4.7),
('99999999-9999-9999-9999-999999999999','Valentina Motorista','valentina@buenos.com','driver123','DRIVER','ACTIVE','Buenos Aires',4.6),
('12121212-1212-1212-1212-121212121212','Juan Motorista','juan@buenos.com','driver123','DRIVER','BANNED','Buenos Aires',3.7),
('13131313-1313-1313-1313-131313131313','Mateo Motorista','mateo@buenos.com','driver123','DRIVER','ACTIVE','Buenos Aires',4.5),
('14141414-1414-1414-1414-141414141414','Camila Motorista','camila@buenos.com','driver123','DRIVER','IRREGULAR','Buenos Aires',4.0),
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
('cccccccc-cccc-cccc-cccc-cccccccccccc','44444444-4444-4444-4444-444444444444',30,15,0.00,FALSE),
('dddddddd-dddd-dddd-dddd-dddddddddddd','66666666-6666-6666-6666-666666666666',8,3,35.00,TRUE),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','77777777-7777-7777-7777-777777777777',10,4,18.00,TRUE),
('ffffffff-ffff-ffff-ffff-ffffffffffff','88888888-8888-8888-8888-888888888888',6,2,28.00,TRUE),
('10101010-1010-1010-1010-101010101010','99999999-9999-9999-9999-999999999999',4,1,12.00,TRUE),
('20202020-2020-2020-2020-202020202020','12121212-1212-1212-1212-121212121212',14,7,0.00,FALSE),
('30303030-3030-3030-3030-303030303030','13131313-1313-1313-1313-131313131313',9,4,22.00,TRUE),
('40404040-4040-4040-4040-404040404040','14141414-1414-1414-1414-141414141414',11,6,16.00,TRUE)
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
-- Rafael (em dia)
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','CNH', DATE '2024-01-10', DATE '2028-01-10', 'VALID'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','CRLV', DATE '2025-03-01', DATE '2027-03-01', 'VALID'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','CRIMINAL_RECORD', DATE '2025-06-15', DATE '2027-06-15', 'VALID'),

-- Henrique (irregular: 1 doc expirando)
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','CNH', DATE '2024-02-10', DATE '2028-02-10', 'VALID'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','CRLV', DATE '2025-02-10', DATE '2026-02-18', 'EXPIRING'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','CRIMINAL_RECORD', DATE '2025-01-10', DATE '2027-01-10', 'VALID'),

-- Antonio (banido por status/reputação; docs em dia para validar prioridade do status)
('cccccccc-cccc-cccc-cccc-cccccccccccc','CNH', DATE '2024-03-10', DATE '2028-03-10', 'VALID'),
('cccccccc-cccc-cccc-cccc-cccccccccccc','CRLV', DATE '2025-03-10', DATE '2027-03-10', 'VALID'),
('cccccccc-cccc-cccc-cccc-cccccccccccc','CRIMINAL_RECORD', DATE '2025-03-10', DATE '2027-03-10', 'VALID'),

-- Lucas (em dia)
('dddddddd-dddd-dddd-dddd-dddddddddddd','CNH', DATE '2024-04-10', DATE '2028-04-10', 'VALID'),
('dddddddd-dddd-dddd-dddd-dddddddddddd','CRLV', DATE '2025-04-10', DATE '2027-04-10', 'VALID'),
('dddddddd-dddd-dddd-dddd-dddddddddddd','CRIMINAL_RECORD', DATE '2025-04-10', DATE '2027-04-10', 'VALID'),

-- Diego (irregular)
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','CNH', DATE '2024-05-10', DATE '2028-05-10', 'VALID'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','CRLV', DATE '2025-05-10', DATE '2026-02-15', 'EXPIRING'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','CRIMINAL_RECORD', DATE '2025-05-10', DATE '2027-05-10', 'VALID'),

-- Sofia (em dia)
('ffffffff-ffff-ffff-ffff-ffffffffffff','CNH', DATE '2024-06-10', DATE '2028-06-10', 'VALID'),
('ffffffff-ffff-ffff-ffff-ffffffffffff','CRLV', DATE '2025-06-10', DATE '2027-06-10', 'VALID'),
('ffffffff-ffff-ffff-ffff-ffffffffffff','CRIMINAL_RECORD', DATE '2025-06-10', DATE '2027-06-10', 'VALID'),

-- Valentina (em dia)
('10101010-1010-1010-1010-101010101010','CNH', DATE '2024-07-10', DATE '2028-07-10', 'VALID'),
('10101010-1010-1010-1010-101010101010','CRLV', DATE '2025-07-10', DATE '2027-07-10', 'VALID'),
('10101010-1010-1010-1010-101010101010','CRIMINAL_RECORD', DATE '2025-07-10', DATE '2027-07-10', 'VALID'),

-- Juan (banido por status/reputação; docs em dia)
('20202020-2020-2020-2020-202020202020','CNH', DATE '2024-08-10', DATE '2028-08-10', 'VALID'),
('20202020-2020-2020-2020-202020202020','CRLV', DATE '2025-08-10', DATE '2027-08-10', 'VALID'),
('20202020-2020-2020-2020-202020202020','CRIMINAL_RECORD', DATE '2025-08-10', DATE '2027-08-10', 'VALID'),

-- Mateo (em dia)
('30303030-3030-3030-3030-303030303030','CNH', DATE '2024-09-10', DATE '2028-09-10', 'VALID'),
('30303030-3030-3030-3030-303030303030','CRLV', DATE '2025-09-10', DATE '2027-09-10', 'VALID'),
('30303030-3030-3030-3030-303030303030','CRIMINAL_RECORD', DATE '2025-09-10', DATE '2027-09-10', 'VALID'),

-- Camila (irregular)
('40404040-4040-4040-4040-404040404040','CNH', DATE '2024-10-10', DATE '2028-10-10', 'VALID'),
('40404040-4040-4040-4040-404040404040','CRLV', DATE '2025-10-10', DATE '2026-02-22', 'EXPIRING'),
('40404040-4040-4040-4040-404040404040','CRIMINAL_RECORD', DATE '2025-10-10', DATE '2027-10-10', 'VALID')
ON CONFLICT (driver_id, type) DO NOTHING;

-- ================================
-- MESSAGES (ADMIN INBOX)
-- ================================

-- ENUM: message_sender_role
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_sender_role') THEN
        CREATE TYPE message_sender_role AS ENUM ('SYSTEM', 'ADMIN', 'DRIVER');
    END IF;
END$$;

-- ENUM: system_message_event
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'system_message_event') THEN
        CREATE TYPE system_message_event AS ENUM ('BAN', 'DOC_EXPIRING', 'APPROVED');
    END IF;
END$$;

-- TABLE: messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL,
    sender_role message_sender_role NOT NULL,
    system_event system_message_event,
    sender_user_id UUID,
    receiver_user_id UUID,
    body TEXT NOT NULL,
    -- “Visto” (read receipts) agregados por papel (admin/driver).
    -- Motivo: pode existir mais de um admin; então não amarramos a um admin específico.
    read_by_admin_at TIMESTAMP,
    read_by_driver_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_message_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE
);

-- Se a tabela já existia, garante a coluna também
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS system_event system_message_event;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS read_by_admin_at TIMESTAMP;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS read_by_driver_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_messages_driver_id ON messages(driver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- SEED: conversa do admin com Rafael (inclui SYSTEM + ADMIN + DRIVER)
INSERT INTO messages (driver_id, sender_role, system_event, sender_user_id, receiver_user_id, body, created_at)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','SYSTEM','BAN', NULL, '22222222-2222-2222-2222-222222222222', 'Conta bloqueada: documento vencido. Atualize seus documentos para voltar a operar.', NOW() - INTERVAL '2 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','ADMIN', NULL, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Olá Rafael, vimos que um documento está vencido. Você consegue atualizar ainda hoje?', NOW() - INTERVAL '1 day 20 hours'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','DRIVER', NULL, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Olá! Sim, vou regularizar e te aviso assim que estiver ok.', NOW() - INTERVAL '1 day 18 hours')
ON CONFLICT DO NOTHING;
