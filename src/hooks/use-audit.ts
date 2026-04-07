import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export type AuditAction = 
  | 'VIEW_PATIENT_LIST' 
  | 'VIEW_BOOKING_DETAILS' 
  | 'UPDATE_BOOKING_STATUS' 
  | 'DELETE_BOOKING'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE';

export function useAuditLog() {
  const { user } = useAuth();

  const logAction = async (
    action: AuditAction, 
    resourceId?: string, 
    resourceType?: string, 
    metadata?: any
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert([{
          actor_id: user.id,
          actor_email: user.email,
          action,
          resource_id: resourceId,
          resource_type: resourceType,
          metadata
        }]);
      
      if (error) console.error("Audit log failed:", error);
    } catch (err) {
      console.error("Audit log critical failed:", err);
    }
  };

  return { logAction };
}
