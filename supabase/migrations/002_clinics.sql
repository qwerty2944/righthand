-- Migration 002: Clinics
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  business_number VARCHAR(20) UNIQUE,
  address TEXT,
  phone VARCHAR(20),
  owner_name VARCHAR(50),
  license_number VARCHAR(30),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
