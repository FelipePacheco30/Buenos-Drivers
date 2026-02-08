-- ================================
-- DRIVERS
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

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_active ON drivers(is_active);
