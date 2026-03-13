-- Migration 017: Fix vector dimensions (1536 -> 384)
-- The multilingual-e5-small model produces 384-dimensional embeddings

-- Drop existing indexes
DROP INDEX IF EXISTS idx_patients_embedding;
DROP INDEX IF EXISTS idx_appointments_embedding;
DROP INDEX IF EXISTS idx_billing_items_embedding;
DROP INDEX IF EXISTS idx_medical_records_embedding;

-- Alter columns: drop the 1536-dim column and recreate as 384-dim
-- (existing embeddings are invalid anyway due to dimension mismatch)
ALTER TABLE patients DROP COLUMN IF EXISTS embedding;
ALTER TABLE patients ADD COLUMN embedding vector(384);

ALTER TABLE appointments DROP COLUMN IF EXISTS embedding;
ALTER TABLE appointments ADD COLUMN embedding vector(384);

ALTER TABLE billing_items DROP COLUMN IF EXISTS embedding;
ALTER TABLE billing_items ADD COLUMN embedding vector(384);

ALTER TABLE medical_records DROP COLUMN IF EXISTS embedding;
ALTER TABLE medical_records ADD COLUMN embedding vector(384);

-- Recreate HNSW indexes
CREATE INDEX idx_patients_embedding ON patients USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_appointments_embedding ON appointments USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_billing_items_embedding ON billing_items USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_medical_records_embedding ON medical_records USING hnsw (embedding vector_cosine_ops);

-- Recreate search function with correct dimensions
CREATE OR REPLACE FUNCTION search_by_embedding(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  p_clinic_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  source_table text,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    SELECT p.id, 'patients'::text AS source_table,
      format('Patient: %s | Chart: %s | DOB: %s | Phone: %s | Notes: %s',
        p.name,
        COALESCE(p.chart_number, '-'),
        p.birth_date,
        COALESCE(p.phone, '-'),
        COALESCE(p.notes, '')
      ) AS content,
      1 - (p.embedding <=> query_embedding) AS similarity
    FROM patients p
    WHERE p.embedding IS NOT NULL
      AND (p_clinic_id IS NULL OR p.clinic_id = p_clinic_id)
      AND p.deleted_at IS NULL
    UNION ALL
    SELECT a.id, 'appointments'::text,
      format('Appointment: %s %s-%s | Status: %s | Notes: %s',
        a.appointment_date, a.start_time, a.end_time,
        a.status,
        COALESCE(a.notes, '')
      ) AS content,
      1 - (a.embedding <=> query_embedding) AS similarity
    FROM appointments a
    WHERE a.embedding IS NOT NULL
      AND (p_clinic_id IS NULL OR a.clinic_id = p_clinic_id)
    UNION ALL
    SELECT b.id, 'billing_items'::text,
      format('Billing: %s - %s | Amount: %s | Status: %s',
        b.billing_code, b.description, b.amount, b.status
      ) AS content,
      1 - (b.embedding <=> query_embedding) AS similarity
    FROM billing_items b
    WHERE b.embedding IS NOT NULL
      AND (p_clinic_id IS NULL OR b.clinic_id = p_clinic_id)
    UNION ALL
    SELECT m.id, 'medical_records'::text,
      format('Record: CC: %s | S: %s | O: %s | A: %s | P: %s',
        COALESCE(m.chief_complaint,''),
        COALESCE(m.subjective,''),
        COALESCE(m.objective,''),
        COALESCE(m.assessment,''),
        COALESCE(m.plan,'')
      ) AS content,
      1 - (m.embedding <=> query_embedding) AS similarity
    FROM medical_records m
    WHERE m.embedding IS NOT NULL
      AND (p_clinic_id IS NULL OR m.clinic_id = p_clinic_id)
      AND m.deleted_at IS NULL
  ) combined
  WHERE combined.similarity >= match_threshold
  ORDER BY combined.similarity DESC
  LIMIT match_count;
END;
$$;
