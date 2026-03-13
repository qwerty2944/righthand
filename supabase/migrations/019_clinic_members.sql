-- Migration 019: Clinic members & invitations (multi-clinic support)

-- 1. clinic_members: many-to-many relationship between users and clinics
CREATE TABLE clinic_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, clinic_id)
);

ALTER TABLE clinic_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view members in their clinic" ON clinic_members
  FOR SELECT USING (clinic_id IN (
    SELECT cm.clinic_id FROM clinic_members cm WHERE cm.user_id = auth.uid() AND cm.is_active = TRUE
  ));

CREATE POLICY "Owners can insert members" ON clinic_members
  FOR INSERT WITH CHECK (clinic_id IN (
    SELECT cm.clinic_id FROM clinic_members cm WHERE cm.user_id = auth.uid() AND cm.role = 'owner' AND cm.is_active = TRUE
  ));

CREATE POLICY "Owners can update members in their clinic" ON clinic_members
  FOR UPDATE USING (clinic_id IN (
    SELECT cm.clinic_id FROM clinic_members cm WHERE cm.user_id = auth.uid() AND cm.role = 'owner' AND cm.is_active = TRUE
  ));

-- 2. clinic_invitations: invitation codes and email invitations
CREATE TABLE clinic_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  email VARCHAR(255),
  code VARCHAR(8) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE clinic_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view invitations in their clinic" ON clinic_invitations
  FOR SELECT USING (clinic_id IN (
    SELECT cm.clinic_id FROM clinic_members cm WHERE cm.user_id = auth.uid() AND cm.is_active = TRUE
  ));

CREATE POLICY "Owners can insert invitations" ON clinic_invitations
  FOR INSERT WITH CHECK (clinic_id IN (
    SELECT cm.clinic_id FROM clinic_members cm WHERE cm.user_id = auth.uid() AND cm.role = 'owner' AND cm.is_active = TRUE
  ));

CREATE POLICY "Owners can update invitations" ON clinic_invitations
  FOR UPDATE USING (clinic_id IN (
    SELECT cm.clinic_id FROM clinic_members cm WHERE cm.user_id = auth.uid() AND cm.role = 'owner' AND cm.is_active = TRUE
  ));

-- Anyone can read invitations by code (for joining)
CREATE POLICY "Anyone can read invitation by code" ON clinic_invitations
  FOR SELECT USING (status = 'pending' AND expires_at > NOW());

-- 3. Make profiles.clinic_id nullable (general users have no clinic)
ALTER TABLE profiles ALTER COLUMN clinic_id DROP NOT NULL;

-- 4. Migrate existing profiles to clinic_members
INSERT INTO clinic_members (user_id, clinic_id, role, is_active, joined_at, created_at)
SELECT id, clinic_id, role, is_active, created_at, created_at
FROM profiles
WHERE clinic_id IS NOT NULL
ON CONFLICT (user_id, clinic_id) DO NOTHING;

-- 5. Update handle_new_user() trigger for role-based signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_clinic_id UUID;
  v_signup_role TEXT;
  v_invite_code TEXT;
  v_invitation RECORD;
BEGIN
  v_signup_role := COALESCE(NEW.raw_user_meta_data->>'signup_role', 'director');
  v_invite_code := NEW.raw_user_meta_data->>'invite_code';

  IF v_signup_role = 'director' THEN
    -- Director: create a new clinic
    INSERT INTO clinics (name, owner_name)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'clinic_name', 'My Clinic'),
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    )
    RETURNING id INTO v_clinic_id;

    -- Create profile with clinic
    INSERT INTO profiles (id, clinic_id, email, name, role)
    VALUES (
      NEW.id,
      v_clinic_id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      'owner'
    );

    -- Add to clinic_members
    INSERT INTO clinic_members (user_id, clinic_id, role)
    VALUES (NEW.id, v_clinic_id, 'owner');

  ELSIF v_signup_role = 'staff' AND v_invite_code IS NOT NULL THEN
    -- Staff: join via invitation code
    SELECT * INTO v_invitation
    FROM clinic_invitations
    WHERE code = v_invite_code
      AND status = 'pending'
      AND expires_at > NOW()
    LIMIT 1;

    IF v_invitation IS NOT NULL THEN
      v_clinic_id := v_invitation.clinic_id;

      -- Create profile with clinic
      INSERT INTO profiles (id, clinic_id, email, name, role)
      VALUES (
        NEW.id,
        v_clinic_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'staff'
      );

      -- Add to clinic_members
      INSERT INTO clinic_members (user_id, clinic_id, role)
      VALUES (NEW.id, v_clinic_id, 'staff');

      -- Mark invitation as accepted
      UPDATE clinic_invitations SET status = 'accepted', updated_at = NOW()
      WHERE id = v_invitation.id;
    ELSE
      -- Invalid code: create as general user (no clinic)
      INSERT INTO profiles (id, clinic_id, email, name, role)
      VALUES (
        NEW.id,
        NULL,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'staff'
      );
    END IF;

  ELSE
    -- General user: no clinic
    INSERT INTO profiles (id, clinic_id, email, name, role)
    VALUES (
      NEW.id,
      NULL,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      'staff'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
