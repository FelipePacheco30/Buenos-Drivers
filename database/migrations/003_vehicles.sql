CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL,
    brand VARCHAR(80) NOT NULL,
    model VARCHAR(80) NOT NULL,
    plate VARCHAR(20) NOT NULL UNIQUE,
    year INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_vehicle_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE
);

-- Limite de 2 veículos por motorista
CREATE UNIQUE INDEX idx_driver_vehicle_limit
ON vehicles(driver_id)
WHERE is_active = TRUE;
