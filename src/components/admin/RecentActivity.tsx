"use client";

import { useAuditLogs, AuditLog } from "@/hooks/use-audit";
import { formatDistanceToNow } from "date-fns";
import { 
  UserPlus, 
  UserX, 
  Calendar, 
  Clock, 
  Ban, 
  CheckCircle2, 
  Trash2, 
  ShieldCheck, 
  AlertCircle,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIVITY_ICONS: Record<string, any> = {
  'NEW_BOOKING': { icon: UserPlus, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  'UPDATE_BOOKING_STATUS': { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-500/10" },
  'WAITLIST_PROMOTION': { icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-500/10" },
  'CREATE_SCHEDULE': { icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-500/10" },
  'DELETE_SCHEDULE': { icon: Trash2, color: "text-red-600", bg: "bg-red-500/10" },
  'LOGIN_SUCCESS': { icon: ShieldCheck, color: "text-slate-600", bg: "bg-slate-500/10" },
  'LOGIN_FAILURE': { icon: AlertCircle, color: "text-red-600", bg: "bg-red-500/10" },
  'DEFAULT': { icon: Activity, color: "text-slate-400", bg: "bg-slate-500/5" }
};

function getActivityDescription(log: AuditLog) {
  const metadata = log.metadata || {};
  switch (log.action) {
    case 'NEW_BOOKING':
      return `New booking: ${metadata.client_name || 'Guest'}`;
    case 'UPDATE_BOOKING_STATUS':
      if (metadata.new_status === 'no-show') return `Marked as No Show`;
      if (metadata.new_status === 'cancelled') return `Cancelled appointment`;
      return `Status updated to ${metadata.new_status}`;
    case 'CREATE_SCHEDULE':
      return `Created session: ${metadata.title || 'New Schedule'}`;
    case 'DELETE_SCHEDULE':
      return `Removed session: ${metadata.title || 'Schedule'}`;
    case 'WAITLIST_PROMOTION':
      return `Promoted patient to confirmed`;
    case 'LOGIN_SUCCESS':
      return `Admin login`;
    default:
      return log.action.replace(/_/g, ' ').toLowerCase();
  }
}

export function RecentActivity() {
  const { data: logs, isLoading } = useAuditLogs(10);

  if (isLoading) {
    return (
      <div className="px-4 py-6 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-4 px-2">Recent Activity</p>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse px-2">
            <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-2 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Recent Activity</p>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <div className="space-y-1 py-2">
          {logs?.map((log) => {
            const config = ACTIVITY_ICONS[log.action] || ACTIVITY_ICONS.DEFAULT;
            const Icon = config.icon;
            
            return (
              <div 
                key={log.id} 
                className="flex items-start gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors group"
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-transparent shadow-sm", config.bg, config.color)}>
                  <Icon size={14} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate leading-tight">
                    {getActivityDescription(log)}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-[9px] text-muted-foreground font-medium truncate">
                      {log.actor_email?.split('@')[0] || 'System'}
                    </p>
                    <p className="text-[9px] text-muted-foreground/70 shrink-0 tabular-nums">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true }).replace('about ', '')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          
          {(!logs || logs.length === 0) && (
            <div className="text-center py-8">
              <p className="text-[10px] font-medium text-muted-foreground">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
