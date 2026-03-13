-- Migration 010: Billing Items
CREATE TABLE billing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  appointment_id UUID REFERENCES appointments(id),
  billing_code VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'confirmed', 'submitted', 'paid')),
  created_by UUID NOT NULL REFERENCES profiles(id),
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_billing_clinic ON billing_items(clinic_id);
CREATE INDEX idx_billing_patient ON billing_items(patient_id);
CREATE INDEX idx_billing_embedding ON billing_items USING hnsw (embedding vector_cosine_ops);

ALTER TABLE billing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage billing in their clinic" ON billing_items
  FOR ALL USING (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
