import { AdminLayout } from "@/components/layout/admin-layout";
import { useBulkCreateSchedules, useSchedules } from "@/hooks/use-acupuncture";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";
import { PaymentOption, Schedule } from "@/types/database";
import { 
  RiArrowLeftLine, 
  RiTimeLine, 
  RiArrowRightSLine, 
  RiCheckLine, 
  RiSaveLine,
} from "@remixicon/react";
import { Link } from "wouter";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format, addMinutes, parse, eachDayOfInterval } from "date-fns";
import { DateRange } from "react-day-picker";
import { motion } from "framer-motion";

type TimeSlot = {
  start: string;
  end: string;
  display: string;
};

export default function NewSchedule() {
  const bulkCreate = useBulkCreateSchedules();
  const { data: existingSchedules = [] } = useSchedules();
  const { toast } = useToast();
  
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [mode, setMode] = React.useState<"single" | "range">("single");
  const [selectedSlots, setSelectedSlots] = React.useState<TimeSlot[]>([]);

  const [formData, setFormData] = React.useState({
    title: 'Morning Session',
    slot_duration: 30,
    capacity: 10,
    queue_enabled: true,
    price: 1500,
    payment_options: ['card', 'cash'] as PaymentOption[],
    notes: ''
  });

  // Generate time slots from 8:00 AM to 6:00 PM
  const timeSlots = React.useMemo(() => {
    const slots: TimeSlot[] = [];
    let current = parse('08:00', 'HH:mm', new Date());
    const end = parse('18:00', 'HH:mm', new Date());
    
    while (current < end) {
      const startStr = format(current, 'HH:mm');
      const startDisplay = format(current, 'h:mm a');
      const next = addMinutes(current, 30);
      const endStr = format(next, 'HH:mm');
      const endDisplay = format(next, 'h:mm a');
      
      slots.push({
        start: startStr,
        end: endStr,
        display: `${startDisplay} - ${endDisplay}`
      });
      current = next;
    }
    return slots;
  }, []);

  const existingDates = React.useMemo(() => {
    return existingSchedules.map(s => new Date(s.date));
  }, [existingSchedules]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "single" && !date) {
      toast({ title: "Error", description: "Please select a date", variant: "destructive" });
      return;
    }
    if (mode === "range" && (!dateRange?.from || !dateRange?.to)) {
      toast({ title: "Error", description: "Please select a date range", variant: "destructive" });
      return;
    }
    if (selectedSlots.length === 0) {
      toast({ title: "Error", description: "Please select at least one time slot", variant: "destructive" });
      return;
    }

    const payload: Omit<Schedule, "id" | "created_at" | "status">[] = [];
    const datesToProduce = mode === "single" 
      ? [date!] 
      : eachDayOfInterval({ start: dateRange!.from!, end: dateRange!.to! });

    datesToProduce.forEach(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      selectedSlots.forEach(slot => {
        payload.push({
          ...formData,
          date: dateStr,
          start_time: slot.start,
          end_time: slot.end,
        });
      });
    });

    bulkCreate.mutate(payload, {
      onSuccess: () => {
        toast({ title: "Success!", description: `Published ${payload.length} sessions successfully.` });
        window.location.href = "/admin/schedules";
      }
    });
  };

  const togglePayment = (opt: PaymentOption) => {
    setFormData(prev => ({
      ...prev,
      payment_options: prev.payment_options.includes(opt) 
        ? prev.payment_options.filter(o => o !== opt)
        : [...prev.payment_options, opt]
    }));
  };

  const toggleTimeSlot = (slot: TimeSlot) => {
    setSelectedSlots(prev => {
      const isSelected = prev.some(s => s.start === slot.start);
      if (isSelected) {
        return prev.filter(s => s.start !== slot.start);
      } else {
        return [...prev, slot].sort((a, b) => a.start.localeCompare(b.start));
      }
    });
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <Link href="/admin/schedules" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <RiArrowLeftLine size={16} className="mr-1" /> Back to Schedules
        </Link>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-display font-black text-foreground tracking-tight">Create Schedule</h1>
            <p className="text-muted-foreground font-medium mt-1">Configure your clinic slots and availability</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-border shadow-sm">
            <Switch
              id="range-switch"
              checked={mode === "range"}
              onCheckedChange={(checked) => setMode(checked ? "range" : "single")}
            />
            <Label htmlFor="range-switch" className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Range Selection
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Calendar Section */}
          <div className={`${mode === "range" ? "lg:col-span-12" : "lg:col-span-5"} space-y-4 transition-all duration-500`}>
            <div className="glass-card rounded-[2.5rem] p-8 border border-border bg-white/50 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                  Step 01
                </span>
                <span className="text-sm font-bold text-muted-foreground">
                  {mode === "single" ? "Single Date Selection" : "Multiple Months Range"}
                </span>
              </div>
              
              <div className="flex justify-center bg-secondary/10 rounded-[2rem] p-4 border border-border/50 overflow-x-auto">
                {mode === "single" ? (
                  <Calendar 
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    enableYearNavigation
                    modifiers={{ hasSchedule: existingDates }}
                    modifiersClassNames={{ hasSchedule: "after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full" }}
                  />
                ) : (
                  <Calendar
                    mode="range"
                    numberOfMonths={2}
                    selected={dateRange}
                    onSelect={setDateRange}
                    enableYearNavigation
                    className="w-full justify-center"
                  />
                )}
              </div>

              <div className="mt-6 p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-border/50 transition-all">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Current Selection</p>
                <p className="text-sm font-bold text-primary truncate">
                  {mode === "single" 
                    ? (date ? format(date, 'MMMM do, yyyy') : "Select a date on the calendar")
                    : (dateRange?.from ? `${format(dateRange.from, 'MMM d')} – ${dateRange.to ? format(dateRange.to, 'MMM d, yyyy') : "..."}` : "Select a range")}
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <RiCheckLine className="text-primary" />
              </div>
              <p className="text-xs font-semibold leading-relaxed text-primary/80">
                Tip: Choosing a range allows you to create identical schedules for multiple days at once.
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className={`${mode === "range" ? "lg:col-span-12" : "lg:col-span-7"} transition-all duration-500 ${(mode === "single" ? date : dateRange?.from) ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
            <div className="glass-card rounded-[2.5rem] p-10 border border-border bg-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8">
                  <RiArrowRightSLine size={48} className="text-primary/5" />
               </div>

              <div className="flex items-center gap-3 mb-10">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                  Step 02
                </span>
                <h2 className="text-xl font-black tracking-tight">Session Configuration</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Title */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ml-1">Session Description</Label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Morning Acupuncture Clinic"
                    className="w-full p-5 rounded-2xl bg-secondary/10 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold text-lg"
                    required
                  />
                </div>

                {/* Time Slots */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Select Time Slots (Double-click to edit)</Label>
                    <span className="text-[10px] text-primary font-black bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1.5 border border-primary/20">
                      <RiTimeLine size={14} /> {selectedSlots.length} Slots Selected
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {timeSlots.map(slot => {
                      const isSelected = selectedSlots.some(s => s.start === slot.start);
                      const [isEditing, setIsEditing] = React.useState(false);
                      const [editValue, setEditValue] = React.useState(slot.display);

                      return (
                        <motion.button
                          type="button"
                          key={slot.start}
                          onDoubleClick={() => setIsEditing(true)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 1.1 }}
                          onClick={() => !isEditing && toggleTimeSlot(slot)}
                          className={`p-4 rounded-2xl text-[10px] font-black tracking-tight transition-all border-2 relative overflow-hidden group h-16 flex items-center justify-center ${
                            isSelected 
                              ? 'bg-primary text-white border-primary shadow-xl shadow-primary/30 z-10' 
                              : 'bg-white text-muted-foreground border-border hover:border-primary/40'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-0 right-0 p-1 bg-white text-primary rounded-bl-lg">
                              <RiCheckLine size={12} />
                            </div>
                          )}
                          
                          {isEditing ? (
                            <input
                              autoFocus
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => {
                                setIsEditing(false);
                                // Update logic if needed, for now just visual
                                if (isSelected) {
                                  setSelectedSlots(prev => prev.map(s => s.start === slot.start ? { ...s, display: editValue } : s));
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') setIsEditing(false);
                              }}
                              className="w-full h-full bg-white text-primary rounded-xl text-center outline-none border-none py-1"
                            />
                          ) : (
                            <span className="truncate">{isSelected ? selectedSlots.find(s => s.start === slot.start)?.display || slot.display : slot.display}</span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Capacity & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ml-1">Max Patients per Slot</Label>
                    <input 
                      type="number" min="1"
                      value={formData.capacity}
                      onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                      className="w-full p-5 rounded-2xl bg-secondary/10 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-black text-xl"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ml-1">Price per Slot (₱)</Label>
                    <input 
                      type="number" min="0" step="1"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full p-5 rounded-2xl bg-secondary/10 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-black text-xl"
                      required
                    />
                  </div>
                </div>

                {/* Accepted Payments */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ml-1">Supported Payments</Label>
                   <div className="flex flex-wrap gap-2">
                     {(['card', 'cash', 'bank_transfer', 'e_wallet', 'pay_on_site'] as PaymentOption[]).map(opt => (
                       <button
                         type="button"
                         key={opt}
                         onClick={() => togglePayment(opt)}
                         className={`px-4 py-2.5 rounded-xl text-[10px] font-black border-2 transition-all ${
                           formData.payment_options.includes(opt) 
                             ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' 
                             : 'border-border text-muted-foreground hover:border-primary/50 bg-white'
                         }`}
                       >
                         {opt.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                       </button>
                     ))}
                   </div>
                </div>

                {/* Digital Waitlist Toggle */}
                <label className="flex items-center gap-5 p-6 bg-primary/5 rounded-[2rem] border border-primary/10 cursor-pointer hover:bg-primary/10 transition-all group">
                   <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={formData.queue_enabled}
                        onChange={e => setFormData({...formData, queue_enabled: e.target.checked})}
                        className="w-6 h-6 accent-primary rounded-lg cursor-pointer"
                      />
                   </div>
                   <div>
                     <p className="font-black text-sm tracking-tight">Enable Digital Waitlist</p>
                     <p className="text-[10px] text-primary/60 uppercase font-black tracking-widest mt-0.5">Auto-queue if slots are full</p>
                   </div>
                </label>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={bulkCreate.isPending || !(mode === "single" ? date : dateRange?.from) || selectedSlots.length === 0}
                    className="w-full px-10 py-6 bg-primary text-white font-black text-xl rounded-[2rem] shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:bg-primary/90 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:transform-none flex justify-center items-center gap-4"
                  >
                    {bulkCreate.isPending ? "Publishing Sessions..." : <><RiSaveLine size={28} /> Publish {selectedSlots.length * (mode === "single" ? 1 : eachDayOfInterval({ start: dateRange!.from!, end: dateRange!.to! }).length)} Sessions</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
