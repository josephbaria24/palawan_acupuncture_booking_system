import { PublicLayout } from "@/components/layout/public-layout";
import { useSchedules } from "@/hooks/use-acupuncture";
import { format } from "date-fns";
import { Link } from "wouter";
import { Calendar as CalendarIcon, Clock, ArrowRight } from "lucide-react";
import { ScheduleBadge } from "@/components/ui/status-badge";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { motion } from "framer-motion";

export default function PublicCalendar() {
  const { data: schedules = [], isLoading } = useSchedules();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Only show open or full (if queue enabled) schedules to public
  const availableSchedules = schedules.filter(s => {
    const isAvailable = s.status === 'open' || (s.status === 'full' && s.queue_enabled);
    if (!isAvailable) return false;
    if (selectedDate) {
      const scheduleDate = new Date(s.date);
      return scheduleDate.getFullYear() === selectedDate.getFullYear() &&
             scheduleDate.getMonth() === selectedDate.getMonth() &&
             scheduleDate.getDate() === selectedDate.getDate();
    }
    return true;
  });

  return (
    <PublicLayout>
      <div className="bg-secondary/20 py-10 md:py-16 border-b border-border overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", type: "spring", bounce: 0.4 }}
          className="max-w-4xl mx-auto px-4 text-center"
        >
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-2xl sm:text-3xl md:text-5xl font-display font-black mb-2 md:mb-4 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent"
          >
            Available Sessions
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2"
          >
            Select a time that works for you. If a session is full, you can join the waitlist.
          </motion.p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          <div className="w-full lg:w-80 shrink-0">
            <div className="glass-card rounded-3xl p-6 md:sticky md:top-32 border border-primary/10 shadow-lg shadow-primary/5">
              <h3 className="font-display font-bold text-xl mb-4 text-center">Select a Date</h3>
              <div className="flex justify-center border-b border-border/50 pb-4 mb-4">
                <Calendar 
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="bg-transparent"
                />
              </div>
              
              <div className="text-center">
                {selectedDate ? (
                  <button 
                    onClick={() => setSelectedDate(undefined)}
                    className="text-sm font-semibold text-destructive hover:underline"
                  >
                    Clear Filter
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground">Showing all upcoming</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 w-full">
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-card rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-6">
            {availableSchedules.map(schedule => (
              <div key={schedule.id} className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-border/60 hover:border-primary/30 transition-colors group">
                <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex flex-col items-center justify-center text-primary shrink-0 border border-secondary">
                    <span className="text-sm font-semibold uppercase">{format(new Date(schedule.date), 'MMM')}</span>
                    <span className="text-2xl font-black font-display">{format(new Date(schedule.date), 'dd')}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{schedule.title}</h3>
                      <ScheduleBadge status={schedule.status} />
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground text-sm font-medium">
                      <span className="flex items-center gap-1"><Clock size={16} /> {schedule.start_time} - {schedule.end_time}</span>
                      <span className="px-2 py-1 bg-background rounded-md border border-border">₱{schedule.price}</span>
                    </div>
                  </div>
                </div>
                
                <Link href={`/book/${schedule.id}`} className="w-full sm:w-auto px-6 py-3 bg-foreground text-background font-semibold rounded-xl hover:bg-primary hover:text-white transition-all shadow-md flex items-center justify-center gap-2 group-hover:shadow-primary/20 group-hover:-translate-y-0.5">
                  {schedule.status === 'full' ? 'Join Waitlist' : 'Book Now'} <ArrowRight size={18} />
                </Link>
              </div>
            ))}

            {availableSchedules.length === 0 && (
              <div className="text-center py-20 bg-card rounded-3xl border border-border">
                <CalendarIcon size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold mb-2">No sessions found</h3>
                <p className="text-muted-foreground">
                  {selectedDate ? "There are no available sessions on the selected date." : "Please check back later for new availability."}
                </p>
                {selectedDate && (
                  <button 
                    onClick={() => setSelectedDate(undefined)}
                    className="mt-6 px-6 py-2 bg-secondary text-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors"
                  >
                    View All Dates
                  </button>
                )}
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
