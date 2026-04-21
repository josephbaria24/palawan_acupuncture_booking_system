"use client";

import { useSchedule, useBookings, useDeleteSchedule, useUpdateBookingStatus, useUpdateSchedule } from "@/hooks/use-acupuncture";
import { useAuditLog } from "@/hooks/use-audit";
import { format } from "date-fns";
import { ArrowLeft, X, UserPlus, HelpCircle, Loader2, Calendar as CalendarIcon, Download, Share2, UserX, Ban, MapPin } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  const deleteSchedule = useDeleteSchedule();
  const updateBookingStatus = useUpdateBookingStatus();
  const updateSchedule = useUpdateSchedule();
  const { logAction } = useAuditLog();

  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const qrCardRef = useRef<HTMLDivElement>(null);

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

            <div className="pt-6 border-t border-border/40">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Admin Reminders</p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-xl h-10 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all font-bold text-[10px] flex items-center gap-2"
                  onClick={() => {
                    const date = new Date(schedule.date);
                    const [sh, sm] = (schedule.start_time || "08:00").split(':');
                    const [eh, em] = (schedule.end_time || "08:30").split(':');
                    
                    const start = new Date(date);
                    start.setHours(parseInt(sh), parseInt(sm), 0, 0);
                    
                    const end = new Date(date);
                    end.setHours(parseInt(eh), parseInt(em), 0, 0);

                    const googleUrl = generateGoogleCalendarUrl({
                      title: `ADMIN: ${schedule.title} (${occupiedCount}/${schedule.capacity} Booked)`,
                      description: `Palawan Acupuncture Session\nTotal booked: ${occupiedCount} users.\nhttps://palawan_acupuncture_booking_system.vercel.app/admin/schedules/${id}`,
                      location: "Palawan Clinic",
                      startTime: start.toISOString(),
                      endTime: end.toISOString()
                    });
                    window.open(googleUrl, '_blank');
                  }}
                >
                  <Share2 size={14} /> G-Calendar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-xl h-10 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all font-bold text-[10px] flex items-center gap-2"
                  onClick={() => {
                    const date = new Date(schedule.date);
                    const [sh, sm] = (schedule.start_time || "08:00").split(':');
                    const [eh, em] = (schedule.end_time || "08:30").split(':');
                    
                    const start = new Date(date);
                    start.setHours(parseInt(sh), parseInt(sm), 0, 0);
                    
                    const end = new Date(date);
                    end.setHours(parseInt(eh), parseInt(em), 0, 0);

                    downloadIcsFile({
                      title: `ADMIN: ${schedule.title} (${occupiedCount}/${schedule.capacity} Booked)`,
                      description: `Palawan Acupuncture Session\nTotal booked: ${occupiedCount} users.\nhttps://palawan_acupuncture_booking_system.vercel.app/admin/schedules/${id}`,
                      location: "Palawan Clinic",
                      startTime: start.toISOString(),
                      endTime: end.toISOString()
                    });
                  }}
                >
                  <Download size={14} /> Device Sync
                </Button>
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
                <Link href="/admin/assign" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
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
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Confirmed
                        </span>
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
    </div>
  );
}
