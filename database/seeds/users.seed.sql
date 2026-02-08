-- ================================
-- USERS SEED (IDEMPOTENTE)
-- ================================

INSERT INTO users (
    id,
    name,
    email,
    password_hash,
    role,
    status,
    city,
    reputation_score
)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Admin Buenos',
    'admin@buenos.com',
    '$2b$10$adminhash',
    'ADMIN',
    'ACTIVE',
    'Buenos Aires',
    5.0
),
(
    '22222222-2222-2222-2222-222222222222',
    'Rafael Motorista',
    'rafael@buenos.com',
    '$2b$10$rafaelhash',
    'DRIVER',
    'ACTIVE',
    'Buenos Aires',
    4.9
),
(
    '33333333-3333-3333-3333-333333333333',
    'Henrique Motorista',
    'henrique@buenos.com',
    '$2b$10$henriquehash',
    'DRIVER',
    'IRREGULAR',
    'Buenos Aires',
    4.2
),
(
    '44444444-4444-4444-4444-444444444444',
    'Antonio Motorista',
    'antonio@buenos.com',
    '$2b$10$antoniohash',
    'DRIVER',
    'BANNED',
    'Buenos Aires',
    3.1
),
(
    '55555555-5555-5555-5555-555555555555',
    'Usuario Cliente',
    'cliente@buenos.com',
    '$2b$10$clientehash',
    'USER',
    'ACTIVE',
    'Buenos Aires',
    5.0
)
ON CONFLICT (id) DO NOTHING;
