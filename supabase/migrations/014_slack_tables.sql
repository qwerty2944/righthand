-- Migration 014: Slack Tables
CREATE TABLE slack_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  team_id VARCHAR(50) NOT NULL,
  team_name VARCHAR(200) NOT NULL,
  bot_token TEXT NOT NULL,
  channel_id VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE slack_user_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  slack_user_id VARCHAR(50) NOT NULL,
  profile_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_slack_user UNIQUE (clinic_id, slack_user_id)
);

CREATE TABLE slack_event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE slack_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_user_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_event_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage slack in their clinic" ON slack_workspaces
  FOR ALL USING (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage slack mappings in their clinic" ON slack_user_mappings
  FOR ALL USING (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can view slack events in their clinic" ON slack_event_log
  FOR ALL USING (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
