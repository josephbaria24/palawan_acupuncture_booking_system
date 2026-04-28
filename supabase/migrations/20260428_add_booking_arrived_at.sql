ALTER TABLE acupuncture_system.bookings
ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMPTZ;
