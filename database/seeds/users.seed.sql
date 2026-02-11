
-- ================================
-- USERS SEED (IDEMPOTENTE)
-- Login simples (SEM bcrypt / SEM jwt)
-- ================================

INSERT INTO users (
    id,
    name,
    email,
    password,
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
    'admin123',
    'ADMIN',
    'ACTIVE',
    'Buenos Aires',
    5.0
),
(
    '22222222-2222-2222-2222-222222222222',
    'Rafael Motorista',
    'rafael@buenos.com',
    'driver123',
    'DRIVER',
    'ACTIVE',
    'Buenos Aires',
    4.9
),
(
    '33333333-3333-3333-3333-333333333333',
    'Henrique Motorista',
    'henrique@buenos.com',
    'driver123',
    'DRIVER',
    'IRREGULAR',
    'Buenos Aires',
    4.2
),
(
    '44444444-4444-4444-4444-444444444444',
    'Antonio Motorista',
    'antonio@buenos.com',
    'driver123',
    'DRIVER',
    'BANNED',
    'Buenos Aires',
    3.1
),
(
    '66666666-6666-6666-6666-666666666666',
    'Lucas Motorista',
    'lucas@buenos.com',
    'driver123',
    'DRIVER',
    'ACTIVE',
    'Buenos Aires',
    4.8
),
(
    '77777777-7777-7777-7777-777777777777',
    'Diego Motorista',
    'diego@buenos.com',
    'driver123',
    'DRIVER',
    'IRREGULAR',
    'Buenos Aires',
    4.1
),
(
    '88888888-8888-8888-8888-888888888888',
    'Sofia Motorista',
    'sofia@buenos.com',
    'driver123',
    'DRIVER',
    'ACTIVE',
    'Buenos Aires',
    4.7
),
(
    '99999999-9999-9999-9999-999999999999',
    'Valentina Motorista',
    'valentina@buenos.com',
    'driver123',
    'DRIVER',
    'ACTIVE',
    'Buenos Aires',
    4.6
),
(
    '12121212-1212-1212-1212-121212121212',
    'Juan Motorista',
    'juan@buenos.com',
    'driver123',
    'DRIVER',
    'BANNED',
    'Buenos Aires',
    3.7
),
(
    '13131313-1313-1313-1313-131313131313',
    'Mateo Motorista',
    'mateo@buenos.com',
    'driver123',
    'DRIVER',
    'ACTIVE',
    'Buenos Aires',
    4.5
),
(
    '14141414-1414-1414-1414-141414141414',
    'Camila Motorista',
    'camila@buenos.com',
    'driver123',
    'DRIVER',
    'IRREGULAR',
    'Buenos Aires',
    4.0
),
(
    '55555555-5555-5555-5555-555555555555',
    'Usuario Cliente',
    'cliente@buenos.com',
    'user123',
    'USER',
    'ACTIVE',
    'Buenos Aires',
    5.0
)
ON CONFLICT (id) DO NOTHING;