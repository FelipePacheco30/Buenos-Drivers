-- Rafael
INSERT INTO drivers (id, user_id, total_trips, total_deliveries, daily_earnings, is_active)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    5,
    2,
    50.00,
    TRUE
);

-- Henrique
INSERT INTO drivers (id, user_id, total_trips, total_deliveries, daily_earnings, is_active)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '33333333-3333-3333-3333-333333333333',
    12,
    5,
    20.00,
    TRUE
);

-- Antônio (banido)
INSERT INTO drivers (id, user_id, total_trips, total_deliveries, daily_earnings, is_active)
VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '44444444-4444-4444-4444-444444444444',
    30,
    15,
    0.00,
    FALSE
);

-- Wallets
INSERT INTO wallets (driver_id, balance)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 50.00),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 20.00),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 0.00);
