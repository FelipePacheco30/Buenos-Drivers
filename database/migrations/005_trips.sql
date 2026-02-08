-- ================================
-- TRIPS
-- ================================

-- ENUM: trip_type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'trip_type'
    ) THEN
        CREATE TYPE trip_type AS ENUM ('RIDE', 'DELIVERY');
    END IF;
END$$;

-- ENUM: trip_status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'trip_status'
    ) THEN
        CREATE TYPE trip_status AS ENUM (
            'PENDING',
            'ACCEPTED',
            'COMPLETED',
            'CANCELLED'
        );
    END IF;
END$$;

-- TABLE: trips
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY,
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

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_type ON trips(type);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at);
