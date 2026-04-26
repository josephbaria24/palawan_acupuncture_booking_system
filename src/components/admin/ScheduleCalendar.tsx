"use client";

import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, Users, MapPin } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { ScheduleWithBookings } from "@/types/database";
import { formatTime12h } from "@/utils/time";
import { motion, AnimatePresence } from "framer-motion";

interface ScheduleCalendarProps {
  schedules: ScheduleWithBookings[];
  isLoading?: boolean;
  scheduleLinkBasePath?: string;
}

export function ScheduleCalendar({
  schedules,
  isLoading,
  scheduleLinkBasePath = "/admin/schedules",
}: ScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const schedulesByDate = useMemo(() => {
    const map: Record<string, ScheduleWithBookings[]> = {};
    schedules?.forEach(s => {
      const key = s.date;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [schedules]);

  const selectedDateSchedules = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return schedulesByDate[key] || [];
  }, [selectedDate, schedulesByDate]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getStatusColor = (schedule: ScheduleWithBookings) => {
    const occupied = schedule.bookings?.filter(b => b.status === "confirmed").length || 0;
    if (schedule.status === "closed") return "bg-gray-100 border-gray-200 text-gray-500";
    if (occupied >= schedule.capacity) return "bg-red-50 border-red-200 text-red-700";
    if (occupied >= schedule.capacity - 1) return "bg-amber-50 border-amber-200 text-amber-700";
    return "bg-emerald-50 border-emerald-200 text-emerald-700";
  };

  const getDotColor = (schedule: ScheduleWithBookings) => {
    const occupied = schedule.bookings?.filter(b => b.status === "confirmed").length || 0;
    if (schedule.status === "closed") return "bg-gray-400";
    if (occupied >= schedule.capacity) return "bg-red-500";
    if (occupied >= schedule.capacity - 1) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Sidebar: Mini Calendar + Selected Day Detail */}
      <div className="w-full lg:w-72 shrink-0 space-y-4">
        {/* Mini Calendar */}
        <div className="bg-white rounded-2xl shadow-sm border border-border/30 p-3">
          <style>{`
            .rdp-day.has-schedule-open { position: relative; }
            .rdp-day.has-schedule-open::after {
              content: '';
              position: absolute;
              bottom: 2px;
              left: 50%;
              transform: translateX(-50%);
              width: 5px;
              height: 5px;
              border-radius: 50%;
              background-color: #10b981;
            }
            .rdp-day.has-schedule-full::after {
              background-color: #ef4444 !important;
            }
            .rdp-day.has-schedule-almost::after {
              background-color: #f59e0b !important;
            }
          `}</style>
          <Calendar
            mode="single"
            selected={selectedDate || undefined}
            onSelect={(d) => d && setSelectedDate(d)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="w-full"
            modifiers={{
              "has-schedule-open": (date) => {
                const key = format(date, "yyyy-MM-dd");
                const scheds = schedulesByDate[key];
                if (!scheds || scheds.length === 0) return false;
                // Only open if none are full or almost full
                const anyFull = scheds.some(s => {
                  const occ = s.bookings?.filter(b => b.status === "confirmed").length || 0;
                  return occ >= s.capacity;
                });
                const anyAlmost = scheds.some(s => {
                  const occ = s.bookings?.filter(b => b.status === "confirmed").length || 0;
                  return occ >= s.capacity - 1;
                });
                return !anyFull && !anyAlmost;
              },
              "has-schedule-almost": (date) => {
                const key = format(date, "yyyy-MM-dd");
                const scheds = schedulesByDate[key];
                if (!scheds || scheds.length === 0) return false;
                const anyFull = scheds.some(s => {
                  const occ = s.bookings?.filter(b => b.status === "confirmed").length || 0;
                  return occ >= s.capacity;
                });
                const anyAlmost = scheds.some(s => {
                  const occ = s.bookings?.filter(b => b.status === "confirmed").length || 0;
                  return occ >= s.capacity - 1;
                });
                return !anyFull && anyAlmost;
              },
              "has-schedule-full": (date) => {
                const key = format(date, "yyyy-MM-dd");
                const scheds = schedulesByDate[key];
                if (!scheds || scheds.length === 0) return false;
                return scheds.some(s => {
                  const occ = s.bookings?.filter(b => b.status === "confirmed").length || 0;
                  return occ >= s.capacity;
                });
              }
            }}
            modifiersClassNames={{
              "has-schedule-open": "has-schedule-open font-bold",
              "has-schedule-almost": "has-schedule-open has-schedule-almost font-bold",
              "has-schedule-full": "has-schedule-open has-schedule-full font-bold"
            }}
          />
        </div>

        {/* Selected Day Detail */}
        <AnimatePresence mode="wait">
          {selectedDate && (
            <motion.div
              key={format(selectedDate, "yyyy-MM-dd")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-white rounded-2xl shadow-sm border border-border/30 p-5"
            >
              <h3 className="font-bold text-base mb-1">
                {format(selectedDate, "MMMM d, yyyy")}
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                {format(selectedDate, "EEEE")}
              </p>

              {selectedDateSchedules.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-4 text-center">No sessions on this day</p>
              ) : (
                <div className="space-y-3">
                  {selectedDateSchedules.map(schedule => {
                    const occupied = schedule.bookings?.filter(b => b.status === "confirmed").length || 0;
                    return (
                      <Link
                        key={schedule.id}
                        href={`${scheduleLinkBasePath}/${schedule.id}`}
                        className="block group"
                      >
                        <div className={`rounded-xl p-3 border ${getStatusColor(schedule)} transition-all hover:shadow-md`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-white/60">
                              {formatTime12h(schedule.start_time)}
                            </span>
                          </div>
                          <p className="font-bold text-sm mb-1">{schedule.title}</p>
                          <div className="flex items-center gap-1 text-[10px] opacity-80">
                            <Users size={10} />
                            <span className="font-bold">{occupied}/{schedule.capacity}</span>
                          </div>
                          {schedule.location && (
                            <div className="flex items-center gap-1 text-[10px] opacity-80 mt-1">
                              <MapPin size={10} />
                              <span className="truncate">{schedule.location}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Calendar Grid */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-border/30 overflow-hidden">
        {/* Month Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1.5 rounded-lg hover:bg-secondary/30 transition-colors text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1.5 rounded-lg hover:bg-secondary/30 transition-colors text-muted-foreground hover:text-foreground"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <button
            onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }}
            className="text-xs font-bold text-primary hover:text-primary/80 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Week Day Headers */}
        <div className="grid grid-cols-7 border-b border-border/30">
          {weekDays.map(day => (
            <div key={day} className="px-2 py-3 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const daySchedules = schedulesByDate[dateKey] || [];
            const inMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const maxVisible = 2;

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={`
                  relative min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 border-b border-r border-border/20 text-left transition-colors
                  ${!inMonth ? "bg-muted/20" : "hover:bg-primary/[0.02]"}
                  ${isSelected ? "bg-primary/5 ring-1 ring-primary/20" : ""}
                `}
              >
                {/* Day Number */}
                <div className={`
                  text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full
                  ${isTodayDate ? "bg-primary text-white" : ""}
                  ${!inMonth ? "text-muted-foreground/30" : "text-foreground"}
                `}>
                  {format(day, "d")}
                </div>

                {/* Schedule Chips */}
                {inMonth && daySchedules.length > 0 && (
                  <div className="space-y-0.5 mt-0.5">
                    {daySchedules.slice(0, maxVisible).map(s => {
                      const occ = s.bookings?.filter(b => b.status === "confirmed").length || 0;
                      return (
                        <div
                          key={s.id}
                          className={`rounded-md px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold border truncate ${getStatusColor(s)}`}
                        >
                          <span className="hidden sm:inline">{formatTime12h(s.start_time)} </span>
                          {s.title}
                          <span className="ml-1 opacity-60">{occ}/{s.capacity}</span>
                        </div>
                      );
                    })}
                    {daySchedules.length > maxVisible && (
                      <div className="text-[9px] font-bold text-primary pl-1">
                        +{daySchedules.length - maxVisible} more
                      </div>
                    )}
                  </div>
                )}

                {/* Dot indicators on mobile for days with schedules */}
                {inMonth && daySchedules.length > 0 && (
                  <div className="flex gap-0.5 mt-1 sm:hidden justify-center">
                    {daySchedules.slice(0, 3).map(s => (
                      <div key={s.id} className={`w-1.5 h-1.5 rounded-full ${getDotColor(s)}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
