-- ================================
-- REPUTATION
-- ================================

CREATE TABLE IF NOT EXISTS reputation_logs (
    id UUID PRIMARY KEY,
    driver_id UUID NOT NULL,
    trip_id UUID,
    score NUMERIC(2,1) NOT NULL CHECK (score >= 0 AND score <= 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_reputation_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reputation_trip
        FOREIGN KEY (trip_id)
        REFERENCES trips(id)
        ON DELETE SET NULL
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_reputation_driver_id
    ON reputation_logs(driver_id);

CREATE INDEX IF NOT EXISTS idx_reputation_created_at
    ON reputation_logs(created_at);
