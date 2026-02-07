CREATE TYPE notification_type AS ENUM ('SYSTEM', 'ADMIN');

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL,
    action VARCHAR(150) NOT NULL,
    target_id UUID,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_admin_action_user
        FOREIGN KEY (admin_id)
        REFERENCES users(id)
);
