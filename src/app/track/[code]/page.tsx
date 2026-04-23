"use client";

import { useParams, useRouter } from "next/navigation";
import { useBookingByReference } from "@/hooks/use-acupuncture";
import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatTime12h } from "@/utils/time";
import { downloadIcsFile, generateGoogleCalendarUrl } from "@/utils/calendar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  CircleDashed, 
  XCircle, 
  ArrowLeft,
  MapPin,
  Leaf,
  ChevronRight,
  ShieldCheck,
  Search,
  Download,
  Share2,
  CalendarCheck
} from "lucide-react";
import { CalendarSyncCard } from "@/components/calendar/CalendarSyncCard";

export default function TrackResultPage() {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();
  const { data: booking, isLoading, error } = useBookingByReference(code);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-primary"
          >
            <CircleDashed size={48} />
          </motion.div>
          <div className="text-center">
            <h2 className="text-xl font-bold">Verifying reference...</h2>
            <p className="text-muted-foreground">This will only take a moment.</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !booking) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 max-w-lg mx-auto text-center space-y-8">
          <div className="size-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center shadow-xl shadow-red-500/5">
            <XCircle size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-black tracking-tight">Booking Not Found</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We couldn't find any booking with reference <span className="font-bold text-foreground underline decoration-primary/30">{code}</span>. Please double-check your code and try again.
            </p>
          </div>
          <Button 
            onClick={() => router.push("/track")}
            className="rounded-2xl h-14 px-8 bg-foreground hover:bg-foreground/90 font-bold transition-all flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Back to Search
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const schedule = booking.schedules;
  const isConfirmed = booking.status === 'confirmed';
  const isQueued = booking.status === 'queued';
  const isCancelled = booking.status === 'cancelled';

  const statusSteps = [
    { label: "Booked", completed: true, active: false, icon: <Leaf size={16} /> },
    { label: "Pending", completed: isConfirmed, active: isQueued, icon: <CircleDashed size={16} /> },
    { label: "Confirmed", completed: isConfirmed, active: isConfirmed, icon: <ShieldCheck size={16} /> },
  ];

  const maskedName = booking.client_name;

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-16 space-y-8 md:space-y-12">
        
        {/* Header and Back Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <ShieldCheck size={14} /> Tracking Details
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tighter">
              Session for {maskedName}
            </h1>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => router.push("/track")}
            className="rounded-xl hover:bg-secondary/40 text-muted-foreground hover:text-foreground h-11 px-4 gap-2 border border-border/40 w-fit"
          >
            <Search size={16} /> Track another
          </Button>
        </div>

        {/* Status Stepper */}
        <div className="bg-card border border-border/40 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
            {statusSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-3 shrink-0">
                <div className={`size-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  step.completed ? 'bg-primary border-primary text-white' : 
                  step.active ? 'bg-amber-100 border-amber-500 text-amber-700 animate-pulse' : 
                  'bg-background border-border/40 text-muted-foreground'
                }`}>
                  {step.completed ? <CheckCircle2 size={20} /> : step.icon}
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-black uppercase tracking-widest ${step.completed || step.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">Step {index + 1}</span>
                </div>
                {index < statusSteps.length - 1 && (
                  <div className="ml-2 mr-1">
                    <ChevronRight size={14} className="text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
            isConfirmed ? 'bg-emerald-50/50 border-emerald-100/50' : 
            isQueued ? 'bg-amber-50/50 border-amber-100/50' : 
            booking.status === 'no-show' ? 'bg-orange-50/50 border-orange-100/50' :
            'bg-red-50/50 border-red-100/50'
          }`}>
            <div className="flex items-start gap-5">
              <div className={`size-14 rounded-full flex items-center justify-center shrink-0 border shadow-lg ${
                isConfirmed ? 'bg-emerald-500 text-white border-emerald-400' : 
                isQueued ? 'bg-amber-500 text-white border-amber-400' : 
                booking.status === 'no-show' ? 'bg-orange-500 text-white border-orange-400' :
                'bg-red-500 text-white border-red-400'
              }`}>
                {isConfirmed ? <CheckCircle2 size={28} /> : isQueued ? <CircleDashed size={28} className="animate-spin" /> : 
                 booking.status === 'no-show' ? <XCircle size={28} /> : <XCircle size={28} />}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">
                  Status: {isConfirmed ? 'Confirmed' : isQueued ? 'Waitlisted / Pending' : booking.status === 'no-show' ? 'No Show' : 'Cancelled'}
                </h2>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-sm">
                  {isConfirmed ? "Grateful to have you! Your appointment is locked and ready. See you at the clinic soon." : 
                   isQueued ? "You are on the waitlist. We will notify you immediately if a spot becomes available and your booking is confirmed." : 
                   booking.status === 'no-show' ? "This session was marked as a no-show. Please follow clinic policies or contact us for more information." :
                   "This session was cancelled. Please contact us for more information."}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white border border-border/40 shadow-sm min-w-[140px]">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Reference</span>
              <span className="text-lg font-black tracking-widest text-[#B79A7E]">{code}</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* Appointment Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border/40 rounded-[2.5rem] p-8 shadow-sm space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-secondary/30 flex items-center justify-center text-primary border border-secondary/40 shadow-sm">
                <Calendar size={20} />
              </div>
              <h3 className="text-lg font-bold">Appointment details</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-14 bg-primary text-white rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-lg shadow-primary/10">
                  <span className="text-[9px] uppercase font-bold tracking-widest">{format(new Date(schedule.date), 'MMM')}</span>
                  <span className="text-xl font-black">{format(new Date(schedule.date), 'dd')}</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Session</p>
                  <p className="text-base font-bold text-foreground leading-tight">{schedule.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/20">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 align-middle">
                    <Clock size={10} /> Schedule
                  </p>
                  <p className="font-bold text-sm">
                    {formatTime12h(schedule.start_time)} - {formatTime12h(schedule.end_time)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 align-middle">
                    <MapPin size={10} /> Location
                  </p>
                  <p className="font-bold text-sm">{schedule.location || "Palawan Clinic"}</p>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Patient Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-secondary/10 border border-secondary/30 rounded-[2.5rem] p-8 space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-white/60 flex items-center justify-center text-[#B79A7E] border border-white/50 shadow-sm">
                <User size={20} />
              </div>
              <h3 className="text-lg font-bold">Patient profile</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/45 border border-white/60">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Full name</p>
                <p className="font-bold text-base">{maskedName}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/45 border border-white/60">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Clinic Policy</p>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
                  "Please arrive 15 minutes before your slot. Masks are required. If you're on waitlist, stay near your phone for notifications."
                </p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Calendar Sync Section */}
        {isConfirmed && (
          <CalendarSyncCard 
            email={booking.email} 
            referenceCode={code}
            isConfirmed={isConfirmed} 
          />
        )}

        {/* Footer help */}
        <div className="text-center pt-8 border-t border-border/20">
          <p className="text-muted-foreground text-sm">Need to cancel or reschedule?</p>
          <p className="text-sm font-bold text-foreground mt-1">Contact us at +63 (000) 000-0000</p>
        </div>

      </div>
    </PublicLayout>
  );
}
