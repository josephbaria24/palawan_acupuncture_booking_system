"use client";

import { useSchedule, useBookings, useDeleteSchedule, useUpdateBookingStatus } from "@/hooks/use-acupuncture";
import { format } from "date-fns";
import { ArrowLeft, X, UserPlus, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import { toast } from "sonner";

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

  const [origin, setOrigin] = useState("");
  const qrCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

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
    try {
      await updateBookingStatus.mutateAsync({ id: bookingId, status });
      toast.success(`Booking ${status}`);
    } catch (error) {
      toast.error(`Failed to ${status} booking`);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this schedule? This will also remove any associated bookings and cannot be undone.")) return;
    try {
      await deleteSchedule.mutateAsync(id);
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
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              schedule.status === 'open' ? 'bg-emerald-100 text-emerald-800' :
              schedule.status === 'full' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {schedule.status}
            </span>
            
            <h1 className="text-2xl font-bold mt-4 tracking-tight">{schedule.title}</h1>
            <p className="text-muted-foreground font-medium text-sm mt-1 mb-6">
              {format(new Date(schedule.date), 'EEEE, MMMM do, yyyy')}
            </p>

            <div className="bg-secondary/10 rounded-2xl p-5 space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-muted-foreground">Time:</span>
                <span className="text-foreground tracking-tight">{formatTime12h(schedule.start_time)} - {formatTime12h(schedule.end_time)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-muted-foreground">Slot Duration:</span>
                <span className="text-foreground">{schedule.slot_duration} mins</span>
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

            <Button 
              variant="outline" 
              className="w-full rounded-xl text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 bg-transparent"
              onClick={handleDelete}
              disabled={deleteSchedule.isPending}
            >
              {deleteSchedule.isPending ? "Deleting..." : "Delete Schedule"}
            </Button>
          </div>

          <div className="bg-card rounded-3xl p-6 shadow-sm shadow-black/[0.02] border border-border/40 text-center">
            <h3 className="text-lg font-bold">Check-in QR</h3>
            <p className="text-[11px] text-muted-foreground mt-1 mb-4">Clients can scan this to book directly.</p>
            <div className="mx-auto w-40 h-40 bg-white border-2 border-secondary/20 rounded-2xl flex items-center justify-center p-3 relative overflow-hidden group">
              {origin ? (
                <QRCode value={bookingUrl} size={130} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
              ) : (
                <div className="w-full h-full bg-secondary/10 animate-pulse rounded-xl" />
              )}
              
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <Button size="sm" variant="secondary" className="h-8 text-xs font-bold w-24" onClick={() => navigator.clipboard.writeText(bookingUrl)}>
                  Copy Link
                </Button>
                <Button size="sm" className="h-8 text-xs font-bold w-24 bg-primary hover:bg-primary/90 text-white" onClick={handleDownloadQr}>
                  Download
                </Button>
              </div>
            </div>
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
