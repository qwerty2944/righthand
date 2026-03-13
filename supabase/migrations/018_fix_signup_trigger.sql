-- Migration 018: Fix signup trigger to auto-create clinic
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_clinic_id UUID;
BEGIN
  IF NEW.raw_user_meta_data->>'clinic_id' IS NOT NULL THEN
    v_clinic_id := (NEW.raw_user_meta_data->>'clinic_id')::UUID;
  ELSE
    INSERT INTO clinics (name, owner_name)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'clinic_name', 'My Clinic'),
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    )
    RETURNING id INTO v_clinic_id;
  END IF;

  INSERT INTO profiles (id, clinic_id, email, name, role)
  VALUES (
    NEW.id,
    v_clinic_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'owner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
