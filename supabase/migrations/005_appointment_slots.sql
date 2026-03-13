-- Migration 005: Appointment Slots
CREATE TABLE appointment_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_capacity INT NOT NULL DEFAULT 1,
  booked_count INT NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_slot UNIQUE (clinic_id, slot_date, start_time),
  CONSTRAINT chk_slot_time CHECK (end_time > start_time),
  CONSTRAINT chk_capacity CHECK (booked_count <= max_capacity)
);

ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage slots in their clinic" ON appointment_slots
  FOR ALL USING (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));
