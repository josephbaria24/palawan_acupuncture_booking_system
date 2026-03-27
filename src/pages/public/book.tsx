import { useParams, Link } from "wouter";
import { PublicLayout } from "@/components/layout/public-layout";
import { useSchedule, useCreateBooking } from "@/hooks/use-acupuncture";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, ArrowLeft, ShieldCheck, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

export default function PublicBooking() {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const { data: schedule, isLoading } = useSchedule(scheduleId);
  const createBooking = useCreateBooking();
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<{ reference_code: string } | null>(null);

  const [formData, setFormData] = useState({
    client_name: '',
    phone: '',
    email: '',
    notes: ''
  });

  if (isLoading) return <PublicLayout><div className="text-center py-32 animate-pulse font-medium text-muted-foreground">Loading session details...</div></PublicLayout>;
  if (!schedule) return <PublicLayout><div className="text-center py-32 text-destructive font-bold text-xl">Session not found.</div></PublicLayout>;

  const isFull = schedule.status === 'full';
  
  if (isFull && !schedule.queue_enabled) {
    return (
      <PublicLayout>
        <div className="max-w-xl mx-auto py-20 px-4 text-center">
          <h1 className="text-3xl font-display font-bold mb-4">Session Full</h1>
          <p className="text-muted-foreground mb-8">Sorry, this session is fully booked and waitlisting is disabled.</p>
          <Link href="/book" className="text-primary font-bold hover:underline">Browse other sessions</Link>
        </div>
      </PublicLayout>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBooking.mutate({
      schedule_id: schedule.id,
      ...formData,
      status: 'confirmed', // backend hook logic will switch to queued if full
      assigned_by: 'client'
    }, {
      onSuccess: (data) => {
        setCreatedBooking(data);
        setSuccess(true);
        window.scrollTo(0,0);
      },
      onError: (err: any) => {
        toast({ title: "Booking failed", description: err.message, variant: "destructive" });
      }
    });
  };

  if (success && createdBooking) {
    return (
      <PublicLayout>
        <div className="max-w-xl mx-auto py-10 md:py-20 px-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="glass-card rounded-3xl p-6 md:p-10 text-center border border-primary/20 shadow-2xl shadow-primary/10"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={40} />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">Request Received!</h1>
            <p className="text-muted-foreground mb-4">
              {isFull ? "You have been added to the waitlist. We will contact you if a slot opens up." : "Your booking is confirmed. We look forward to seeing you."}
            </p>

            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mb-8 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Booking Reference</p>
              <p className="text-3xl font-black font-display text-primary tracking-widest">{createdBooking.reference_code}</p>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Save this code to track your appointment status at <Link href="/track" className="underline hover:text-primary">palawanacupuncture.com/track</Link>
              </p>
            </div>
            
            <div className="bg-secondary/30 p-5 rounded-2xl text-left mb-8 space-y-3 text-sm font-medium">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Session:</span>
                <span className="text-foreground">{schedule.title}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Date:</span>
                <span className="text-foreground">{format(new Date(schedule.date), 'EEEE, MMM do')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="text-foreground">{schedule.start_time} - {schedule.end_time}</span>
              </div>
            </div>

            <Link href="/" className="px-8 py-3 bg-foreground text-background font-bold rounded-xl hover:bg-primary hover:text-white transition-colors inline-block">
              Return Home
            </Link>
          </motion.div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 lg:py-20">
        <Link href="/book" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft size={16} className="mr-1" /> Back to Calendar
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Form */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <h1 className="text-3xl font-display font-bold mb-2">
              {isFull ? "Join the Waitlist" : "Secure your spot"}
            </h1>
            <p className="text-muted-foreground mb-8">Please provide your details below. Your information is kept strictly confidential.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Full Name <span className="text-primary">*</span></label>
                <input 
                  type="text" required
                  value={formData.client_name}
                  onChange={e => setFormData({...formData, client_name: e.target.value})}
                  className="w-full p-3 sm:p-4 rounded-2xl bg-white border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
                  placeholder="Jane Doe"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Phone Number <span className="text-primary">*</span></label>
                  <input 
                    type="tel" required
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-3 sm:p-4 rounded-2xl bg-white border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
                    placeholder="(555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Email <span className="text-primary">*</span></label>
                  <input 
                    type="email" required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 sm:p-4 rounded-2xl bg-white border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Reason for visit / Notes</label>
                <textarea 
                  rows={4}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-3 sm:p-4 rounded-2xl bg-white border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm resize-none"
                  placeholder="Briefly describe what you'd like to focus on..."
                />
              </div>

              <button 
                type="submit"
                disabled={createBooking.isPending}
                className={`w-full py-3 sm:py-4 rounded-2xl font-bold text-lg text-white shadow-xl transition-all duration-300 disabled:opacity-50 disabled:transform-none ${
                  isFull ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25' : 'bg-primary hover:bg-primary/90 shadow-primary/25 hover:-translate-y-1'
                }`}
              >
                {createBooking.isPending ? "Processing..." : (isFull ? "Join Waitlist" : "Confirm Booking")}
              </button>
            </form>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="glass-card rounded-3xl p-5 sm:p-6 lg:p-8 sticky top-32">
              <h3 className="font-display font-bold text-xl mb-6 border-b border-border pb-4">Session Details</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Session Type</p>
                  <p className="font-bold text-lg">{schedule.title}</p>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-secondary/50 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Date</p>
                    <p className="font-bold">{format(new Date(schedule.date), 'EEEE, MMMM do, yyyy')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-secondary/50 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Time</p>
                    <p className="font-bold">{schedule.start_time} - {schedule.end_time}</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-border">
                   <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Total Cost</p>
                    <p className="font-display font-black text-2xl text-foreground">₱{schedule.price}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Accepts: {schedule.payment_options.map(p => p.replace('_', ' ')).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
              
              {isFull && (
                <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium">
                  <strong>Note:</strong> This session is currently full. By proceeding, you will be placed on our priority waitlist.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}
