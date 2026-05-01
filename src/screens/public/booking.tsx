"use client";

import { useSchedule, useCreateBooking } from "@/hooks/use-acupuncture";
import { useAuditLog } from "@/hooks/use-audit";
import { 
  Calendar, 
  Clock, 
  Phone, 
  Mail,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  Download,
  Share2,
  MapPin,
  CalendarCheck
} from "lucide-react";
import { CalendarSyncCard } from "@/components/calendar/CalendarSyncCard";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { formatTime12h } from "@/utils/time";
import { downloadIcsFile, generateGoogleCalendarUrl } from "@/utils/calendar";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/public-layout";

interface PublicBookingScreenProps {
  id: string;
}

export default function PublicBookingScreen({ id }: PublicBookingScreenProps) {
  const { data: schedule, isLoading: isScheduleLoading, error: scheduleError } = useSchedule(id);
  const createBooking = useCreateBooking();
  const { logAction } = useAuditLog();

  const [formData, setFormData] = useState({
    client_name: "",
    phone: "",
    email: "",
    notes: ""
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [bookingStatus, setBookingStatus] = useState<string>("confirmed");

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_name || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const confirmedCount = schedule?.bookings?.filter(b => b.status === "confirmed").length || 0;
      const isFull = schedule?.status === 'full' || confirmedCount >= (schedule?.capacity || 0);

      if (isFull && !schedule?.queue_enabled) {
        toast.error("This session is full and the waitlist is currently disabled.");
        return;
      }

      const result = await createBooking.mutateAsync({
        client_name: formData.client_name,
        phone: formData.phone,
        email: formData.email,
        notes: formData.notes,
        schedule_id: id,
        status: isFull ? 'queued' : 'confirmed',
        assigned_by: 'client'
      });
      
      logAction('NEW_BOOKING', result.id, 'booking', { 
        client_name: formData.client_name,
        schedule_id: id,
        status: result.status
      });

      setBookingRef(result.reference_code);
      setBookingStatus(result.status);
      setIsSuccess(true);
      toast.success(result.status === 'queued' ? "Added to waitlist!" : "Booking submitted successfully!");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to submit booking. Please try again.");
    }
  };

  if (isScheduleLoading) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  if (scheduleError || !schedule) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Session Not Found</h1>
          <p className="text-muted-foreground mb-6">The session you are looking for might have been removed or is no longer available.</p>
          <Button asChild variant="outline">
            <Link href="/book"> Back to Calendar</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  if (isSuccess) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-[2.5rem] p-8 md:p-12 text-center border-primary/20 shadow-2xl shadow-primary/10"
          >
            <div className={`w-20 h-20 ${bookingStatus === 'queued' ? 'bg-amber-500/20' : 'bg-primary/20'} rounded-full flex items-center justify-center mx-auto mb-6`}>
              {bookingStatus === 'queued' ? (
                <Clock className="w-10 h-10 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-10 h-10 text-primary" />
              )}
            </div>
            <h1 className="text-3xl font-display font-black mb-4">
              {bookingStatus === 'queued' ? "Waitlist Joined!" : "Booking Confirmed!"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {bookingStatus === 'queued' ? (
                <>
                  Thank you, <span className="font-bold text-foreground">{formData.client_name}</span>. 
                  You've been added to the waitlist for {format(new Date(schedule.date), 'MMMM dd, yyyy')}. 
                  We will notify you immediately if a spot becomes available and your booking is confirmed.
                </>
              ) : (
                <>
                  Thank you, <span className="font-bold text-foreground">{formData.client_name}</span>. 
                  Your session for {format(new Date(schedule.date), 'MMMM dd')} at {formatTime12h(schedule.start_time)} is all set.
                </>
              )}
            </p>
            
            <div className="bg-secondary/30 rounded-2xl p-6 mb-8 border border-secondary/50">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Reference Code</p>
              <p className="text-3xl font-display font-black text-primary tracking-tighter">{bookingRef}</p>
              <p className="text-xs text-muted-foreground mt-4">Please save this code for tracking your appointment.</p>
            </div>

            {bookingStatus === 'confirmed' && formData.email && (
              <div className="mb-8 text-left">
                <CalendarSyncCard 
                  email={formData.email} 
                  referenceCode={bookingRef}
                  isConfirmed={bookingStatus === 'confirmed'} 
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="rounded-xl px-8">
                <Link href="/track">Track Booking</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl px-8">
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-secondary/20 py-4 md:py-10 border-b border-border">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/book" className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-3 md:mb-6 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to sessions
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-md md:text-4xl font-display font-black text-foreground mb-1">Complete Your Booking</h1>
            <p className="text-sm md:text-base text-muted-foreground">Secure your spot for the acupuncture session.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-3 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mobile Compact Session Summary */}
            <Card className="lg:hidden border-border/50 shadow-sm rounded-2xl overflow-hidden">
              <div className="bg-primary/5 px-4 py-3 border-b border-border/50">
                <h3 className="font-display font-bold text-base">Session Details</h3>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-primary shrink-0 border border-secondary">
                      <MapPin size={14} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Location</p>
                      <p className="font-bold text-foreground leading-tight text-sm">{schedule.location || "Palawan Clinic"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-primary shrink-0 border border-secondary">
                      <Calendar size={14} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Date</p>
                      <p className="font-bold text-foreground leading-tight text-sm">
                        {format(new Date(schedule.date), 'EEEE, MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-primary shrink-0 border border-secondary">
                      <Clock size={14} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Session Duration</p>
                      <p className="font-bold text-foreground text-sm">
                        {formatTime12h(schedule.start_time)} - {formatTime12h(schedule.end_time)}
                      </p>
                      <div className="mt-0.5 flex flex-col gap-0.5">
                        <span className="text-[11px] font-medium text-foreground">45 minutes total</span>
                        <span className="text-[9px] text-muted-foreground font-medium">30m treatment • 15m assessment</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50">
                  <div className="flex justify-between items-end mb-0.5">
                    <span className="text-xs font-medium text-muted-foreground">Session Fee</span>
                    <span className="text-2xl font-display font-black text-foreground">₱{schedule.price}</span>
                  </div>
                  <p className="text-[10px] text-right text-muted-foreground">Payment will be settled on-site.</p>
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handleBook} className="space-y-6">
              <Card className="border-border/50 shadow-sm overflow-hidden rounded-3xl">
                <div className="h-2 bg-primary" />
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                      <div className="relative">
                        <Input 
                          id="name"
                          placeholder="John Doe" 
                          required
                          value={formData.client_name}
                          onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                          className="pl-10 h-12 rounded-xl border-border/50 focus:ring-primary/20"
                        />
                        <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="phone" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                        <div className="relative">
                          <Input 
                            id="phone"
                            type="tel"
                            placeholder="0917-000-0000" 
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="pl-10 h-12 rounded-xl border-border/50 focus:ring-primary/20"
                          />
                          <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address (Optional)</label>
                        <div className="relative">
                          <Input 
                            id="email"
                            type="email"
                            placeholder="john@example.com" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="pl-10 h-12 rounded-xl border-border/50 focus:ring-primary/20"
                          />
                          <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                        </div>
                      </div>
                    </div>


                    <div className="space-y-1.5">
                      <label htmlFor="notes" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Notes (Optional)</label>
                      <Textarea 
                        id="notes"
                        placeholder="Any specific concerns or medical conditions we should know about?" 
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="min-h-[100px] rounded-xl border-border/50 focus:ring-primary/20 resize-none"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit"
                disabled={createBooking.isPending}
                className="w-full py-7 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 group"
              >
                {createBooking.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Confirm Booking
                    <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground px-4">
                By clicking confirm, you agree to our terms of service and will receive a confirmation email.
              </p>
            </form>
          </div>

          {/* Sidebar / Summary */}
          <div className="hidden lg:block space-y-6">
            <Card className="border-border/50 shadow-sm rounded-3xl overflow-hidden sticky top-32">
              <div className="bg-primary/5 p-6 border-b border-border/50">
                <h3 className="font-display font-bold text-xl">Session Details</h3>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-primary shrink-0 border border-secondary">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Location</p>
                      <p className="font-bold text-foreground">
                        {schedule.location || "Palawan Clinic"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-primary shrink-0 border border-secondary">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date</p>
                      <p className="font-bold text-foreground">
                        {format(new Date(schedule.date), 'EEEE, MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-primary shrink-0 border border-secondary">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Session Duration</p>
                      <p className="font-bold text-foreground">
                        {formatTime12h(schedule.start_time)} - {formatTime12h(schedule.end_time)}
                      </p>
                      <div className="mt-1 flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-foreground">45 minutes total</span>
                        <span className="text-[10px] text-muted-foreground font-medium">30m treatment • 15m assessment</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-medium text-muted-foreground">Session Fee</span>
                    <span className="text-2xl font-display font-black text-foreground">₱{schedule.price}</span>
                  </div>
                  <p className="text-[10px] text-right text-muted-foreground">
                    Payment will be settled on-site.
                  </p>
                </div>

                {schedule.status === 'full' && schedule.queue_enabled && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs font-bold text-amber-700 uppercase flex items-center gap-1.5 mb-1">
                      <AlertCircle size={14} /> Queueing Available
                    </p>
                    <p className="text-[11px] text-amber-800 leading-snug">
                      This session is currently full. You will be added to the waitlist and notified if a spot becomes available.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
