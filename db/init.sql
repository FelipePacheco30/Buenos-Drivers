


CREATE EXTENSION IF NOT EXISTS pgcrypto;




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


CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);




INSERT INTO users (id, name, email, password, role, status, city, reputation_score) VALUES
('11111111-1111-1111-1111-111111111111','Admin Buenos','admin@buenos.com','admin123','ADMIN','ACTIVE','Buenos Aires',5.0),
('22222222-2222-2222-2222-222222222222','Rafael Pereira','rafael@buenos.com','driver123','DRIVER','ACTIVE','Buenos Aires',4.3),
('33333333-3333-3333-3333-333333333333','Henrique Silva','henrique@buenos.com','driver123','DRIVER','IRREGULAR','Buenos Aires',4.8),
('44444444-4444-4444-4444-444444444444','Antonio Ramírez','antonio@buenos.com','driver123','DRIVER','BANNED','Buenos Aires',4.6),
('66666666-6666-6666-6666-666666666666','Lucas Fernández','lucas@buenos.com','driver123','DRIVER','ACTIVE','Buenos Aires',4.8),
('77777777-7777-7777-7777-777777777777','Diego Morales','diego@buenos.com','driver123','DRIVER','IRREGULAR','Buenos Aires',4.5),
('88888888-8888-8888-8888-888888888888','Sofía Martínez','sofia@buenos.com','driver123','DRIVER','ACTIVE','Buenos Aires',4.7),
('99999999-9999-9999-9999-999999999999','Valentina Gómez','valentina@buenos.com','driver123','DRIVER','ACTIVE','Buenos Aires',4.6),
('12121212-1212-1212-1212-121212121212','Juan Castillo','juan@buenos.com','driver123','DRIVER','BANNED','Buenos Aires',3.7),
('13131313-1313-1313-1313-131313131313','Mateo Rojas','mateo@buenos.com','driver123','DRIVER','ACTIVE','Buenos Aires',4.5),
('14141414-1414-1414-1414-141414141414','Camila Duarte','camila@buenos.com','driver123','DRIVER','IRREGULAR','Buenos Aires',4.7),
('55555555-5555-5555-5555-555555555555','Usuario Cliente','cliente@buenos.com','user123','USER','ACTIVE','Buenos Aires',5.0)
ON CONFLICT (id) DO NOTHING;




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











CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plate VARCHAR(16) NOT NULL UNIQUE,
    brand VARCHAR(80) NOT NULL,
    kind VARCHAR(10) NOT NULL DEFAULT 'CAR',
    model VARCHAR(120) NOT NULL,
    year INTEGER NOT NULL,
    color VARCHAR(40) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_vehicle_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);


INSERT INTO vehicles (id, user_id, plate, brand, model, year, color)
VALUES
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1','22222222-2222-2222-2222-222222222222','RA482JL','Toyota','Corolla',2019,'Prata'),
('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1','33333333-3333-3333-3333-333333333333','HN193QW','Volkswagen','Gol',2018,'Branco'),
('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1','44444444-4444-4444-4444-444444444444','AN705PC','Renault','Kwid',2020,'Vermelho'),
('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1','66666666-6666-6666-6666-666666666666','LU318DM','Chevrolet','Onix',2021,'Azul'),
('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1','77777777-7777-7777-7777-777777777777','DG640TR','Fiat','Argo',2019,'Preto'),
('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1','88888888-8888-8888-8888-888888888888','SF257VK','Peugeot','208',2022,'Cinza'),
('10101010-aaaa-bbbb-cccc-101010101010','99999999-9999-9999-9999-999999999999','VL861NZ','Honda','City',2020,'Branco'),
('20202020-aaaa-bbbb-cccc-202020202020','12121212-1212-1212-1212-121212121212','JU094HB','Nissan','Versa',2017,'Preto'),
('30303030-aaaa-bbbb-cccc-303030303030','13131313-1313-1313-1313-131313131313','MT573GX','Ford','Ka',2018,'Prata'),
('40404040-aaaa-bbbb-cccc-404040404040','14141414-1414-1414-1414-141414141414','CM226FD','Hyundai','HB20',2021,'Azul'),


('50505050-aaaa-bbbb-cccc-505050505050','33333333-3333-3333-3333-333333333333','HP417KS','Volkswagen','Polo',2021,'Cinza'),
('60606060-aaaa-bbbb-cccc-606060606060','88888888-8888-8888-8888-888888888888','SO908TN','Citroën','C3',2020,'Vermelho')
ON CONFLICT (id) DO NOTHING;


DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE document_type AS ENUM ('CNH', 'CRLV', 'CRIMINAL_RECORD');
    END IF;
END$$;


DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
        CREATE TYPE document_status AS ENUM ('VALID', 'EXPIRING', 'EXPIRED');
    END IF;
END$$;


CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL,
    vehicle_id UUID,
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

    CONSTRAINT fk_document_vehicle
        FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_documents_driver_id ON documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_documents_vehicle_id ON documents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_expires_at ON documents(expires_at);




CREATE UNIQUE INDEX IF NOT EXISTS uq_docs_driver_cnh
  ON documents (driver_id)
  WHERE type = 'CNH' AND vehicle_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_docs_driver_criminal
  ON documents (driver_id)
  WHERE type = 'CRIMINAL_RECORD' AND vehicle_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_docs_vehicle_crlv
  ON documents (vehicle_id)
  WHERE type = 'CRLV' AND vehicle_id IS NOT NULL;




INSERT INTO documents (driver_id, vehicle_id, type, issued_at, expires_at, status)
VALUES

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, 'CNH', DATE '2024-01-10', DATE '2028-01-10', 'VALID'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, 'CRIMINAL_RECORD', DATE '2025-06-15', DATE '2027-06-15', 'VALID'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'CRLV', DATE '2025-03-01', DATE '2027-03-01', 'VALID'),


('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'CNH', DATE '2024-02-10', DATE '2028-02-10', 'VALID'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NULL, 'CRIMINAL_RECORD', DATE '2025-01-10', DATE '2027-01-10', 'VALID'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'CRLV', DATE '2025-02-10', DATE '2026-02-18', 'EXPIRING'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '50505050-aaaa-bbbb-cccc-505050505050', 'CRLV', DATE '2025-07-10', DATE '2027-07-10', 'VALID'),


('cccccccc-cccc-cccc-cccc-cccccccccccc', NULL, 'CNH', DATE '2022-03-10', DATE '2024-03-10', 'EXPIRED'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', NULL, 'CRIMINAL_RECORD', DATE '2025-03-10', DATE '2027-03-10', 'VALID'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'CRLV', DATE '2025-03-10', DATE '2027-03-10', 'VALID'),


('dddddddd-dddd-dddd-dddd-dddddddddddd', NULL, 'CNH', DATE '2024-04-10', DATE '2028-04-10', 'VALID'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', NULL, 'CRIMINAL_RECORD', DATE '2025-04-10', DATE '2027-04-10', 'VALID'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'CRLV', DATE '2025-04-10', DATE '2027-04-10', 'VALID'),


('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, 'CNH', DATE '2024-05-10', DATE '2028-05-10', 'VALID'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NULL, 'CRIMINAL_RECORD', DATE '2025-05-10', DATE '2027-05-10', 'VALID'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'CRLV', DATE '2025-05-10', DATE '2026-02-15', 'EXPIRING'),


('ffffffff-ffff-ffff-ffff-ffffffffffff', NULL, 'CNH', DATE '2024-06-10', DATE '2028-06-10', 'VALID'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', NULL, 'CRIMINAL_RECORD', DATE '2025-06-10', DATE '2027-06-10', 'VALID'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'CRLV', DATE '2025-06-10', DATE '2027-06-10', 'VALID'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '60606060-aaaa-bbbb-cccc-606060606060', 'CRLV', DATE '2025-06-10', DATE '2027-06-10', 'VALID'),


('10101010-1010-1010-1010-101010101010', NULL, 'CNH', DATE '2024-07-10', DATE '2028-07-10', 'VALID'),
('10101010-1010-1010-1010-101010101010', NULL, 'CRIMINAL_RECORD', DATE '2025-07-10', DATE '2027-07-10', 'VALID'),
('10101010-1010-1010-1010-101010101010', '10101010-aaaa-bbbb-cccc-101010101010', 'CRLV', DATE '2025-07-10', DATE '2027-07-10', 'VALID'),


('20202020-2020-2020-2020-202020202020', NULL, 'CNH', DATE '2024-08-10', DATE '2028-08-10', 'VALID'),
('20202020-2020-2020-2020-202020202020', NULL, 'CRIMINAL_RECORD', DATE '2025-08-10', DATE '2027-08-10', 'VALID'),
('20202020-2020-2020-2020-202020202020', '20202020-aaaa-bbbb-cccc-202020202020', 'CRLV', DATE '2025-08-10', DATE '2027-08-10', 'VALID'),


('30303030-3030-3030-3030-303030303030', NULL, 'CNH', DATE '2024-09-10', DATE '2028-09-10', 'VALID'),
('30303030-3030-3030-3030-303030303030', NULL, 'CRIMINAL_RECORD', DATE '2025-09-10', DATE '2027-09-10', 'VALID'),
('30303030-3030-3030-3030-303030303030', '30303030-aaaa-bbbb-cccc-303030303030', 'CRLV', DATE '2025-09-10', DATE '2027-09-10', 'VALID'),


('40404040-4040-4040-4040-404040404040', NULL, 'CNH', DATE '2024-10-10', DATE '2028-10-10', 'VALID'),
('40404040-4040-4040-4040-404040404040', NULL, 'CRIMINAL_RECORD', DATE '2025-10-10', DATE '2027-10-10', 'VALID'),
('40404040-4040-4040-4040-404040404040', '40404040-aaaa-bbbb-cccc-404040404040', 'CRLV', DATE '2025-10-10', DATE '2026-02-22', 'EXPIRING')
ON CONFLICT DO NOTHING;










DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trip_type') THEN
        CREATE TYPE trip_type AS ENUM ('RIDE', 'DELIVERY');
    END IF;
END$$;


DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trip_status') THEN
        CREATE TYPE trip_status AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    type trip_type NOT NULL,
    status trip_status NOT NULL DEFAULT 'PENDING',
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_trip_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_trip_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at);





DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wallet_transaction_type') THEN
        CREATE TYPE wallet_transaction_type AS ENUM ('CREDIT', 'DEBIT');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL UNIQUE,
    balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_wallet_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL,
    trip_id UUID,
    type wallet_transaction_type NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_transaction_wallet
        FOREIGN KEY (wallet_id)
        REFERENCES wallets(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_transaction_trip
        FOREIGN KEY (trip_id)
        REFERENCES trips(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id
    ON wallet_transactions(wallet_id);





CREATE TABLE IF NOT EXISTS negative_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL,
    user_id UUID,
    reason TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_neg_review_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_neg_review_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_negative_reviews_driver_id ON negative_reviews(driver_id);
CREATE INDEX IF NOT EXISTS idx_negative_reviews_created_at ON negative_reviews(created_at);





INSERT INTO wallets (driver_id, balance)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 50.00),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 50.00),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 50.00),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 50.00),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 50.00),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 50.00),
('10101010-1010-1010-1010-101010101010', 50.00),
('20202020-2020-2020-2020-202020202020', 50.00),
('30303030-3030-3030-3030-303030303030', 50.00),
('40404040-4040-4040-4040-404040404040', 50.00)
ON CONFLICT (driver_id) DO NOTHING;


