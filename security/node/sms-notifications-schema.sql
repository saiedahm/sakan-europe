CREATE TABLE IF NOT EXISTS sakan_sms_notifications (
 id BIGSERIAL PRIMARY KEY,
 payment_reference TEXT NOT NULL UNIQUE,
 order_id TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('sending','sent','failed')),
 attempt_count INTEGER NOT NULL DEFAULT 1,
 twilio_message_sid TEXT NULL,
 sending_at TIMESTAMPTZ NULL,
 sent_at TIMESTAMPTZ NULL,
 last_error TEXT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS sakan_sms_notifications_created_at_idx ON sakan_sms_notifications(created_at DESC);
