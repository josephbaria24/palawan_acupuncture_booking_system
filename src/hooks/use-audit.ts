import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type AuditAction = 
  | 'VIEW_PATIENT_LIST' 
  | 'VIEW_BOOKING_DETAILS' 
  | 'UPDATE_BOOKING_STATUS' 
  | 'DELETE_BOOKING'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'CREATE_SCHEDULE'
  | 'UPDATE_SCHEDULE'
  | 'DELETE_SCHEDULE'
  | 'NEW_BOOKING'
  | 'WAITLIST_PROMOTION'
  | 'RESCHEDULE_BOOKING';

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: AuditAction;
  resource_id: string | null;
  resource_type: string | null;
  metadata: any;
  created_at: string;
}

export function useAuditLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const logAction = async (
    action: AuditAction, 
    resourceId?: string, 
    resourceType?: string, 
    metadata?: any
  ) => {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert([{
          actor_id: user?.id || null,
          actor_email: user?.email || 'System / Public',
          action,
          resource_id: resourceId,
          resource_type: resourceType,
          metadata
        }]);
      
      if (error) {
        console.error("Audit log failed:", error);
      } else {
        // Invalidate the audit logs query whenever a new action is logged
        queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
      }
    } catch (err) {
      console.error("Audit log critical failed:", err);
    }
  };

  return { logAction };
}

export function useAuditLogs(limit = 15) {
  return useQuery({
    queryKey: ['audit_logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as AuditLog[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
  });
}
