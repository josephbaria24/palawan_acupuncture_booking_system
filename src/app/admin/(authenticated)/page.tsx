"use client";

import { useSchedules, useBookings } from "@/hooks/use-acupuncture";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, TrendingUp, Users, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime12h } from "@/utils/time";

export default function AdminDashboard() {
  const { data: schedules, isLoading: isSchedulesLoading } = useSchedules();
  const { data: bookings, isLoading: isBookingsLoading } = useBookings();

  const totalBookings = bookings?.length || 0;
  const queuedBookings = bookings?.filter(b => b.status === 'queued').length || 0;
  const todaySchedules = schedules?.filter(s => s.date === format(new Date(), 'yyyy-MM-dd')).length || 0;
  const confirmedFromBookings = bookings?.filter(b => b.status === "confirmed").length || 0;
  const estRevenue = confirmedFromBookings * 1500;

  // Chart Data: Last 7 Days Booking Volume
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayBookings = bookings?.filter(b => 
      b.created_at && isSameDay(new Date(b.created_at), date)
    ).length || 0;
    return {
      date: format(date, 'MMM dd'),
      bookings: dayBookings,
    };
  });

  // Occupancy Data: Today and Upcoming
  const next5Schedules = schedules?.slice(0, 5) || [];
  const occupancyData = next5Schedules.map(s => {
    const occupied = s.bookings?.filter(b => b.status === "confirmed").length || 0;
    return {
      name: format(new Date(s.date), 'MM/dd'),
      occupied,
      capacity: s.capacity,
    };
  });

  const chartConfig = {
    bookings: {
      label: "Bookings",
      color: "hsl(var(--primary))",
    },
    occupied: {
      label: "Occupied",
      color: "#B79A7E",
    },
  } satisfies ChartConfig;

  const stats = [
    { label: "Today's Sessions", value: todaySchedules, icon: <CalendarIcon size={16} />, color: "text-secondary", bg: "bg-secondary/10", trend: "+2 from yesterday" },
    { label: "Total Bookings", value: totalBookings, icon: <Users size={16} />, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+12% this week" },
    { label: "Waitlist", value: queuedBookings, icon: <Clock size={16} />, color: "text-amber-500", bg: "bg-amber-500/10", trend: "Stability: High" },
    { label: "Est. Revenue", value: `₱${estRevenue.toLocaleString()}`, icon: <TrendingUp size={16} />, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "Target: 80%" },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-xs font-medium">Real-time clinical performance and patient traffic.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 py-1 px-3">
            <CheckCircle2 size={12} /> System Active
          </Badge>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{format(new Date(), 'MMMM d, yyyy')}</span>
        </div>
      </div>

      {/* Top Metrics - Super Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card rounded-2xl p-4 shadow-sm border border-border/40 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-0.5">
                <ArrowUpRight size={10} className="text-emerald-500" /> {index % 2 === 0 ? "14%" : "8%"}
              </span>
            </div>
            <div>
              <div className="text-xl font-bold text-foreground tracking-tight">
                {isBookingsLoading || isSchedulesLoading ? "..." : stat.value}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-3xl border-border/40 shadow-sm overflow-hidden">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              Weekly Booking Volume
            </CardTitle>
            <CardDescription className="text-[10px]">Total bookings made across the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-[200px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-bookings)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--color-bookings)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#888' }}
                  dy={10}
                />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="var(--color-bookings)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorBookings)" 
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/40 shadow-sm overflow-hidden">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users size={16} className="text-[#B79A7E]" />
              Session Occupancy Rate
            </CardTitle>
            <CardDescription className="text-[10px]">Confirmed slots vs. capacity for next 5 sessions.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[200px]">
             <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={occupancyData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#888' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#888' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="occupied" 
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                >
                  {occupancyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.occupied >= entry.capacity ? "#ef4444" : "var(--color-occupied)"} 
                    />
                  ))}
                </Bar>
                <Bar 
                  dataKey="capacity" 
                  fill="rgba(0,0,0,0.05)" 
                  radius={[4, 4, 0, 0]}
                  barSize={12}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Upcoming Schedules - Compact List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-3xl border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">Upcoming Sessions</CardTitle>
              <Link href="/admin/schedules" className="text-[10px] font-bold text-primary hover:underline">
                Manage All
              </Link>
            </CardHeader>
            <CardContent className="p-0 border-t border-border/40">
              <div className="divide-y divide-border/40">
                {schedules?.slice(0, 3).map(schedule => {
                  const occupiedCount = schedule.bookings?.filter(b => b.status === "confirmed").length || 0;
                  const isFull = occupiedCount >= schedule.capacity;
                  
                  return (
                    <Link href={`/admin/schedules/${schedule.id}`} key={schedule.id} className="block group">
                      <div className="flex items-center justify-between p-4 px-6 hover:bg-secondary/10 transition-colors">
                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 bg-[#B79A7E] text-white rounded-xl flex flex-col items-center justify-center shrink-0 shadow-sm">
                            <span className="text-[8px] uppercase font-bold">{format(new Date(schedule.date), 'MMM')}</span>
                            <span className="text-sm font-black leading-none">{format(new Date(schedule.date), 'dd')}</span>
                          </div>
                          <div>
                            <p className="font-bold text-foreground group-hover:text-primary transition-colors text-xs">{schedule.title}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                              <Clock size={10} /> {formatTime12h(schedule.start_time)} - {formatTime12h(schedule.end_time)}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="secondary" className={`text-[9px] h-5 rounded-full px-2 ${
                            isFull ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {isFull ? 'Full' : 'Open'}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-bold">
                            {occupiedCount}/{schedule.capacity}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {(!schedules || schedules.length === 0) && (
                  <div className="p-8 text-center text-xs text-muted-foreground">No upcoming sessions.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Recent Bookings - Tight Sidebar */}
        <div>
          <Card className="rounded-3xl border-border/40 shadow-sm overflow-hidden h-full">
            <CardHeader className="p-6">
              <CardTitle className="text-sm font-bold">Recents</CardTitle>
            </CardHeader>
            <CardContent className="p-0 border-t border-border/40">
              <div className="divide-y divide-border/40">
                {bookings?.slice(0, 4).map(booking => {
                  const linkedSchedule = schedules?.find(s => s.id === booking.schedule_id);
                  
                  return (
                    <div key={booking.id} className="p-4 px-6 hover:bg-secondary/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary-foreground font-black flex items-center justify-center text-[10px] shrink-0 border border-secondary/30">
                          {booking.client_name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-foreground truncate leading-tight">{booking.client_name}</p>
                          <p className="text-[9px] text-muted-foreground font-medium truncate mt-0.5">
                            {linkedSchedule ? `${format(new Date(linkedSchedule.date), 'MMM d')} • ${linkedSchedule.start_time}` : "Unknown"}
                          </p>
                        </div>
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          booking.status === 'confirmed' ? 'bg-emerald-500' :
                          booking.status === 'queued' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                      </div>
                    </div>
                  );
                })}
                {(!bookings || bookings.length === 0) && (
                  <div className="p-8 text-center text-xs text-muted-foreground">No recent activity.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
