// Database Types for Acupuncture Booking System

export type PaymentOption = 'cash' | 'card' | 'bank_transfer' | 'e_wallet' | 'pay_on_site';
export type ScheduleStatus = 'open' | 'full' | 'closed' | 'completed';
export type BookingStatus = 'confirmed' | 'queued' | 'cancelled';

export interface Schedule {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  slot_duration: number; // minutes
  capacity: number;
  queue_enabled: boolean;
  price: number;
  payment_options: PaymentOption[];
  notes: string;
  status: ScheduleStatus;
  created_at: string;
}

export interface Booking {
  id: string;
  schedule_id: string;
  client_name: string;
  phone: string;
  email: string;
  notes: string;
  status: BookingStatus;
  queue_position?: number;
  assigned_by: 'client' | 'admin';
  reference_code: string;
  created_at: string;
}
