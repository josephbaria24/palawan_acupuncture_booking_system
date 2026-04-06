import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Schedule, ScheduleWithBookings, Booking, BookingStatus } from "../types/database";

// --- Schedules Hooks ---
export function useSchedules() {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*, bookings(id, status)')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as ScheduleWithBookings[];
    }
  });
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: ['schedule', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*, bookings(id, status)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as ScheduleWithBookings;
    },
    enabled: !!id
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Schedule, 'id' | 'created_at' | 'status'>) => {
      const { data: newSchedule, error } = await supabase
        .from('schedules')
        .insert([{ ...data, status: 'open' }])
        .select()
        .single();
      
      if (error) throw error;
      return newSchedule as Schedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    }
  });
}

export function useBulkCreateSchedules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Schedule, 'id' | 'created_at' | 'status'>[]) => {
      const { data: newSchedules, error } = await supabase
        .from('schedules')
        .insert(data.map(s => ({ ...s, status: 'open' })))
        .select();
      
      if (error) throw error;
      return newSchedules as Schedule[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    }
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Schedule> }) => {
      const { data: updatedSchedule, error } = await supabase
        .from('schedules')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedSchedule as Schedule;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedule', variables.id] });
    }
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    }
  });
}

// --- Bookings Hooks ---
export function useBookings(scheduleId?: string) {
  return useQuery({
    queryKey: ['bookings', scheduleId],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (scheduleId) {
        query = query.eq('schedule_id', scheduleId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Booking[];
    }
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Booking, 'id' | 'created_at' | 'queue_position' | 'reference_code'>) => {
      // Generate unique reference code: PA-XXXXXX
      const ref = `PA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const { data: newBooking, error } = await supabase
        .from('bookings')
        .insert([{ ...data, reference_code: ref }])
        .select()
        .single();
      
      if (error) throw error;
      return newBooking as Booking;
    },
    onSuccess: async (booking) => {
      // Fetch schedule for the email details
      const schedule = queryClient.getQueryData<ScheduleWithBookings[]>(['schedules'])?.find(s => s.id === booking.schedule_id);

      // Trigger Email Notification (non-blocking)
      fetch('/api/bookings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          booking, 
          schedule 
        }),
      }).catch(err => console.error("Email trigger failed:", err));

      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedule', booking.schedule_id] });
    }
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: BookingStatus }) => {
      const { data: updatedBooking, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedBooking as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    }
  });
}

export function useBookingByReference(referenceCode: string) {
  return useQuery({
    queryKey: ['booking', 'reference', referenceCode],
    queryFn: async () => {
      if (!referenceCode) return null;
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          schedules (*)
        `)
        .eq('reference_code', referenceCode.trim().toUpperCase())
        .maybeSingle();
      
      if (error) throw error;
      return data as (Booking & { schedules: Schedule });
    },
    enabled: !!referenceCode && referenceCode.length >= 6
  });
}

export function useAllBookings() {
  return useQuery({
    queryKey: ['bookings', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          schedules (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as (Booking & { schedules: Schedule })[];
    }
  });
}
