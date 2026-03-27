import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { PublicLayout } from "@/components/layout/public-layout";
import { supabase } from "@/lib/supabase";
import { Booking, Schedule } from "@/types/database";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { RiSearchLine, RiCalendarCheckLine, RiTimeLine, RiInformationLine, RiHashtag, RiArrowRightLine } from "@remixicon/react";
import { BookingBadge } from "@/components/ui/status-badge";

export default function TrackBooking() {
  const { code } = useParams<{ code?: string }>();
  const [searchCode, setSearchCode] = useState(code || "");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = async (ref: string) => {
    setLoading(true);
    setError(null);
    setBooking(null);
    setSchedule(null);

    const { data, error: fetchError } = await supabase
      .from('bookings')
      .select('*, schedules(*)')
      .eq('reference_code', ref.toUpperCase().trim())
      .single();

    if (fetchError || !data) {
      setError("Booking not found. Please check your reference code.");
      setLoading(false);
      return;
    }

    setBooking(data as Booking);
    // Explicitly casting schedules from the join
    setSchedule((data as any).schedules as Schedule);
    setLoading(false);
  };

  useEffect(() => {
    if (code) {
      fetchBooking(code);
    }
  }, [code]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode) return;
    fetchBooking(searchCode);
  };

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-10 md:py-20 font-display min-h-[70vh]">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-3">Track Appointment</h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed px-4">
            Enter your booking reference code to check the status of your acupuncture session.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-lg mx-auto mb-10 md:mb-16">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white border-2 border-border/50 rounded-2xl p-1.5 focus-within:border-primary transition-all shadow-xl shadow-primary/5">
              <div className="hidden sm:flex pl-3 text-muted-foreground/30">
                <RiHashtag size={18} />
              </div>
              <input
                type="text"
                placeholder="PA-XXXXXX"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none py-3 px-4 font-bold text-base md:text-lg tracking-widest placeholder:tracking-normal placeholder:font-medium uppercase"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white font-black px-6 py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-1 sm:mt-0"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <RiSearchLine size={18} />
                    <span className="sm:inline">Check Status</span>
                  </>
                )}
              </button>
            </div>
          </form>
          {error && <p className="text-destructive text-center mt-4 font-bold text-xs md:text-sm tracking-tight">{error}</p>}
        </div>

        {/* Results */}
        {booking && schedule && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 bg-white/50 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] border-2 border-border/40 p-6 md:p-10 shadow-2xl shadow-primary/5"
          >
            {/* Status Header */}
            <div className="md:col-span-5 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border/40 pb-6 md:pb-10 mb-2 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-5">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border-2 border-primary/20 shrink-0">
                  <RiCalendarCheckLine size={28} />
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Appointment Status</p>
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight">{booking.status === 'confirmed' ? 'Scheduled' : 'Waitlisted'}</h2>
                    <BookingBadge status={booking.status} className="scale-90 md:scale-110" />
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 px-5 md:px-6 py-3 md:py-4 rounded-2xl border border-border/50 w-full md:w-auto">
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">Reference Code</p>
                <p className="text-lg md:text-xl font-black font-display tracking-widest text-primary">{booking.reference_code}</p>
              </div>
            </div>

            {/* Session Info */}
            <div className="md:col-span-3 space-y-6 md:space-y-8">
              <div className="space-y-4">
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">Session Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary/50 flex items-center justify-center text-primary shrink-0">
                      <RiCalendarCheckLine size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{format(new Date(schedule.date), 'EEEE, MMM do, yyyy')}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Date</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary/50 flex items-center justify-center text-primary shrink-0">
                      <RiTimeLine size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{schedule.start_time} - {schedule.end_time}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Time Slot</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:col-span-2 md:col-span-1">
                    <div className="w-9 h-9 rounded-xl bg-secondary/50 flex items-center justify-center text-primary shrink-0">
                      <RiInformationLine size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{schedule.title}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Service</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="md:col-span-2 space-y-4 md:space-y-6">
              <div className="bg-primary/5 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-primary/10">
                <h4 className="font-black text-[10px] md:text-xs uppercase tracking-widest mb-4 text-primary/70">Patient Info</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 truncate">Name</p>
                    <p className="text-sm md:font-bold text-foreground">{booking.client_name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 truncate">Contact</p>
                    <p className="text-sm md:font-bold text-foreground">{booking.phone}</p>
                    <p className="text-xs text-muted-foreground">{booking.email}</p>
                  </div>
                </div>
              </div>

              {booking.status === 'confirmed' && (
                <div className="bg-emerald-50 rounded-[1.5rem] md:rounded-[2rem] p-5 border border-emerald-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0">
                    <RiCalendarCheckLine size={16} />
                  </div>
                  <p className="text-[11px] text-emerald-800 font-bold leading-tight">
                    Your spot is secured! Please arrive 10 min early.
                  </p>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="md:col-span-5 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-6">
              <Link href="/book" className="text-xs md:text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                Book another session <RiArrowRightLine size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 md:flex-none text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl border-2 border-border hover:bg-muted transition-colors bg-white shadow-sm"
                >
                  Print Summary
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State Illustration Placeholder */}
        {!booking && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="flex flex-col items-center justify-center py-10 opacity-30 mt-10 grayscale"
          >
             <RiCalendarCheckLine size={120} className="text-muted-foreground/20" />
             <p className="text-sm font-bold uppercase tracking-[0.3em] mt-8">Secure Tracking</p>
          </motion.div>
        )}
      </div>
    </PublicLayout>
  );
}
