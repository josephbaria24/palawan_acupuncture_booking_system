"use client";

import { useSchedules, useCreateSchedule, useClinicLocations, useCreateClinicLocation } from "@/hooks/use-acupuncture";
import { useAuditLog } from "@/hooks/use-audit";
import { format, parseISO, eachDayOfInterval } from "date-fns";
import { Plus, Search, Calendar as CalendarIcon, Clock, Users, Filter, ChevronDown, ChevronRight, CalendarDays, MapPin, Check, ChevronsUpDown, Save, List } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
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
import { AdminCalendarSyncDialog } from "@/components/admin/AdminCalendarSyncDialog";
import { ScheduleCalendar } from "@/components/admin/ScheduleCalendar";

export default function AdminSchedules() {
  const { data: schedules, isLoading } = useSchedules();
  const createSchedule = useCreateSchedule();
  const { data: locations } = useClinicLocations();
  const createLocation = useCreateClinicLocation();
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
    notes: "",
    location: ""
  });

  const [provinces, setProvinces] = useState<{ code: string; name: string }[]>([]);
  const [cities, setCities] = useState<{ code: string; name: string }[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [streetAddress, setStreetAddress] = useState<string>("");
  const [openProvince, setOpenProvince] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  useEffect(() => {
    // Primary: PSGC Cloud API
    fetch("https://psgc.cloud/api/provinces")
      .then(res => {
        if (!res.ok) throw new Error("Primary API failed");
        return res.json();
      })
      .then(data => setProvinces(data.sort((a: any, b: any) => a.name.localeCompare(b.name))))
      .catch(err => {
        console.error("Primary fetch failed, trying fallback:", err);
        // Fallback: GitHub Raw (very reliable for CORS)
        fetch("https://raw.githubusercontent.com/flores-jacob/psgc-api/master/provinces.json")
          .then(res => res.json())
          .then(data => setProvinces(data.sort((a: any, b: any) => a.name.localeCompare(b.name))))
          .catch(fallbackErr => {
            console.error("All location fetches failed", fallbackErr);
            toast.error("Could not load locations. Please check your connection.");
          });
      });
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://psgc.cloud/api/provinces/${selectedProvince}/cities-municipalities`)
        .then(res => {
          if (!res.ok) throw new Error("Primary API failed");
          return res.json();
        })
        .then(data => setCities(data.sort((a: any, b: any) => a.name.localeCompare(b.name))))
        .catch(err => {
          console.error("Primary city fetch failed, trying local filter from full list:");
          // If primary fails, try a direct fetch from the Gitlab mirror which might be handled differently by the browser
          fetch(`https://psgc.cloud/api/provinces/${selectedProvince}/cities-municipalities`)
            .then(res => res.json())
            .then(data => setCities(data.sort((a: any, b: any) => a.name.localeCompare(b.name))))
            .catch(() => toast.error("Failed to load cities for this province"));
        });
    } else {
      setCities([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    const provinceName = provinces.find(p => p.code === selectedProvince)?.name;
    const cityName = cities.find(c => c.code === selectedCity)?.name;
    
    if (provinceName && cityName) {
      const fullLocation = streetAddress 
        ? `${streetAddress}, ${cityName}, ${provinceName}` 
        : `${cityName}, ${provinceName}`;
      setNewSlot(prev => ({ ...prev, location: fullLocation }));
    }
  }, [selectedCity, selectedProvince, streetAddress, provinces, cities]);

  const [expandedMonths, setExpandedMonths] = useState<string[]>([format(new Date(), 'MMMM yyyy')]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  // Auto-fill location from the most recent schedule when opening the dialog
  useEffect(() => {
    if (isDialogOpen && schedules && schedules.length > 0) {
      // Find the most recent schedule that has a location
      const withLocation = [...schedules]
        .filter(s => s.location && s.location.trim() !== "")
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      if (withLocation.length > 0 && !newSlot.location) {
        const lastLocation = withLocation[0].location;
        setNewSlot(prev => ({ ...prev, location: lastLocation }));
        // Also set the street address field for display
        setStreetAddress("");
      }
    }
  }, [isDialogOpen]);

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

      // Save location to clinic_locations if it's new
      if (newSlot.location && !locations?.some(loc => loc.address === newSlot.location)) {
        try {
          await createLocation.mutateAsync({
            name: newSlot.location.split(',')[0], // Use first part as name
            address: newSlot.location,
            is_default: locations?.length === 0
          });
        } catch (err) {
          console.error("Failed to save new location:", err);
        }
      }

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
        
        <div className="flex items-center gap-3">
          <AdminCalendarSyncDialog />
          
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
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Location</label>
                  {locations && locations.length > 0 && (
                    <Select onValueChange={(val) => setNewSlot(prev => ({ ...prev, location: val }))}>
                      <SelectTrigger className="h-6 w-auto border-none bg-transparent p-0 text-[10px] font-bold text-primary hover:text-primary/80 focus:ring-0">
                        <SelectValue placeholder="Use Saved" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/40 shadow-xl">
                        {locations.map(loc => (
                          <SelectItem key={loc.id} value={loc.address} className="text-xs font-bold">
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Popover open={openProvince} onOpenChange={setOpenProvince}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openProvince}
                        className="w-full justify-between rounded-xl bg-secondary/5 border-border/40 h-10 font-normal hover:bg-secondary/10"
                      >
                        <span className="truncate">
                          {selectedProvince
                            ? provinces.find((p) => p.code === selectedProvince)?.name
                            : "Province"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search province..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No province found.</CommandEmpty>
                          <CommandGroup>
                            {provinces.map((p) => (
                              <CommandItem
                                key={p.code}
                                value={p.name}
                                onSelect={() => {
                                  setSelectedProvince(p.code);
                                  setSelectedCity("");
                                  setOpenProvince(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedProvince === p.code ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {p.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <Popover open={openCity} onOpenChange={setOpenCity}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCity}
                        disabled={!selectedProvince}
                        className="w-full justify-between rounded-xl bg-secondary/5 border-border/40 h-10 font-normal hover:bg-secondary/10 disabled:opacity-50"
                      >
                        <span className="truncate">
                          {selectedCity
                            ? cities.find((c) => c.code === selectedCity)?.name
                            : "City/Mun"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search city..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No city found.</CommandEmpty>
                          <CommandGroup>
                            {cities.map((c) => (
                              <CommandItem
                                key={c.code}
                                value={c.name}
                                onSelect={() => {
                                  setSelectedCity(c.code);
                                  setOpenCity(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedCity === c.code ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {c.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="mt-2 text-primary font-bold">
                  <Input 
                    placeholder="Street, Building, Unit (Optional)" 
                    value={streetAddress} 
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="rounded-xl bg-secondary/5 h-10 border-border/40 placeholder:text-muted-foreground/50"
                  />
                </div>
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
                  <Input 
                    type="number" 
                    value={isNaN(newSlot.capacity) ? "" : newSlot.capacity} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewSlot({...newSlot, capacity: val === "" ? 0 : parseInt(val)});
                    }} 
                    className="rounded-xl bg-secondary/5" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Price (₱)</label>
                  <Input 
                    type="number" 
                    value={isNaN(newSlot.price) ? "" : newSlot.price} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewSlot({...newSlot, price: val === "" ? 0 : parseInt(val)});
                    }} 
                    className="rounded-xl bg-secondary/5" 
                  />
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
      </div>

      {/* Schedule Views */}
      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground font-medium">Loading schedules...</div>
      ) : viewMode === "calendar" ? (
        <ScheduleCalendar schedules={filteredSchedules || []} isLoading={isLoading} />
      ) : (
        <div className="rounded-2xl border border-border/40 bg-white shadow-sm overflow-hidden">
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-3 bg-secondary/20 border-b border-border/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-3">Month</div>
            <div className="col-span-2">Day</div>
            <div className="col-span-3">Time</div>
            <div className="col-span-2">Slots</div>
            <div className="col-span-2">Status</div>
          </div>

          {(filteredSchedules || []).map((schedule) => {
            const occupiedCount = schedule.bookings?.filter((b) => b.status === "confirmed").length || 0;
            const isFull = occupiedCount >= schedule.capacity || schedule.status === "full";
            const virtualStatus = isFull ? "full" : schedule.status;

            return (
              <Link
                key={schedule.id}
                href={`/admin/schedules/${schedule.id}`}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 border-b border-border/40 last:border-b-0 hover:bg-secondary/10 transition-colors"
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
                <div className="md:col-span-2 text-sm font-medium">
                  {occupiedCount}/{schedule.capacity}
                </div>
                <div className="md:col-span-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      virtualStatus === "full"
                        ? "bg-red-100 text-red-700"
                        : virtualStatus === "closed"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {virtualStatus}
                  </span>
                </div>
              </Link>
            );
          })}

          {(filteredSchedules || []).length === 0 && (
            <div className="p-12 text-center text-muted-foreground font-medium">No schedules found.</div>
          )}
        </div>
      )}
    </div>
  );
}
