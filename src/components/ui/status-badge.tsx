import { ScheduleStatus, BookingStatus } from "@/types/database";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ScheduleBadge({ status, className }: { status: ScheduleStatus, className?: string }) {
  const styles = {
    open: "bg-emerald-100 text-emerald-800 border-emerald-200",
    full: "bg-orange-100 text-orange-800 border-orange-200",
    closed: "bg-gray-100 text-gray-800 border-gray-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200"
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border inline-flex items-center", styles[status], className)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function BookingBadge({ status, className }: { status: BookingStatus, className?: string }) {
  const styles = {
    confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    queued: "bg-amber-100 text-amber-800 border-amber-200",
    cancelled: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border inline-flex items-center", styles[status], className)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
