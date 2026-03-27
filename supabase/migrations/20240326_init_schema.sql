-- Supabase Database Schema for Acupuncture Booking System

-- 0. Create schema
CREATE SCHEMA IF NOT EXISTS acupuncture_system;

-- 1. Create schedules table
CREATE TABLE IF NOT EXISTS acupuncture_system.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INTEGER NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 10,
    queue_enabled BOOLEAN NOT NULL DEFAULT true,
    price NUMERIC NOT NULL DEFAULT 0,
    payment_options TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'open',
    notes TEXT
);

-- 2. Create bookings table
CREATE TABLE IF NOT EXISTS acupuncture_system.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    schedule_id UUID NOT NULL REFERENCES acupuncture_system.schedules(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed',
    assigned_by TEXT NOT NULL DEFAULT 'client',
    reference_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add RLS Policies
ALTER TABLE acupuncture_system.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE acupuncture_system.bookings ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Public can view schedules" ON acupuncture_system.schedules;
DROP POLICY IF EXISTS "Clients can create bookings" ON acupuncture_system.bookings;
DROP POLICY IF EXISTS "Admin full access schedules" ON acupuncture_system.schedules;
DROP POLICY IF EXISTS "Admin full access bookings" ON acupuncture_system.bookings;

-- Authenticated admin: full access to everything
CREATE POLICY "Admin full access schedules"
ON acupuncture_system.schedules FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin full access bookings"
ON acupuncture_system.bookings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Public (anon): can view open schedules only
CREATE POLICY "Public can view open schedules"
ON acupuncture_system.schedules FOR SELECT
TO anon
USING (status = 'open');

-- Public (anon): can create bookings
CREATE POLICY "Public can create bookings"
ON acupuncture_system.bookings FOR INSERT
TO anon
WITH CHECK (true);

-- Public (anon): can view their own bookings (by email match or all for now)
CREATE POLICY "Public can view bookings"
ON acupuncture_system.bookings FOR SELECT
TO anon
USING (true);
