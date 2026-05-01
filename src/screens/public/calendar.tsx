"use client";

import { PublicLayout } from "@/components/layout/public-layout";
import { useSchedules } from "@/hooks/use-acupuncture";
import { motion } from "framer-motion";
import { ScheduleCalendar } from "@/components/admin/ScheduleCalendar";
import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { formatTime12h } from "@/utils/time";
import { CalendarDays, List, Users, Filter, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function PublicCalendarScreen() {
  const { data: schedules = [], isLoading } = useSchedules();
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [listDateFilter, setListDateFilter] = useState<string>("all");
  const [listTimeFilter, setListTimeFilter] = useState<string>("all");
  const [listSearch, setListSearch] = useState("");

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

    const query = listSearch.trim().toLowerCase();
    if (query) {
      const scheduleDate = new Date(schedule.date);
      const monthText = format(scheduleDate, "MMMM yyyy").toLowerCase();
      const dayText = format(scheduleDate, "EEEE, dd").toLowerCase();
      const shortDayText = format(scheduleDate, "EEE, dd").toLowerCase();
      const timeText = `${formatTime12h(schedule.start_time)} - ${formatTime12h(schedule.end_time)}`.toLowerCase();
      if (
        !monthText.includes(query) &&
        !dayText.includes(query) &&
        !shortDayText.includes(query) &&
        !timeText.includes(query)
      ) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <PublicLayout>
      <div className="bg-secondary/20 py-3 md:py-4 border-b border-border overflow-hidden">
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
            className="text-sm sm:text-3xl md:text-2xl font-display font-black mb-1 md:mb-4 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent"
          >
            Available Sessions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-[11px] sm:text-base md:text-md text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2"
          >
            Select a day and choose a session from the schedule map.
          </motion.p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="mb-5 flex justify-end">
          <div className="flex items-center bg-white border border-border/40 rounded-2xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode("calendar")}
              className={`h-8 sm:h-10 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-colors ${
                viewMode === "calendar"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              <CalendarDays size={13} className="sm:size-[14px]" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`h-8 sm:h-10 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-colors ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              <List size={13} className="sm:size-[14px]" />
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
            {/* Search */}
            <div className="p-3 sm:p-4 border-b border-border/40 bg-white shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  placeholder="Search month, day, or time..."
                  className="h-8 sm:h-9 pl-9 text-[11px] sm:text-sm"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="p-2.5 sm:p-4 border-b border-border/40 bg-secondary/10 flex flex-nowrap gap-1.5 sm:gap-4 items-center shrink-0 overflow-x-auto">
              <div className="flex items-center gap-1 text-[11px] sm:text-sm font-bold text-muted-foreground shrink-0">
                <Filter size={12} className="sm:size-4" /> Filters:
              </div>
              <div className="w-[118px] sm:w-40 shrink-0">
                <Select value={listDateFilter} onValueChange={setListDateFilter}>
                  <SelectTrigger className="h-7 sm:h-9 bg-white text-[10px] sm:text-xs px-2 sm:px-3">
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
              <div className="w-[108px] sm:w-40 shrink-0">
                <Select value={listTimeFilter} onValueChange={setListTimeFilter}>
                  <SelectTrigger className="h-7 sm:h-9 bg-white text-[10px] sm:text-xs px-2 sm:px-3">
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
              {(listDateFilter !== "all" || listTimeFilter !== "all" || listSearch.trim()) && (
                <button 
                  onClick={() => { setListDateFilter("all"); setListTimeFilter("all"); setListSearch(""); }}
                  className="h-7 sm:h-auto text-[10px] sm:text-xs font-bold text-primary hover:underline px-1 sm:px-2 shrink-0 whitespace-nowrap"
                >
                  Clear
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
                    className="grid grid-cols-[1fr_auto] md:grid-cols-12 gap-x-3 gap-y-1 md:gap-4 px-4 md:px-5 py-3 md:py-4 border-b border-border/40 last:border-b-0 hover:bg-secondary/5 transition-colors items-start"
                  >
                    <div className="col-start-1 md:col-auto md:col-span-3 text-sm font-semibold">
                      {format(new Date(schedule.date), "MMMM yyyy")}
                    </div>
                    <div className="col-start-1 md:col-auto md:col-span-2 text-sm">
                      {format(new Date(schedule.date), "EEE, dd")}
                    </div>
                    <div className="col-start-1 md:col-auto md:col-span-3 text-sm">
                      {formatTime12h(schedule.start_time)} - {formatTime12h(schedule.end_time)}
                    </div>
                    <div className="col-start-1 md:col-auto md:col-span-2 text-sm font-medium flex items-center gap-1.5">
                      <Users size={13} className="text-muted-foreground" />
                      {occupiedCount}/{schedule.capacity}
                    </div>
                    <div className="col-start-2 row-start-1 row-span-4 self-start md:col-auto md:row-auto md:row-span-1 md:col-span-2">
                      {isFull ? (
                        schedule.queue_enabled !== false ? (
                          <Link
                            href={`/book/${schedule.id}`}
                            className="inline-flex h-8 items-center px-3.5 sm:px-3 py-1 sm:py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-md hover:bg-amber-600 transition-colors"
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
                          className="inline-flex h-8 items-center px-3.5 sm:px-3 py-1 sm:py-1.5 bg-foreground text-background text-xs font-semibold rounded-md hover:bg-primary hover:text-white transition-colors"
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

