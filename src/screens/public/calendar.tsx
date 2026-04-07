import { PublicLayout } from "@/components/layout/public-layout";
import { useSchedules } from "@/hooks/use-acupuncture";
import { format } from "date-fns";
import { formatTime12h } from "@/utils/time";
import Link from "next/link";
import { Calendar as CalendarIcon, Clock, ArrowRight, Users } from "lucide-react";
import { ScheduleBadge } from "@/components/ui/status-badge";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { motion } from "framer-motion";

export default function PublicCalendarScreen() {
  const { data: schedules = [], isLoading } = useSchedules();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Only show open or full (if queue enabled) schedules to public
  const publicSchedules = schedules.filter((s) => {
    return s.status === "open" || (s.status === "full" && s.queue_enabled !== false);
  });

  const availableSchedules = publicSchedules.filter((s) => {
    if (selectedDate) {
      const scheduleDate = new Date(s.date);
      return (
        scheduleDate.getFullYear() === selectedDate.getFullYear() &&
        scheduleDate.getMonth() === selectedDate.getMonth() &&
        scheduleDate.getDate() === selectedDate.getDate()
      );
    }
    return true;
  });

  const datesWithSessions = Array.from(
    new Set(publicSchedules.map((s) => new Date(s.date).toDateString())),
  ).map((d) => new Date(d));

  const datesWithAvailableSlots = Array.from(
    new Set(publicSchedules.filter(s => s.status === 'open' || (s.status === 'full' && s.queue_enabled !== false)).map((s) => new Date(s.date).toDateString())),
  ).map((d) => new Date(d));

  return (
    <PublicLayout>
      <div className="bg-secondary/20 py-10 md:py-16 border-b border-border overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
            type: "spring",
            bounce: 0.4,
          }}
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
            Select a time that works for you. If a session is full, you can join
            the waitlist.
          </motion.p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          <div className="w-full lg:w-80 shrink-0">
            <div className="glass-card rounded-3xl p-6 md:sticky md:top-32 border border-primary/10 shadow-lg shadow-primary/5">
              <h3 className="font-display font-bold text-xl mb-4 text-center">
                Select a Date
              </h3>
              <div className="flex justify-center border-b border-border/50 pb-4 mb-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{
                    hasSessions: datesWithSessions,
                    hasAvailableSlots: datesWithAvailableSlots,
                  }}
                  modifiersClassNames={{
                    hasSessions: "font-bold text-primary",
                    hasAvailableSlots: "bg-emerald-500/20 text-emerald-700 font-bold rounded-xl",
                  }}
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
                  <p className="text-sm text-muted-foreground">
                    Showing all upcoming
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 w-full">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-32 bg-card rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(
                  availableSchedules.reduce((acc, schedule) => {
                    const monthYear = format(new Date(schedule.date), "MMMM yyyy");
                    if (!acc[monthYear]) acc[monthYear] = [];
                    acc[monthYear].push(schedule);
                    return acc;
                  }, {} as Record<string, typeof availableSchedules>)
                ).map(([monthYear, monthSchedules]) => (
                  <div key={monthYear} className="space-y-4">
                    <div className="flex items-center gap-4 py-2">
                      <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{monthYear}</h2>
                      <div className="h-px bg-border flex-1" />
                    </div>
                    
                    <div className="space-y-3">
                      {monthSchedules.map((schedule) => {
                        const occupiedCount = schedule.bookings?.filter(b => b.status === "confirmed").length || 0;
                        const availableSlots = schedule.capacity - occupiedCount;
                        const isFullyBooked = availableSlots <= 0 || schedule.status === "full";
                        
                        let badgeText = "Open";
                        let badgeStyle = "bg-emerald-100/50 text-emerald-800 border-emerald-200/50";
                        
                        if (schedule.status === "closed" || schedule.status === "completed") {
                          badgeText = schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1);
                          badgeStyle = "bg-gray-100/50 text-gray-800 border-gray-200/50";
                        } else if (isFullyBooked) {
                          badgeText = "Fully Booked";
                          badgeStyle = "bg-red-100/50 text-red-800 border-red-200/50";
                        } else if (availableSlots === 1) {
                          badgeText = "1 Slot Left";
                          badgeStyle = "bg-orange-100/50 text-orange-800 border-orange-200/50";
                        }
                        
                        return (
                        <div
                          key={schedule.id}
                          className="bg-card/50 backdrop-blur-sm rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-border/40 hover:border-primary/20 hover:bg-card/80 transition-all shadow-sm group"
                        >
                          <div className="flex gap-4 items-center w-full sm:w-auto">
                            <div className="w-12 h-12 rounded-lg bg-primary/5 flex flex-col items-center justify-center text-primary shrink-0 border border-primary/10">
                              <span className="text-[9px] font-bold uppercase tracking-wider">
                                {format(new Date(schedule.date), "EEE")}
                              </span>
                              <span className="text-lg font-black font-display leading-none">
                                {format(new Date(schedule.date), "dd")}
                              </span>
                            </div>
                            <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                                      {schedule.title}
                                    </h3>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyle}`}>
                                      {badgeText}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs font-medium">
                                    <span className="flex items-center gap-1">
                                      <Clock size={12} /> {formatTime12h(schedule.start_time)} -{" "}
                                      {formatTime12h(schedule.end_time)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users size={12} /> 
                                      {occupiedCount} / {schedule.capacity} slots
                                    </span>
                                    <span className="font-bold text-foreground">
                                      ₱{schedule.price}
                                    </span>
                                  </div>
                            </div>
                          </div>

                          {isFullyBooked ? (
                            schedule.queue_enabled !== false ? (
                              <Link
                                href={`/book/${schedule.id}`}
                                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-all shadow-sm flex items-center justify-center gap-2 text-sm shadow-amber-500/20"
                              >
                                Join Waitlist <ArrowRight size={14} />
                              </Link>
                            ) : (
                              <button
                                disabled
                                className="w-full sm:w-auto px-5 py-2.5 bg-muted/50 text-muted-foreground font-semibold rounded-lg cursor-not-allowed flex items-center justify-center gap-2 text-sm border border-transparent"
                              >
                                Fully Booked
                              </button>
                            )
                          ) : (
                            <Link
                              href={`/book/${schedule.id}`}
                              className="w-full sm:w-auto px-5 py-2.5 bg-foreground text-background font-semibold rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 text-sm group-hover:shadow-primary/20"
                            >
                              Book Now <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          )}
                        </div>
                      )})}
                    </div>
                  </div>
                ))}

                {availableSchedules.length === 0 && (
                  <div className="text-center py-20 bg-card rounded-3xl border border-border">
                    <CalendarIcon
                      size={48}
                      className="mx-auto text-muted-foreground/30 mb-4"
                    />
                    <h3 className="text-xl font-bold mb-2">No sessions found</h3>
                    <p className="text-muted-foreground">
                      {selectedDate
                        ? "There are no available sessions on the selected date."
                        : "Please check back later for new availability."}
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

