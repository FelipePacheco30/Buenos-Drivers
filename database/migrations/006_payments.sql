-- ================================
-- PAYMENTS / WALLET
-- ================================

-- ENUM: wallet_transaction_type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'wallet_transaction_type'
    ) THEN
        CREATE TYPE wallet_transaction_type AS ENUM ('CREDIT', 'DEBIT');
    END IF;
END$$;

-- TABLE: wallets
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

-- TABLE: wallet_transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY,
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

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id
    ON wallet_transactions(wallet_id);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type
    ON wallet_transactions(type);
