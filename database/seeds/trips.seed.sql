-- Corridas do Rafael (valor bruto 10, taxa 25%, motorista recebe 7.50)

INSERT INTO trips (
    driver_id,
    user_id,
    type,
    amount,
    platform_fee,
    driver_amount,
    status,
    completed_at
)
VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '55555555-5555-5555-5555-555555555555',
    'RIDE',
    10.00,
    2.50,
    7.50,
    'COMPLETED',
    NOW()
),
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '55555555-5555-5555-5555-555555555555',
    'DELIVERY',
    15.00,
    3.75,
    11.25,
    'COMPLETED',
    NOW()
);

-- Transações na carteira
INSERT INTO wallet_transactions (wallet_id, amount, type)
SELECT id, 7.50, 'CREDIT'
FROM wallets
WHERE driver_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

INSERT INTO wallet_transactions (wallet_id, amount, type)
SELECT id, 11.25, 'CREDIT'
FROM wallets
WHERE driver_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
