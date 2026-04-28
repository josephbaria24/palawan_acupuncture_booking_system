"use client";

import { PublicLayout } from "@/components/layout/public-layout";
import { useSchedules } from "@/hooks/use-acupuncture";
import { motion } from "framer-motion";
import { ScheduleCalendar } from "@/components/admin/ScheduleCalendar";
import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { formatTime12h } from "@/utils/time";
import { CalendarDays, List, Users, Filter } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PublicCalendarScreen() {
  const { data: schedules = [], isLoading } = useSchedules();
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [listDateFilter, setListDateFilter] = useState<string>("all");
  const [listTimeFilter, setListTimeFilter] = useState<string>("all");

  // Public should only see open sessions and full sessions with queue enabled.
  const publicSchedules = schedules.filter(
    (s) => s.status === "open" || (s.status === "full" && s.queue_enabled !== false),
  );

  const sortedSchedules = [...publicSchedules].sort((a, b) => {
    const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return a.start_time.localeCompare(b.start_time);
  });

  const availableMonths = Array.from(new Set(publicSchedules.map(s => format(new Date(s.date), "yyyy-MM")))).sort();

  const filteredListSchedules = sortedSchedules.filter(schedule => {
    if (listDateFilter !== "all" && format(new Date(schedule.date), "yyyy-MM") !== listDateFilter) return false;
    
    if (listTimeFilter !== "all") {
      const hour = parseInt(schedule.start_time.split(":")[0], 10);
      if (listTimeFilter === "morning" && hour >= 12) return false;
      if (listTimeFilter === "afternoon" && (hour < 12 || hour >= 17)) return false;
      if (listTimeFilter === "evening" && hour < 17) return false;
    }
    
    return true;
  });

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
            Select a day and choose a session from the schedule map.
          </motion.p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-5 flex justify-end">
          <div className="flex items-center bg-white border border-border/40 rounded-2xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode("calendar")}
              className={`h-10 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === "calendar"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              <CalendarDays size={14} />
              Calendar
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`h-10 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              <List size={14} />
              List
            </button>
          </div>
        </div>

        {viewMode === "calendar" ? (
          <ScheduleCalendar
            schedules={publicSchedules}
            isLoading={isLoading}
            scheduleLinkBasePath="/book"
          />
        ) : (
          <div className="rounded-2xl border border-border/40 bg-white shadow-sm overflow-hidden flex flex-col h-[600px]">
            {/* Filters */}
            <div className="p-4 border-b border-border/40 bg-secondary/10 flex flex-wrap gap-4 items-center shrink-0">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <Filter size={16} /> Filters:
              </div>
              <div className="w-40">
                <Select value={listDateFilter} onValueChange={setListDateFilter}>
                  <SelectTrigger className="h-9 bg-white text-xs">
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {availableMonths.map(m => (
                      <SelectItem key={m} value={m}>{format(new Date(m + "-01T00:00:00"), "MMMM yyyy")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Select value={listTimeFilter} onValueChange={setListTimeFilter}>
                  <SelectTrigger className="h-9 bg-white text-xs">
                    <SelectValue placeholder="All Times" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Times</SelectItem>
                    <SelectItem value="morning">Morning (&lt; 12 PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12-5 PM)</SelectItem>
                    <SelectItem value="evening">Evening (&gt; 5 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(listDateFilter !== "all" || listTimeFilter !== "all") && (
                <button 
                  onClick={() => { setListDateFilter("all"); setListTimeFilter("all"); }}
                  className="text-xs font-bold text-primary hover:underline px-2"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-3 bg-secondary/20 border-b border-border/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
              <div className="col-span-3">Month</div>
              <div className="col-span-2">Day</div>
              <div className="col-span-3">Time</div>
              <div className="col-span-2">Slots</div>
              <div className="col-span-2">Action</div>
            </div>

            <ScrollArea className="flex-1">
              {filteredListSchedules.map((schedule) => {
                const occupiedCount = schedule.bookings?.filter((b) => b.status === "confirmed").length || 0;
                const isFull = occupiedCount >= schedule.capacity || schedule.status === "full";

                return (
                  <div
                    key={schedule.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 border-b border-border/40 last:border-b-0 hover:bg-secondary/5 transition-colors"
                  >
                    <div className="md:col-span-3 text-sm font-semibold">
                      {format(new Date(schedule.date), "MMMM yyyy")}
                    </div>
                    <div className="md:col-span-2 text-sm">
                      {format(new Date(schedule.date), "EEE, dd")}
                    </div>
                    <div className="md:col-span-3 text-sm">
                      {formatTime12h(schedule.start_time)} - {formatTime12h(schedule.end_time)}
                    </div>
                    <div className="md:col-span-2 text-sm font-medium flex items-center gap-1.5">
                      <Users size={13} className="text-muted-foreground" />
                      {occupiedCount}/{schedule.capacity}
                    </div>
                    <div className="md:col-span-2">
                      {isFull ? (
                        schedule.queue_enabled !== false ? (
                          <Link
                            href={`/book/${schedule.id}`}
                            className="inline-flex px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-md hover:bg-amber-600 transition-colors"
                          >
                            Join Waitlist
                          </Link>
                        ) : (
                          <span className="inline-flex px-3 py-1.5 bg-muted text-muted-foreground text-xs font-semibold rounded-md">
                            Closed
                          </span>
                        )
                      ) : (
                        <Link
                          href={`/book/${schedule.id}`}
                          className="inline-flex px-3 py-1.5 bg-foreground text-background text-xs font-semibold rounded-md hover:bg-primary hover:text-white transition-colors"
                        >
                          Book
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}

              {!isLoading && filteredListSchedules.length === 0 && (
                <div className="p-12 text-center text-muted-foreground font-medium">
                  No sessions found matching your filters.
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

