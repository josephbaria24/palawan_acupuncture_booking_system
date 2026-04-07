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
      // Fetch user session to get the token for Authorization header
      const { data: { session } } = await supabase.auth.getSession();
      
      const url = scheduleId 
        ? `/api/admin/bookings?scheduleId=${scheduleId}`
        : '/api/admin/bookings';

      const response = await fetch(url, {
        headers: {
          'Authorization': session ? `Bearer ${session.access_token}` : '',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch bookings");
      }

      const data = await response.json();
      return data as Booking[];
    }
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Booking, 'id' | 'created_at' | 'queue_position' | 'reference_code'>) => {
      // Now using the secure backend API for encryption and creation
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit booking");
      }
      
      return response.json() as Promise<Booking>;
    },
    onSuccess: async (booking) => {
      // Fetch schedule for the email details (check both schedules and individual schedule cache)
      const schedules = queryClient.getQueryData<ScheduleWithBookings[]>(['schedules']);
      const schedule = schedules?.find(s => s.id === booking.schedule_id) || 
                       queryClient.getQueryData<ScheduleWithBookings>(['schedule', booking.schedule_id]);

      // Trigger Email Notification (non-blocking)
      fetch('/api/bookings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          booking, 
          schedule,
          type: booking.status === 'queued' ? 'waitlist' : 'confirmation'
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
      
      // Use the secure tracking API which handles decryption and masking on the server
      const response = await fetch(`/api/bookings/track/${referenceCode.trim().toUpperCase()}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch tracking details");
      }
      
      return response.json() as Promise<(Booking & { schedules: Schedule })>;
    },
    enabled: !!referenceCode && referenceCode.length >= 6
  });
}

export function useAllBookings() {
  return useQuery({
    queryKey: ['bookings', 'all'],
    queryFn: async () => {
      // Fetch user session to get the token for Authorization header
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/admin/bookings', {
        headers: {
          'Authorization': session ? `Bearer ${session.access_token}` : '',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch admin bookings");
      }

      return response.json() as Promise<(Booking & { schedules: Schedule })[]>;
    }
  });
}
