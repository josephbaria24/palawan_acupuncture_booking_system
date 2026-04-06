"use client";

import { useAllBookings } from "@/hooks/use-acupuncture";
import { format } from "date-fns";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  ChevronRight, 
  ChevronDown, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  History,
  CheckCircle2,
  Clock3,
  XCircle,
  ExternalLink
} from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { formatTime12h } from "@/utils/time";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminClients() {
  const { data: bookings, isLoading } = useAllBookings();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  const clients = useMemo(() => {
    if (!bookings) return [];

    const grouped = bookings.reduce((acc, booking) => {
      const email = booking.email.toLowerCase().trim();
      if (!acc[email]) {
        acc[email] = {
          id: email,
          name: booking.client_name,
          email: booking.email,
          phone: booking.phone,
          bookings: []
        };
      }
      acc[email].bookings.push(booking);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings]);

  const filteredClients = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.email.toLowerCase().includes(q) || 
      c.phone.includes(q)
    );
  }, [clients, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading patient records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Users size={28} />
            </div>
            Clients
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">View and manage your patient database.</p>
        </div>
        
        <div className="relative w-full md:w-80 shadow-sm rounded-2xl overflow-hidden bg-white border border-border/40">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search size={18} className="text-muted-foreground/60" />
          </div>
          <Input
            type="text"
            placeholder="Search patients..."
            className="w-full border-none bg-transparent py-6 pl-11 pr-4 text-sm font-medium focus-visible:ring-0 rounded-none shadow-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Client List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-border/60">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No patients found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search query.</p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <div 
              key={client.id}
              className={cn(
                "group bg-white border border-border/40 rounded-[1.75rem] transition-all duration-300 overflow-hidden",
                expandedClientId === client.id ? "ring-2 ring-primary/20 shadow-xl shadow-primary/5" : "hover:shadow-lg hover:shadow-black/5"
              )}
            >
              {/* Client Summary Row */}
              <button 
                onClick={() => setExpandedClientId(expandedClientId === client.id ? null : client.id)}
                className="w-full text-left p-5 md:p-6 flex items-center gap-4 focus:outline-none"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary font-bold text-lg border border-secondary shadow-sm shrink-0">
                  {client.name.charAt(0)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground tracking-tight truncate">{client.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Mail size={12} className="shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Phone size={12} className="shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-6 shrink-0">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Records</span>
                    <span className="text-sm font-bold text-foreground">{client.bookings.length}</span>
                  </div>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    expandedClientId === client.id ? "bg-primary text-white rotate-180" : "bg-muted/30 text-muted-foreground"
                  )}>
                    <ChevronDown size={18} />
                  </div>
                </div>
              </button>

              {/* Expanded Profile & History */}
              <AnimatePresence>
                {expandedClientId === client.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="border-t border-border/40 bg-muted/5"
                  >
                    <div className="p-6 md:p-8 space-y-8">
                      {/* Detailed Info Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-3xl bg-white border border-border/40 shadow-sm shadow-black/[0.02]">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                              <History size={16} />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Quick Statistics</h4>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground font-medium">Account Created</span>
                              <span className="text-foreground font-bold">{format(new Date(client.bookings[client.bookings.length - 1].created_at), 'MMMM dd, yyyy')}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground font-medium">Total Appointments</span>
                              <span className="text-foreground font-bold">{client.bookings.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground font-medium">Last Visit</span>
                              <span className="text-foreground font-bold">{format(new Date(client.bookings[0].created_at), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 rounded-3xl bg-white border border-border/40 shadow-sm shadow-black/[0.02]">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                              <CheckCircle2 size={16} />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Top Service</h4>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <p className="text-sm font-bold text-foreground">Acupuncture Therapy</p>
                              <p className="text-[11px] text-muted-foreground font-medium mt-0.5 whitespace-nowrap">Most frequently booked service.</p>
                            </div>
                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 shadow-none border-emerald-100 rounded-lg py-1">Standard</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Booking History</h4>
                          <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-full">Sorted by newest</span>
                        </div>

                        <div className="space-y-3">
                          {client.bookings.map((booking: any) => (
                            <div 
                              key={booking.id}
                              className="group/item flex items-start gap-4 p-4 rounded-2xl bg-white border border-border/40 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all"
                            >
                              <div className="shrink-0 mt-1">
                                {booking.status === 'confirmed' ? (
                                  <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
                                    <CheckCircle2 size={16} />
                                  </div>
                                ) : booking.status === 'queued' ? (
                                  <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                                    <Clock3 size={16} />
                                  </div>
                                ) : (
                                  <div className="p-2 bg-red-500/10 text-red-600 rounded-xl">
                                    <XCircle size={16} />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <h5 className="text-sm font-bold text-foreground truncate">
                                    {booking.schedules?.title || "Regular Session"}
                                  </h5>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] font-bold h-5 px-1.5 rounded-md border-border/60 text-muted-foreground">
                                      {booking.reference_code}
                                    </Badge>
                                    <Link 
                                      href={`/admin/schedules/${booking.schedule_id}`}
                                      className="p-1.5 opacity-0 group-hover/item:opacity-100 text-primary hover:bg-primary/10 rounded-lg transition-all"
                                    >
                                      <ExternalLink size={14} />
                                    </Link>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <CalendarIcon size={12} className="text-muted-foreground/60" />
                                    <span>{format(new Date(booking.schedules?.date || booking.created_at), 'MMM dd, yyyy')}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock size={12} className="text-muted-foreground/60" />
                                    <span>{booking.schedules?.start_time ? formatTime12h(booking.schedules.start_time) : "N/A"}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <span className={cn(
                                      "w-1.5 h-1.5 rounded-full mt-0.5",
                                      booking.status === 'confirmed' ? "bg-emerald-500" : booking.status === 'queued' ? "bg-amber-500" : "bg-red-500"
                                    )} />
                                    <span className="font-bold text-muted-foreground capitalize">{booking.status}</span>
                                  </div>
                                </div>
                                {booking.notes && (
                                  <p className="mt-3 p-3 rounded-xl bg-muted/30 text-[11px] text-muted-foreground leading-relaxed italic border border-border/20">
                                    "{booking.notes}"
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
