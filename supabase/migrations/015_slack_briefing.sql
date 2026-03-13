-- Migration 015: Slack Briefing
CREATE TABLE briefing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) UNIQUE,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  schedule_time TIME NOT NULL DEFAULT '08:00',
  channel_id VARCHAR(50) NOT NULL,
  include_appointments BOOLEAN NOT NULL DEFAULT TRUE,
  include_waitlist BOOLEAN NOT NULL DEFAULT TRUE,
  include_billing BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE briefing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  briefing_date DATE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  slack_message_ts VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE briefing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefing_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage briefing settings in their clinic" ON briefing_settings
  FOR ALL USING (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can view briefing logs in their clinic" ON briefing_logs
  FOR ALL USING (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
