-- Create clinic_locations table for auto-fill and reusable locations
CREATE TABLE IF NOT EXISTS acupuncture_system.clinic_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint on address to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_clinic_locations_address ON acupuncture_system.clinic_locations(address);

-- Insert a default location if none exists
INSERT INTO acupuncture_system.clinic_locations (name, address, is_default)
VALUES ('Main Clinic', 'Palawan Clinic', TRUE)
ON CONFLICT DO NOTHING;
