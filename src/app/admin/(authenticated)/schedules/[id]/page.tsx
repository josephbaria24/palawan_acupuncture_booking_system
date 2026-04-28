"use client";

import { useSchedule, useSchedules, useBookings, useDeleteSchedule, useUpdateBookingStatus, useUpdateSchedule, useRescheduleBooking, useMarkBookingArrived } from "@/hooks/use-acupuncture";
import { useAuditLog } from "@/hooks/use-audit";
import { format } from "date-fns";
import { ArrowLeft, X, UserPlus, HelpCircle, Loader2, Calendar as CalendarIcon, Download, Share2, UserX, Ban, MapPin, RefreshCw, Clock, Users, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState, useRef } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { downloadIcsFile, generateGoogleCalendarUrl } from "@/utils/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { formatTime12h } from "@/utils/time";
import { Badge } from "@/components/ui/badge";

export default function ScheduleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: schedule, isLoading: isScheduleLoading } = useSchedule(id);
  const { data: bookings, isLoading: isBookingsLoading } = useBookings(id);
  const { data: allSchedules } = useSchedules();
  const deleteSchedule = useDeleteSchedule();
  const updateBookingStatus = useUpdateBookingStatus();
  const updateSchedule = useUpdateSchedule();
  const rescheduleBooking = useRescheduleBooking();
  const markBookingArrived = useMarkBookingArrived();
  const { logAction } = useAuditLog();

  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const qrCardRef = useRef<HTMLDivElement>(null);
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // HIPAA Audit Logging: Log when patient list is viewed
  useEffect(() => {
    if (bookings && bookings.length > 0) {
      logAction('VIEW_PATIENT_LIST', id, 'schedule', { 
        patient_count: bookings.length,
        schedule_title: schedule?.title 
      });
    }
  }, [bookings, id]);

  if (isScheduleLoading) return <div className="p-8">Loading schedule...</div>;
  if (!schedule) return <div className="p-8">Schedule not found.</div>;

  const confirmedBookings = bookings?.filter(b => b.status === "confirmed") || [];
  const waitlistedBookings = bookings?.filter(b => b.status === "queued") || [];
  const occupiedCount = confirmedBookings.length;
  
  const bookingUrl = `${origin}/book/${id}`;

  const handleDownloadQr = async () => {
    if (!qrCardRef.current) return;
    try {
      const dataUrl = await toPng(qrCardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `PalawanAcupuncture-${format(new Date(schedule.date), 'yyyy-MM-dd')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate QR code image", err);
    }
  };

  const updateStatus = async (bookingId: string, status: any) => {
    if (status === 'cancelled' && !confirm("Are you sure you want to cancel this booking?")) return;
    if (status === 'no-show' && !confirm("Mark this patient as no-show?")) return;
    try {
      const booking = bookings?.find(b => b.id === bookingId);
      const prevStatus = booking?.status;

      await updateBookingStatus.mutateAsync({ id: bookingId, status });
      
      // If promoting from waitlist to confirmed, send email
      if (prevStatus === 'queued' && status === 'confirmed' && booking) {
        try {
          await fetch('/api/bookings/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking, schedule, type: 'promotion' }),
          });
        } catch (emailErr) {
          console.error("Failed to send promotion email:", emailErr);
        }
      }

      // Log Audit Event
      logAction('UPDATE_BOOKING_STATUS', bookingId, 'booking', { 
        new_status: status, 
        previous_status: prevStatus 
      });

      toast.success(`Booking ${status}`);
    } catch (error) {
      toast.error(`Failed to ${status} booking`);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this schedule? This will also remove any associated bookings and cannot be undone.")) return;
    try {
      await deleteSchedule.mutateAsync(id);
      
      logAction('DELETE_SCHEDULE', id, 'schedule', { 
        title: schedule?.title, 
        date: schedule?.date 
      });

      toast.success("Schedule deleted successfully");
      router.push('/admin/schedules');
    } catch (error) {
      toast.error("Failed to delete schedule");
      console.error(error);
    }
  };

  const handleMarkArrived = async (bookingId: string) => {
    const arrivedAt = new Date().toISOString();
    try {
      await markBookingArrived.mutateAsync({ id: bookingId, arrivedAt });
      logAction('UPDATE_BOOKING_STATUS', bookingId, 'booking', {
        update_type: 'arrival_check_in',
        arrived_at: arrivedAt,
        schedule_id: id,
      });
      toast.success("Arrival time recorded");
    } catch (error) {
      toast.error("Failed to record arrival");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <Link href="/admin/schedules" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back to Schedules
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="space-y-6">
          <div className="bg-card rounded-3xl p-6 shadow-sm shadow-black/[0.02] border border-border/40">
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                schedule.status === 'open' ? 'bg-emerald-100 text-emerald-800' :
                schedule.status === 'full' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {schedule.status}
              </span>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="waitlist-toggle" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer">Waitlist</Label>
                <Switch 
                  id="waitlist-toggle" 
                  checked={schedule.queue_enabled} 
                  disabled={updateSchedule.isPending}
                  onCheckedChange={async (checked) => {
                    try {
                      await updateSchedule.mutateAsync({ id, data: { queue_enabled: checked } });
                      toast.success(`Waitlist ${checked ? 'enabled' : 'disabled'}`);
                    } catch (err) {
                      toast.error("Failed to update waitlist setting");
                    }
                  }}
                  className="scale-75 origin-right"
                />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mt-4 tracking-tight">{schedule.title}</h1>
            <p className="text-muted-foreground font-medium text-sm mt-1 mb-6">
              {format(new Date(schedule.date), 'EEEE, MMMM do, yyyy')}
            </p>

            <div className="bg-secondary/10 rounded-2xl p-5 space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-muted-foreground">Time:</span>
                <span className="text-foreground tracking-tight">{formatTime12h(schedule.start_time)} - {formatTime12h(schedule.end_time)}</span>
              </div>
               <div className="flex justify-between items-start text-sm font-medium">
                <span className="text-muted-foreground">Session Duration:</span>
                <div className="text-right">
                  <span className="text-foreground font-bold block">45 mins Total</span>
                  <span className="text-[10px] text-muted-foreground block leading-tight mt-0.5">30m treatment • 15m assessment</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-muted-foreground">Location:</span>
                <span className="text-foreground tracking-tight flex items-center gap-1.5 transition-all">
                  <MapPin size={14} className="text-muted-foreground/70" />
                  {schedule.location || "Palawan Clinic"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-muted-foreground">Capacity:</span>
                <span className="text-foreground">{occupiedCount} / {schedule.capacity} Booked</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-bold text-foreground">₱{schedule.price}</span>
              </div>
            </div>


          </div>

          <Button 
            variant="outline" 
            className="w-full rounded-xl text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 bg-transparent"
            onClick={handleDelete}
            disabled={deleteSchedule.isPending}
          >
            {deleteSchedule.isPending ? "Deleting..." : "Delete Schedule"}
          </Button>
          
          <div className="bg-card rounded-3xl p-6 shadow-sm shadow-black/[0.02] border border-border/40 text-center">
            <h3 className="text-lg font-bold tracking-tight">Check-in QR</h3>
            <p className="text-[11px] text-muted-foreground mt-1 mb-4">Clients can scan this to book directly.</p>
            <div className="mx-auto w-40 h-40 bg-white border-2 border-secondary/20 rounded-2xl flex items-center justify-center p-3 mb-6">
              {origin ? (
                <QRCode value={bookingUrl} size={130} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
              ) : (
                <div className="w-full h-full bg-secondary/10 animate-pulse rounded-xl" />
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                size="sm" 
                variant="secondary" 
                className={`h-9 text-[10px] font-bold rounded-xl border border-border/50 transition-all ${copied ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : ''}`}
                onClick={() => {
                  navigator.clipboard.writeText(bookingUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                  toast.success("Booking link copied!");
                }}
              >
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button size="sm" className="h-9 text-[10px] font-bold rounded-xl bg-[#593f31] hover:bg-[#593f31]/90 text-white shadow-sm" onClick={handleDownloadQr}>
                Download
              </Button>
            </div>
          </div>

          {/* Hidden QR Export Card */}
          {origin && (
            <div className="absolute top-[-9999px] left-[-9999px]">
              <div ref={qrCardRef} className="bg-white p-8 rounded-3xl w-[400px] flex flex-col items-center justify-center font-sans tracking-tight">
                <h2 className="text-3xl font-black text-[#593f31] mb-8 tracking-tighter">Palawan Acupuncture</h2>
                <div className="bg-white p-2 rounded-2xl border-4 border-[#593f31]/10">
                  <QRCode value={bookingUrl} size={250} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                </div>
                <div className="mt-8 text-center text-[#593f31] font-bold text-xl leading-snug">
                  <p>{format(new Date(schedule.date), 'EEEE, MMMM do, yyyy')}</p>
                  <p className="mt-1 text-[#593f31]/70">{schedule.start_time} - {schedule.end_time}</p>
                </div>
                <div className="mt-8 pt-6 border-t border-[#593f31]/10 w-full text-center text-sm text-[#593f31]/50 font-black tracking-widest uppercase">
                  Scan to Book Session
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Patients */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-sm shadow-black/[0.02] border border-border/40">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold tracking-tight">Confirmed Patients ({occupiedCount})</h2>
                <Link href={`/admin/assign?scheduleId=${id}`} className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                  + Manually Assign
                </Link>
              </div>

              <div className="space-y-3">
                {isBookingsLoading ? (
                  <div className="text-center py-10 text-muted-foreground text-sm font-medium">Loading patients...</div>
                ) : confirmedBookings.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm font-medium border-2 border-dashed border-border rounded-2xl">
                    No confirmed patients for this session yet.
                  </div>
                ) : (
                  confirmedBookings.map((booking, index) => (
                    <div key={booking.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 hover:border-secondary/40 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center font-black text-foreground shrink-0 shadow-sm">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground text-sm truncate">{booking.client_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-muted-foreground truncate font-medium">
                            {booking.phone} • {booking.email}
                          </p>
                          <span className="px-1.5 py-0.5 rounded bg-muted text-[8px] font-bold text-muted-foreground tracking-widest">{booking.reference_code}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {booking.arrived_at ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            Arrived {format(new Date(booking.arrived_at), 'hh:mm a')}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkArrived(booking.id)}
                            disabled={markBookingArrived.isPending}
                            className="h-8 px-3 rounded-xl text-[10px] font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                          >
                            <CheckCircle2 size={12} className="mr-1" />
                            Arrived
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button 
                              className="w-8 h-8 rounded-full border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-border/40 shadow-xl">
                            <DropdownMenuItem 
                              className="gap-2 font-bold text-xs py-2.5 cursor-pointer text-primary focus:text-primary/80 focus:bg-primary/5"
                              onClick={() => {
                                setRescheduleBookingId(booking.id);
                                setRescheduleDialogOpen(true);
                              }}
                            >
                              <RefreshCw size={14} /> Reschedule
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 font-bold text-xs py-2.5 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                              onClick={() => updateStatus(booking.id, 'cancelled')}
                            >
                              <Ban size={14} /> Mark as Cancelled
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 font-bold text-xs py-2.5 cursor-pointer text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                              onClick={() => updateStatus(booking.id, 'no-show')}
                            >
                              <UserX size={14} /> Mark as No Show
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Waitlist / Queue Section */}
            {(waitlistedBookings.length > 0 || schedule.queue_enabled) && (
              <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-sm shadow-black/[0.02] border border-border/40">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-bold tracking-tight">Waitlist / Queue ({waitlistedBookings.length})</h2>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Chronological list of pending patients.</p>
                  </div>
                  {!schedule.queue_enabled && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Queue Disabled</Badge>
                  )}
                </div>

                <div className="space-y-3">
                  {waitlistedBookings.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-sm font-medium border-2 border-dashed border-border rounded-2xl bg-muted/5">
                      No patients currently on the waitlist.
                    </div>
                  ) : (
                    waitlistedBookings.map((booking, index) => (
                      <div key={booking.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/20 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center font-black text-amber-700 shrink-0 shadow-sm">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground text-sm truncate">{booking.client_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-muted-foreground truncate font-medium">
                              {booking.phone} • {booking.email}
                            </p>
                            <span className="px-1.5 py-0.5 rounded bg-muted text-[8px] font-bold text-muted-foreground tracking-widest">{booking.reference_code}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button 
                            size="sm" 
                            onClick={() => updateStatus(booking.id, 'confirmed')}
                            className="h-8 px-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-[10px] font-bold shadow-sm flex items-center gap-1.5"
                          >
                            <UserPlus size={12} /> Confirm
                          </Button>
                          <button 
                            onClick={() => updateStatus(booking.id, 'cancelled')}
                            className="w-8 h-8 rounded-full border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <X size={14} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[480px] rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Reschedule Patient</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Select an available schedule to move this patient to.
            </p>
          </DialogHeader>

          <div className="space-y-2 mt-4">
            {allSchedules
              ?.filter(s => s.id !== id && s.status === 'open')
              .sort((a, b) => new Date(`${a.date}T${a.start_time}`).getTime() - new Date(`${b.date}T${b.start_time}`).getTime())
              .map(s => {
                const occupied = s.bookings?.filter(b => b.status === "confirmed").length || 0;
                const isFull = occupied >= s.capacity;
                return (
                  <button
                    key={s.id}
                    disabled={isFull || rescheduleBooking.isPending}
                    onClick={async () => {
                      if (!rescheduleBookingId) return;
                      try {
                        await rescheduleBooking.mutateAsync({
                          bookingId: rescheduleBookingId,
                          newScheduleId: s.id
                        });
                        logAction('RESCHEDULE_BOOKING', rescheduleBookingId, 'booking', {
                          from_schedule: id,
                          to_schedule: s.id,
                        });
                        toast.success(`Patient rescheduled to ${format(new Date(s.date), 'MMM dd')} — ${s.title}`);
                        setRescheduleDialogOpen(false);
                        setRescheduleBookingId(null);
                      } catch (err) {
                        toast.error("Failed to reschedule");
                      }
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 group ${
                      isFull
                        ? "opacity-40 cursor-not-allowed border-border/30 bg-muted/10"
                        : "border-border/40 hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-sm"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/30 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-black text-muted-foreground uppercase leading-none">
                        {format(new Date(s.date), 'MMM')}
                      </span>
                      <span className="text-base font-black text-foreground leading-none">
                        {format(new Date(s.date), 'dd')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{s.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                          <Clock size={10} />
                          {formatTime12h(s.start_time)} - {formatTime12h(s.end_time)}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                          <Users size={10} />
                          <span className="font-bold">{occupied}/{s.capacity}</span>
                        </span>
                      </div>
                    </div>
                    {!isFull && (
                      <ChevronRight size={16} className="text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                    )}
                    {isFull && (
                      <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider shrink-0">Full</span>
                    )}
                  </button>
                );
              })
            }
            
            {(!allSchedules || allSchedules.filter(s => s.id !== id && s.status === 'open').length === 0) && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No other open schedules available.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border/30 mt-4">
            <Link
              href="/admin/schedules"
              onClick={() => setRescheduleDialogOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors"
            >
              <CalendarIcon size={16} />
              Create New Schedule
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
