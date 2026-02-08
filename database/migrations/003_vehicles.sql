-- ================================
-- VEHICLES
-- ================================

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY,
    driver_id UUID NOT NULL,
    plate VARCHAR(10) NOT NULL,
    model VARCHAR(100) NOT NULL,
    color VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_vehicle_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE
);

-- Garantir apenas um veículo ativo por motorista
CREATE UNIQUE INDEX IF NOT EXISTS idx_driver_vehicle_limit
ON vehicles(driver_id)
WHERE is_active = TRUE;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate);
