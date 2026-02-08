-- ================================
-- TRIPS SEED (IDEMPOTENTE)
-- ================================

INSERT INTO trips (
    id,
    user_id,
    driver_id,
    type,
    status,
    origin,
    destination,
    price,
    completed_at
)
VALUES
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '55555555-5555-5555-5555-555555555555',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'RIDE',
    'COMPLETED',
    'Centro',
    'Palermo',
    25.00,
    NOW() - INTERVAL '2 days'
),
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '55555555-5555-5555-5555-555555555555',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'DELIVERY',
    'COMPLETED',
    'Recoleta',
    'Belgrano',
    15.00,
    NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;
