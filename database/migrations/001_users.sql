CREATE TYPE user_role AS ENUM ('USER', 'DRIVER', 'ADMIN');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'IRREGULAR', 'BANNED');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    status user_status NOT NULL DEFAULT 'ACTIVE',
    city VARCHAR(100),
    reputation_score NUMERIC(3,2) DEFAULT 5.0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
