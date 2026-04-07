"use client";

import { useSchedules, useCreateBooking, useAllBookings } from "@/hooks/use-acupuncture";
import { 
  UserPlus, 
  Calendar, 
  Clock, 
  Phone, 
  Mail,
  User,
  ArrowRight,
  Wallet,
  Search,
  CheckCircle2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { formatTime12h } from "@/utils/time";
import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminAssignClient() {
  const router = useRouter();
  const { data: schedules, isLoading: isSchedulesLoading } = useSchedules();
  const { data: allBookings } = useAllBookings();
  const createBooking = useCreateBooking();
  
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    client_name: "",
    phone: "",
    email: "",
    schedule_id: "",
    payment_method: "cash"
  });

  const [slotSearch, setSlotSearch] = useState("");

  const uniqueClients = useMemo(() => {
    if (!allBookings) return [];
    const clientsMap = new Map();
    allBookings.forEach(b => {
      const key = `${b.client_name.toLowerCase()}-${b.email.toLowerCase()}`;
      if (!clientsMap.has(key)) {
        clientsMap.set(key, {
          name: b.client_name,
          phone: b.phone,
          email: b.email
        });
      }
    });
    return Array.from(clientsMap.values());
  }, [allBookings]);

  const suggestions = useMemo(() => {
    if (!formData.client_name || !showSuggestions) return [];
    const query = formData.client_name.toLowerCase();
    return uniqueClients.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.email.toLowerCase().includes(query)
    ).slice(0, 5); // Limit to top 5 suggestions
  }, [uniqueClients, formData.client_name, showSuggestions]);

  const handleSelectClient = (client: any) => {
    setFormData({
      ...formData,
      client_name: client.name,
      phone: client.phone,
      email: client.email
    });
    setShowSuggestions(false);
  };

  const handleAssign = async () => {
    if (!formData.client_name || !formData.schedule_id) {
      toast.error("Please fill in the client name and select a slot");
      return;
    }

    try {
      await createBooking.mutateAsync({
        ...formData,
        status: 'confirmed',
        assigned_by: 'admin',
        notes: `Payment Method: ${formData.payment_method}`
      });
      toast.success("Client assigned successfully!");
      router.push("/admin");
    } catch (error) {
      toast.error("Failed to create booking");
    }
  };

  const openSchedules = schedules?.filter(s => s.status === 'open') || [];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Manual Client Assignment</h1>
        <p className="text-muted-foreground mt-1">Book a treatment session on behalf of a patient.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <div className="h-2 bg-primary" />
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User size={18} className="text-primary" />
                Patient Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5 relative">
                <label className="text-xs font-bold text-muted-foreground uppercase">Client Name</label>
                <div className="relative">
                  <Input 
                    placeholder="Full Name" 
                    value={formData.client_name}
                    onChange={(e) => {
                      setFormData({...formData, client_name: e.target.value});
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="pl-9"
                  />
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  
                  {formData.client_name && (
                    <button 
                      onClick={() => {
                        setFormData({...formData, client_name: "", phone: "", email: ""});
                        setShowSuggestions(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-white border border-border shadow-xl rounded-2xl z-50 overflow-hidden"
                    >
                      <div className="p-1">
                        <p className="text-[10px] font-bold text-muted-foreground p-2 uppercase tracking-widest">Existing Patients Found</p>
                        {suggestions.map((client, idx) => (
                          <button
                            key={`${client.email}-${idx}`}
                            onClick={() => handleSelectClient(client)}
                            className="w-full text-left p-3 rounded-xl hover:bg-secondary/20 transition-all flex items-center justify-between group"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{client.name}</span>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1 font-medium"><Phone size={10} /> {client.phone}</span>
                                <span className="flex items-center gap-1 font-medium"><Mail size={10} /> {client.email}</span>
                              </div>
                            </div>
                            <CheckCircle2 size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number</label>
                  <div className="relative">
                    <Input 
                      placeholder="09..." 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="pl-9"
                    />
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
                  <div className="relative">
                    <Input 
                    type="email"
                      placeholder="client@email.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="pl-9"
                    />
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Payment Method</label>
                <div className="relative">
                  <Select 
                    value={formData.payment_method}
                    onValueChange={(val) => setFormData({...formData, payment_method: val})}
                  >
                    <SelectTrigger className="h-12 border-border/50 focus:ring-primary/20 pl-9">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50">
                      <SelectItem value="cash" className="font-medium">Cash (Pay on site)</SelectItem>
                      <SelectItem value="gcash" className="font-medium">GCash</SelectItem>
                      <SelectItem value="bank" className="font-medium">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Wallet size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none z-10" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleAssign} 
            className="w-full py-6 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
            disabled={createBooking.isPending}
          >
            {createBooking.isPending ? "Processing..." : "Complete Assignment"}
            <ArrowRight size={20} />
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                Select Session Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Acupuncture Slot</label>
                  {formData.schedule_id && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-[10px] font-bold text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => setFormData({ ...formData, schedule_id: "" })}
                    >
                      Clear selection
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 h-4 w-4" />
                    <Input
                      placeholder="Search date or time..."
                      className="pl-9 h-10 bg-muted/30 border-transparent focus:bg-background transition-colors text-sm font-medium rounded-xl"
                      value={slotSearch}
                      onChange={(e) => setSlotSearch(e.target.value)}
                    />
                  </div>

                  {/* Scrollable list */}
                  <div className="border border-border/50 rounded-[1.5rem] overflow-hidden bg-background/50">
                    <ScrollArea className="h-[280px]">
                      <div className="p-2 space-y-1">
                        {openSchedules
                          .filter(s => {
                            const dateStr = format(new Date(s.date), 'MMMM dd, yyyy').toLowerCase();
                            const timeStr = `${formatTime12h(s.start_time)} - ${formatTime12h(s.end_time)}`.toLowerCase();
                            const query = slotSearch.toLowerCase();
                            return dateStr.includes(query) || timeStr.includes(query);
                          })
                          .map((schedule) => {
                            const isSelected = formData.schedule_id === schedule.id;
                            return (
                              <button
                                key={schedule.id}
                                onClick={() => setFormData({ ...formData, schedule_id: schedule.id })}
                                className={cn(
                                  "w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group",
                                  isSelected 
                                    ? "bg-primary text-white shadow-md shadow-primary/20 ring-1 ring-primary/30" 
                                    : "hover:bg-primary/5 text-foreground"
                                )}
                              >
                                <div className="flex flex-col gap-0.5">
                                  <span className={cn(
                                    "text-sm font-bold tracking-tight",
                                    isSelected ? "text-white" : "text-foreground"
                                  )}>
                                    {format(new Date(schedule.date), 'EEEE, MMM dd, yyyy')}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <Clock className={cn(
                                      "size-3",
                                      isSelected ? "text-white/70" : "text-muted-foreground/60"
                                    )} />
                                    <span className={cn(
                                      "text-[11px] font-medium",
                                      isSelected ? "text-white/80" : "text-muted-foreground"
                                    )}>
                                      {formatTime12h(schedule.start_time)} - {formatTime12h(schedule.end_time)}
                                    </span>
                                  </div>
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className="size-5 text-white" />
                                )}
                              </button>
                            );
                          })}

                        {openSchedules.filter(s => {
                          const dateStr = format(new Date(s.date), 'MMMM dd, yyyy').toLowerCase();
                          const timeStr = `${formatTime12h(s.start_time)} - ${formatTime12h(s.end_time)}`.toLowerCase();
                          const query = slotSearch.toLowerCase();
                          return dateStr.includes(query) || timeStr.includes(query);
                        }).length === 0 && (
                          <div className="p-8 text-center space-y-2">
                            <div className="w-10 h-10 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                              <Calendar className="size-5 text-muted-foreground/40" />
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">No results for "{slotSearch}"</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>

              {formData.schedule_id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-4 rounded-2xl bg-secondary/30 border border-secondary/50"
                >
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Selected Session Summary</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center text-primary shadow-sm">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Date</p>
                        <p className="text-xs font-bold text-foreground">
                          {format(new Date(openSchedules.find(s => s.id === formData.schedule_id)?.date || new Date()), 'EEE, MMM dd')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center text-primary shadow-sm">
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Slot Window</p>
                        <p className="text-xs font-bold text-foreground">
                          {openSchedules.find(s => s.id === formData.schedule_id) ? 
                            `${formatTime12h(openSchedules.find(s => s.id === formData.schedule_id)!.start_time)} - ${formatTime12h(openSchedules.find(s => s.id === formData.schedule_id)!.end_time)}` 
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
