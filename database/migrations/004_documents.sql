-- ================================
-- DOCUMENTS
-- ================================

-- ENUM: document_type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'document_type'
    ) THEN
        CREATE TYPE document_type AS ENUM ('CNH', 'VEHICLE_DOC', 'INSURANCE');
    END IF;
END$$;

-- ENUM: document_status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'document_status'
    ) THEN
        CREATE TYPE document_status AS ENUM ('VALID', 'EXPIRING', 'EXPIRED');
    END IF;
END$$;

-- TABLE: documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY,
    driver_id UUID NOT NULL,
    type document_type NOT NULL,
    status document_status NOT NULL DEFAULT 'VALID',
    expires_at DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_document_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_documents_driver_id ON documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_expires_at ON documents(expires_at);
