-- ================================
-- NOTIFICATIONS
-- ================================

-- ENUM: notification_type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'notification_type'
    ) THEN
        CREATE TYPE notification_type AS ENUM ('SYSTEM', 'ADMIN');
    END IF;
END$$;

-- TABLE: notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    type notification_type NOT NULL DEFAULT 'SYSTEM',
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
    ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read
    ON notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
    ON notifications(created_at);
