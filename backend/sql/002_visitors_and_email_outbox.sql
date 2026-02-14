CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(32),
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  registration_status VARCHAR(20) NOT NULL DEFAULT 'pending_verification' CHECK (
    registration_status IN ('pending_verification', 'verified', 'cancelled')
  ),
  verification_token_hash VARCHAR(128) NOT NULL,
  verification_expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  qr_badge_code VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, email)
);

CREATE INDEX IF NOT EXISTS idx_visitors_event_id ON visitors(event_id);
CREATE INDEX IF NOT EXISTS idx_visitors_event_status ON visitors(event_id, registration_status);
CREATE INDEX IF NOT EXISTS idx_visitors_token_hash ON visitors(verification_token_hash);

CREATE TABLE IF NOT EXISTS email_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'failed')),
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_outbox_status_scheduled ON email_outbox(status, scheduled_at);
