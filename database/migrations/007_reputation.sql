CREATE TABLE IF NOT EXISTS reputations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    target_user_id UUID NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,

    CONSTRAINT fk_reputation_author
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_reputation_target
        FOREIGN KEY (target_user_id)
        REFERENCES users(id)
);
