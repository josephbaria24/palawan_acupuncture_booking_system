-- Encrypted JSON payloads for patient intake forms (per client grouping key + form type)

CREATE TABLE IF NOT EXISTS acupuncture_system.patient_intake_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    client_key TEXT NOT NULL,
    form_type TEXT NOT NULL CHECK (form_type IN ('new_patient', 'follow_up')),
    payload_cipher TEXT NOT NULL,
    CONSTRAINT patient_intake_forms_client_form_unique UNIQUE (client_key, form_type)
);

CREATE INDEX IF NOT EXISTS idx_patient_intake_forms_client_key
  ON acupuncture_system.patient_intake_forms (client_key);

ALTER TABLE acupuncture_system.patient_intake_forms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access patient_intake_forms" ON acupuncture_system.patient_intake_forms;

CREATE POLICY "Admin full access patient_intake_forms"
ON acupuncture_system.patient_intake_forms FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
