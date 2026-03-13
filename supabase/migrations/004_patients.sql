-- Migration 004: Patients
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  chart_number VARCHAR(20),
  name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  notes TEXT,
  kakao_user_id VARCHAR(100),
  consent_status JSONB DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_patients_chart UNIQUE (clinic_id, chart_number)
);

CREATE INDEX idx_patients_name_trgm ON patients USING GIN (name gin_trgm_ops);
CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_patients_embedding ON patients USING hnsw (embedding vector_cosine_ops);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view patients in their clinic" ON patients
  FOR SELECT USING (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert patients in their clinic" ON patients
  FOR INSERT WITH CHECK (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update patients in their clinic" ON patients
  FOR UPDATE USING (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
