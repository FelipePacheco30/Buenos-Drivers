CREATE TYPE document_type AS ENUM ('CNH', 'VEHICLE_DOC', 'INSURANCE');
CREATE TYPE document_status AS ENUM ('VALID', 'EXPIRING', 'EXPIRED');

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL,
    type document_type NOT NULL,
    expiration_date DATE NOT NULL,
    status document_status NOT NULL DEFAULT 'VALID',
    validated_by_admin BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_document_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE
);