INSERT INTO trips (id, user_id, driver_id, type, status, origin, destination, price, completed_at)
VALUES
('b0b0b0b0-0000-0000-0000-000000000001','55555555-5555-5555-5555-555555555555','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','RIDE','COMPLETED','Centro','Palermo',10.00, NOW() - INTERVAL '5 days'),
('b0b0b0b0-0000-0000-0000-000000000002','55555555-5555-5555-5555-555555555555','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','DELIVERY','COMPLETED','Recoleta','Belgrano',12.00, NOW() - INTERVAL '4 days'),
('b0b0b0b0-0000-0000-0000-000000000003','55555555-5555-5555-5555-555555555555','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','RIDE','COMPLETED','San Telmo','Microcentro',9.00, NOW() - INTERVAL '3 days'),
('b0b0b0b0-0000-0000-0000-000000000004','55555555-5555-5555-5555-555555555555','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','DELIVERY','COMPLETED','Caballito','Almagro',11.00, NOW() - INTERVAL '2 days'),
('b0b0b0b0-0000-0000-0000-000000000005','55555555-5555-5555-5555-555555555555','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','RIDE','COMPLETED','Retiro','Puerto Madero',10.00, NOW() - INTERVAL '1 days')
ON CONFLICT (id) DO NOTHING;


INSERT INTO wallet_transactions (wallet_id, trip_id, type, amount, created_at)
SELECT w.id, t.id, 'CREDIT', ROUND(t.price * 0.75, 2), t.completed_at
FROM wallets w
JOIN trips t ON t.driver_id = w.driver_id
WHERE w.driver_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
  AND t.id IN (
    'b0b0b0b0-0000-0000-0000-000000000001',
    'b0b0b0b0-0000-0000-0000-000000000002',
    'b0b0b0b0-0000-0000-0000-000000000003',
    'b0b0b0b0-0000-0000-0000-000000000004',
    'b0b0b0b0-0000-0000-0000-000000000005'
  )
