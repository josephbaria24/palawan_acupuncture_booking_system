-- Create the calendar_sync_settings table
CREATE TABLE IF NOT EXISTS acupuncture_system.calendar_sync_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_refresh_token TEXT,
    google_calendar_id TEXT DEFAULT 'primary',
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add google_event_id to schedules table
ALTER TABLE acupuncture_system.schedules ADD COLUMN IF NOT EXISTS google_event_id TEXT;

-- Create comment
COMMENT ON COLUMN acupuncture_system.schedules.google_event_id IS 'Stored ID of the corresponding Google Calendar event for real-time synchronization.';
