-- Migration 012: HIRA Codes
CREATE TABLE hira_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO hira_codes (code, name, category, unit_price) VALUES
  ('AA157', '초진 진찰료', '진찰료', 16760),
  ('AA257', '재진 진찰료', '진찰료', 11690),
  ('F1001', '일반 처방료', '처방료', 1100),
  ('E6541', '일반 혈액 검사', '검사료', 3990),
  ('E6542', '일반 화학 검사', '검사료', 5120);
