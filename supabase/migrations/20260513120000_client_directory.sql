-- Standalone patient records (e.g. imported from paper) without requiring a booking

CREATE TABLE IF NOT EXISTS acupuncture_system.client_directory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    client_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_client_directory_created_at
  ON acupuncture_system.client_directory (created_at DESC);

ALTER TABLE acupuncture_system.client_directory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access client_directory" ON acupuncture_system.client_directory;

CREATE POLICY "Admin full access client_directory"
ON acupuncture_system.client_directory FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
