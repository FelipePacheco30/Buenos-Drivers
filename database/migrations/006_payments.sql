CREATE TYPE wallet_transaction_type AS ENUM ('CREDIT', 'DEBIT');

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL UNIQUE,
    balance NUMERIC(10,2) DEFAULT 0,

    CONSTRAINT fk_wallet_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL,
    trip_id UUID,
    amount NUMERIC(10,2) NOT NULL,
    type wallet_transaction_type NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_transaction_wallet
        FOREIGN KEY (wallet_id)
        REFERENCES wallets(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_transaction_trip
        FOREIGN KEY (trip_id)
        REFERENCES trips(id)
);
