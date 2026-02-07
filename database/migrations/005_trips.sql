CREATE TYPE trip_type AS ENUM ('RIDE', 'DELIVERY');
CREATE TYPE trip_status AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED');

CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL,
    user_id UUID NOT NULL,
    type trip_type NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    platform_fee NUMERIC(10,2) NOT NULL,
    driver_amount NUMERIC(10,2) NOT NULL,
    status trip_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,

    CONSTRAINT fk_trip_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id),

    CONSTRAINT fk_trip_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);