ON CONFLICT DO NOTHING;


INSERT INTO negative_reviews (driver_id, user_id, reason, created_at)
VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','55555555-5555-5555-5555-555555555555','Comentários inadequados durante a corrida.', NOW() - INTERVAL '3 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','55555555-5555-5555-5555-555555555555','Direção agressiva (frenagens bruscas).', NOW() - INTERVAL '1 days')
ON CONFLICT DO NOTHING;







DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'renewal_status') THEN
        CREATE TYPE renewal_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS renewals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status renewal_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_renewal_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_renewal_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_renewals_driver_id ON renewals(driver_id);
CREATE INDEX IF NOT EXISTS idx_renewals_status ON renewals(status);
CREATE INDEX IF NOT EXISTS idx_renewals_created_at ON renewals(created_at);

CREATE TABLE IF NOT EXISTS renewal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    renewal_id UUID NOT NULL,
    type document_type NOT NULL,
    vehicle_id UUID,
    issued_at DATE NOT NULL,
    expires_at DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_renewal_doc_renewal
        FOREIGN KEY (renewal_id)
        REFERENCES renewals(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_renewal_doc_vehicle
        FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_renewal_docs_renewal_id ON renewal_documents(renewal_id);

CREATE TABLE IF NOT EXISTS renewal_vehicle_add (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    renewal_id UUID NOT NULL UNIQUE,
    plate VARCHAR(16) NOT NULL,
    brand VARCHAR(80) NOT NULL,
    kind VARCHAR(10) NOT NULL DEFAULT 'CAR',
    model VARCHAR(120) NOT NULL,
    year INTEGER NOT NULL,
    color VARCHAR(40) NOT NULL,
    crlv_issued_at DATE NOT NULL,
    crlv_expires_at DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_renewal_vehicle_renewal
        FOREIGN KEY (renewal_id)
        REFERENCES renewals(id)
        ON DELETE CASCADE
);



DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_sender_role') THEN
        CREATE TYPE message_sender_role AS ENUM ('SYSTEM', 'ADMIN', 'DRIVER');
    END IF;
END$$;


DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'system_message_event') THEN
        CREATE TYPE system_message_event AS ENUM ('BAN', 'DOC_EXPIRING', 'APPROVED', 'BAN_DOCS', 'REPUTATION_SUSPEND', 'REPUTATION_WARNING');
    END IF;
END$$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'system_message_event') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_type t
            JOIN pg_enum e ON e.enumtypid = t.oid
            WHERE t.typname = 'system_message_event' AND e.enumlabel = 'BAN_DOCS'
        ) THEN
            EXECUTE 'ALTER TYPE system_message_event ADD VALUE ''BAN_DOCS''';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_type t
            JOIN pg_enum e ON e.enumtypid = t.oid
            WHERE t.typname = 'system_message_event' AND e.enumlabel = 'REPUTATION_SUSPEND'
        ) THEN
            EXECUTE 'ALTER TYPE system_message_event ADD VALUE ''REPUTATION_SUSPEND''';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_type t
            JOIN pg_enum e ON e.enumtypid = t.oid
            WHERE t.typname = 'system_message_event' AND e.enumlabel = 'REPUTATION_WARNING'
        ) THEN
            EXECUTE 'ALTER TYPE system_message_event ADD VALUE ''REPUTATION_WARNING''';
        END IF;
    END IF;
END$$;


CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL,
    sender_role message_sender_role NOT NULL,
    system_event system_message_event,
    sender_user_id UUID,
    receiver_user_id UUID,
    body TEXT NOT NULL,
    
    
    read_by_admin_at TIMESTAMP,
    read_by_driver_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_message_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE
);


ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS system_event system_message_event;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS read_by_admin_at TIMESTAMP;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS read_by_driver_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_messages_driver_id ON messages(driver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);


INSERT INTO messages (driver_id, sender_role, system_event, sender_user_id, receiver_user_id, body, created_at)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','SYSTEM','BAN', NULL, '22222222-2222-2222-2222-222222222222', 'Conta bloqueada: documento vencido. Atualize seus documentos para voltar a operar.', NOW() - INTERVAL '2 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','ADMIN', NULL, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Olá Rafael, vimos que um documento está vencido. Você consegue atualizar ainda hoje?', NOW() - INTERVAL '1 day 20 hours'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','DRIVER', NULL, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Olá! Sim, vou regularizar e te aviso assim que estiver ok.', NOW() - INTERVAL '1 day 18 hours')
ON CONFLICT DO NOTHING;
