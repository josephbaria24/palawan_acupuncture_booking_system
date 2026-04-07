"use client";

import { useSchedules, useCreateSchedule } from "@/hooks/use-acupuncture";
import { useAuditLog } from "@/hooks/use-audit";
import { format, parseISO, eachDayOfInterval } from "date-fns";
import { Plus, Search, Calendar as CalendarIcon, Clock, Users, Filter, ChevronDown, ChevronRight, CalendarDays } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { formatTime12h } from "@/utils/time";

export default function AdminSchedules() {
  const { data: schedules, isLoading } = useSchedules();
  const createSchedule = useCreateSchedule();
  const { logAction } = useAuditLog();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });
  const [newSlot, setNewSlot] = useState({
    title: "Morning Session",
    start_time: '08:00',
    end_time: '08:45',
    slot_duration: 45,
    capacity: 10,
    queue_enabled: true,
    price: 1500,
    payment_options: ['cash', 'card', 'gcash', 'bank'] as any[],
    notes: ""
  });

  const [expandedMonths, setExpandedMonths] = useState<string[]>([format(new Date(), 'MMMM yyyy')]);
  const [statusFilter, setStatusFilter] = useState("all"); // Default to all status
  const [sortOrder, setSortOrder] = useState("asc");

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => 
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const handleAddSlot = async () => {
    if (!dateRange?.from) {
      toast.error("Please select at least one date");
      return;
    }

    try {
      const dates = dateRange.to 
        ? eachDayOfInterval({ start: dateRange.from, end: dateRange.to })
        : [dateRange.from];

      const creationPromises = dates.map(date => {
        return createSchedule.mutateAsync({
          ...newSlot,
          date: format(date, 'yyyy-MM-dd')
        });
      });

      const results = await Promise.all(creationPromises);
      
      // Log audit events for each created session
      results.forEach((res, idx) => {
        logAction('CREATE_SCHEDULE', res.id, 'schedule', { 
          title: res.title, 
          date: res.date,
          batch: dates.length > 1
        });
      });
      
      toast.success(`Schedule added for ${dates.length} date(s) successfully`);
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add schedules");
    }
  };

  const filteredSchedules = schedules?.filter(schedule => {
    const searchLower = searchQuery.toLowerCase();
    const dateFormatted = format(new Date(schedule.date), 'yyyy-MM-dd');
    const matchesSearch = schedule.title.toLowerCase().includes(searchLower) || dateFormatted.includes(searchLower);
    
    // Derive virtual status for filtering
    const occupiedCount = schedule.bookings?.filter(b => b.status === "confirmed").length || 0;
    let virtualStatus = schedule.status;
    if (schedule.status === 'open' && occupiedCount >= schedule.capacity) {
      virtualStatus = 'full';
    }

    const matchesStatus = statusFilter === "all" || virtualStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.start_time}`).getTime();
    const dateB = new Date(`${b.date}T${b.start_time}`).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Schedules</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Manage your clinic's availability.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#593f31] hover:bg-[#593f31]/90 text-white rounded-xl shadow-lg border-none px-6">
              <Plus size={18} className="mr-2" /> New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[425px] rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New Schedule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Title</label>
                <Input value={newSlot.title} onChange={(e) => setNewSlot({...newSlot, title: e.target.value})} className="rounded-xl bg-secondary/5" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-xl bg-secondary/5 border-border/40 h-10",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-3xl shadow-2xl border-primary/10" align="center" side="bottom">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={1}
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-[9px] text-muted-foreground mt-1 px-1 italic">Selecting a range will create a separate session for each day.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Start</label>
                  <Input type="time" value={newSlot.start_time} onChange={(e) => setNewSlot({...newSlot, start_time: e.target.value})} className="rounded-xl bg-secondary/5" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">End</label>
                  <Input type="time" value={newSlot.end_time} onChange={(e) => setNewSlot({...newSlot, end_time: e.target.value})} className="rounded-xl bg-secondary/5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Capacity</label>
                  <Input type="number" value={newSlot.capacity} onChange={(e) => setNewSlot({...newSlot, capacity: parseInt(e.target.value)})} className="rounded-xl bg-secondary/5" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Price (₱)</label>
                  <Input type="number" value={newSlot.price} onChange={(e) => setNewSlot({...newSlot, price: parseInt(e.target.value)})} className="rounded-xl bg-secondary/5" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/5 border border-border/40">
                <div className="space-y-0.5">
                  <Label htmlFor="waitlist-toggle" className="text-sm font-bold">Enable Waitlist</Label>
                  <p className="text-[10px] text-muted-foreground font-medium">Allow patients to join the queue if the session is full.</p>
                </div>
                <Switch 
                  id="waitlist-toggle" 
                  checked={newSlot.queue_enabled} 
                  onCheckedChange={(checked) => setNewSlot({...newSlot, queue_enabled: checked})} 
                />
              </div>
              
              <Button onClick={handleAddSlot} disabled={createSchedule.isPending} className="w-full mt-2 font-bold rounded-xl py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                {createSchedule.isPending ? "Creating sessions..." : `Save ${dateRange?.to ? 'Batch' : 'Schedule'}`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div className="relative w-full shadow-sm rounded-2xl overflow-hidden bg-white border border-border/40">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search size={20} className="text-muted-foreground/60" />
          </div>
          <Input
            type="text"
            placeholder="Search by title or date (YYYY-MM-DD)..."
            className="w-full border-none bg-transparent py-6 pl-12 pr-4 text-sm font-medium focus-visible:ring-0 rounded-none shadow-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] bg-white border-border/40 h-12 rounded-2xl px-4 py-6 font-bold shadow-sm">
              <Filter size={16} className="text-muted-foreground/60 mr-2 shrink-0" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40 shadow-xl">
              <SelectItem value="all" className="font-bold">All Status</SelectItem>
              <SelectItem value="open" className="font-bold text-emerald-600">Open Only</SelectItem>
              <SelectItem value="full" className="font-bold text-red-600">Full Only</SelectItem>
              <SelectItem value="closed" className="font-bold text-gray-500">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white border-border/40 h-12 rounded-2xl px-4 py-6 font-bold shadow-sm">
              <CalendarIcon size={16} className="text-muted-foreground/60 mr-2 shrink-0" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40 shadow-xl">
              <SelectItem value="asc" className="font-bold">Soonest First</SelectItem>
              <SelectItem value="desc" className="font-bold">Latest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="col-span-full p-12 text-center text-muted-foreground font-medium">Loading schedules...</div>
      ) : filteredSchedules?.length === 0 ? (
        <div className="col-span-full p-12 text-center text-muted-foreground bg-white shadow-sm border border-dashed border-border/50 rounded-[2rem]">
          No schedules found matching your search and filter conditions.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(
            (filteredSchedules || []).reduce((acc, schedule) => {
              const month = format(new Date(schedule.date), 'MMMM yyyy');
              if (!acc[month]) acc[month] = [];
              acc[month].push(schedule);
              return acc;
            }, {} as Record<string, any[]>)
          ).map(([month, monthSchedules]) => {
            const isExpanded = expandedMonths.includes(month);
            const displaySchedules = monthSchedules || [];
            
            return (
              <div key={month} className="space-y-4">
                <button 
                  onClick={() => toggleMonth(month)}
                  className="flex items-center justify-between w-full p-6 bg-white border border-border/40 rounded-3xl shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-secondary/30 flex items-center justify-center text-primary border border-secondary shadow-sm">
                      <CalendarDays size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground tracking-tight text-left">{month}</h2>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-left">{displaySchedules.length} Sessions scheduled</p>
                    </div>
                  </div>
                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} className="text-muted-foreground" />
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {displaySchedules.map((schedule) => {
                      const occupiedCount = schedule.bookings?.filter((b: any) => b.status === "confirmed").length || 0;
                      
                      let displayStatus: string = schedule.status;
                      let statusColor = "bg-gray-100 text-gray-800";
                      if (schedule.status === 'open') {
                        if (occupiedCount >= schedule.capacity) {
                          displayStatus = 'fully booked';
                          statusColor = "bg-red-100 text-red-800";
                        } else if (occupiedCount === schedule.capacity - 1) {
                          displayStatus = '1 slot left';
                          statusColor = "bg-orange-100 text-orange-800";
                        } else {
                          displayStatus = 'open';
                          statusColor = "bg-emerald-100 text-emerald-800";
                        }
                      } else if (schedule.status === 'full') {
                        displayStatus = 'fully booked';
                        statusColor = "bg-red-100 text-red-800";
                      }

                      return (
                        <div key={schedule.id} className="bg-card rounded-[2.5rem] p-6 shadow-sm shadow-black/[0.02] border border-border/40 flex flex-col justify-between hover:shadow-lg transition-all">
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                                {displayStatus}
                              </span>
                              <span className="font-bold text-foreground text-sm flex items-center">
                                <span className="text-[10px] mr-0.5">₱</span>{schedule.price}
                              </span>
                            </div>

                            <h3 className="text-lg font-bold tracking-tight text-foreground mt-2 mb-4">{schedule.title}</h3>

                            <div className="space-y-3">
                              <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                                <CalendarIcon size={14} className="text-muted-foreground/70 shrink-0" />
                                <span className="font-bold">{format(new Date(schedule.date), 'EEEE, MMM dd')}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                                <Clock size={14} className="text-muted-foreground/70 shrink-0" />
                                <span>{formatTime12h(schedule.start_time)} - {formatTime12h(schedule.end_time)}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                                <Users size={14} className="text-muted-foreground/70 shrink-0" />
                                <span className="font-bold text-foreground">{occupiedCount} / {schedule.capacity} <span className="font-normal text-muted-foreground ml-1">slots booked</span></span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 pt-5 border-t border-border/40">
                            <Link href={`/admin/schedules/${schedule.id}`} className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center justify-between w-full group">
                              Manage Session <ChevronRight size={14} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
