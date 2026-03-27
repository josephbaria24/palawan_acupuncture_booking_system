import { useParams, Link } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useSchedule, useBookings, useUpdateBookingStatus, useDeleteSchedule } from "@/hooks/use-acupuncture";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { ScheduleBadge, BookingBadge } from "@/components/ui/status-badge";
import { ArrowLeft, Clock, Copy, Download, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ScheduleDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: schedule, isLoading: loadingSchedule } = useSchedule(id);
  const { data: allBookings = [], isLoading: loadingBookings } = useBookings(id);
  const updateBooking = useUpdateBookingStatus();
  const deleteSchedule = useDeleteSchedule();
  const { toast } = useToast();

  if (loadingSchedule || loadingBookings) return <AdminLayout><div className="p-8 animate-pulse text-muted-foreground">Loading details...</div></AdminLayout>;
  if (!schedule) return <AdminLayout><div className="p-8 text-destructive font-bold">Schedule not found</div></AdminLayout>;

  const bookings = allBookings.filter(b => b.status === 'confirmed');
  const queue = allBookings.filter(b => b.status === 'queued').sort((a, b) => (a.queue_position || 99) - (b.queue_position || 99));

  const publicLink = `${window.location.origin}/book/${schedule.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicLink);
    toast({ title: "Copied!", description: "Link copied to clipboard." });
  };

  const promoteQueue = (bookingId: string) => {
    if (bookings.length >= schedule.capacity) {
      toast({ title: "Cannot promote", description: "Schedule is already at maximum capacity.", variant: "destructive" });
      return;
    }
    updateBooking.mutate({ id: bookingId, status: 'confirmed' });
    toast({ title: "Client Promoted", description: "Client moved from queue to confirmed." });
  };

  const cancelBooking = (bookingId: string) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      updateBooking.mutate({ id: bookingId, status: 'cancelled' });
      toast({ title: "Booking Cancelled" });
    }
  };

  const handleDelete = () => {
    if (confirm("DANGER: Are you sure you want to delete this schedule and all its bookings?")) {
      deleteSchedule.mutate(schedule.id, {
        onSuccess: () => {
          window.location.href = "/admin/schedules";
        }
      });
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <Link href="/admin/schedules" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Schedules
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Info & QR */}
        <div className="space-y-8">
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
            <div className="flex justify-between items-start mb-4">
              <ScheduleBadge status={schedule.status} />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">{schedule.title || 'Session'}</h1>
            <p className="text-muted-foreground font-medium mb-6">
              {format(new Date(schedule.date), 'EEEE, MMMM do, yyyy')}
            </p>
            
            <div className="space-y-4 text-sm bg-background p-4 rounded-xl border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-semibold">{schedule.start_time} - {schedule.end_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slot Duration:</span>
                <span className="font-semibold">{schedule.slot_duration} mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacity:</span>
                <span className="font-semibold">{bookings.length} / {schedule.capacity} Booked</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-bold text-primary">₱{schedule.price}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <button onClick={handleDelete} className="w-full py-2.5 rounded-xl border-2 border-destructive text-destructive font-semibold hover:bg-destructive hover:text-white transition-colors flex justify-center items-center gap-2">
                <Trash2 size={16} /> Delete Schedule
              </button>
            </div>
          </div>

          {/* QR Code Card */}
          <div className="glass-card rounded-3xl p-6 text-center flex flex-col items-center">
            <h3 className="font-display font-bold text-lg mb-2">Check-in QR</h3>
            <p className="text-xs text-muted-foreground mb-6">Clients can scan this to book directly.</p>
            
            <div className="p-4 bg-white rounded-2xl border-4 border-secondary inline-block mb-6 shadow-xl shadow-secondary/50">
               <QRCodeSVG value={publicLink} size={160} fgColor="#050505" />
            </div>

            <div className="flex w-full gap-2">
              <button onClick={copyLink} className="flex-1 py-2 bg-secondary text-primary font-semibold rounded-xl hover:bg-secondary/80 transition-colors flex justify-center items-center gap-2">
                <Copy size={16} /> Copy URL
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Lists */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Confirmed Bookings */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-display font-bold">Confirmed Patients ({bookings.length})</h2>
              <Link href="/admin/assign" className="text-sm font-semibold text-primary hover:underline">
                + Manually Assign
              </Link>
            </div>
            
            <div className="space-y-3">
              {bookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 bg-secondary/30 rounded-xl">No confirmed bookings yet.</p>
              ) : (
                bookings.map((booking, idx) => (
                  <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-background gap-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold">{booking.client_name}</p>
                        <p className="text-xs text-muted-foreground">{booking.phone} • {booking.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <BookingBadge status={booking.status} />
                      <button onClick={() => cancelBooking(booking.id)} title="Cancel" className="p-2 text-destructive hover:bg-destructive/10 rounded-lg ml-2 transition-colors">
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Waitlist */}
          {schedule.queue_enabled && (
            <div className="glass-card rounded-3xl p-6 border-amber-200">
              <h2 className="text-xl font-display font-bold mb-6 text-amber-800">Waitlist Queue ({queue.length})</h2>
              
              <div className="space-y-3">
                {queue.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8 bg-amber-50/50 rounded-xl">Queue is empty.</p>
                ) : (
                  queue.map(booking => (
                    <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-amber-200 bg-amber-50/30 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-sm">
                          #{booking.queue_position}
                        </div>
                        <div>
                          <p className="font-bold">{booking.client_name}</p>
                          <p className="text-xs text-muted-foreground">{booking.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button 
                          onClick={() => promoteQueue(booking.id)}
                          disabled={bookings.length >= schedule.capacity}
                          className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 size={14} /> Promote
                        </button>
                         <button onClick={() => cancelBooking(booking.id)} title="Remove from queue" className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                          <XCircle size={18} />
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
    </AdminLayout>
  );
}
