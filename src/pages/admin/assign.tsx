import { AdminLayout } from "@/components/layout/admin-layout";
import { useSchedules, useCreateBooking } from "@/hooks/use-acupuncture";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { format } from "date-fns";
import { UserPlus } from "lucide-react";

export default function AssignClient() {
  const { data: schedules = [] } = useSchedules();
  const createBooking = useCreateBooking();
  const { toast } = useToast();

  const openSchedules = schedules.filter(s => s.status === 'open' || s.status === 'full');

  const [formData, setFormData] = useState({
    schedule_id: '',
    client_name: '',
    phone: '',
    email: '',
    notes: '',
    status: 'confirmed' as 'confirmed' | 'queued'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.schedule_id) {
      toast({ title: "Error", description: "Please select a schedule", variant: "destructive" });
      return;
    }

    createBooking.mutate({
      ...formData,
      assigned_by: 'admin'
    }, {
      onSuccess: () => {
        toast({ title: "Success!", description: "Client assigned successfully." });
        setFormData({ ...formData, client_name: '', phone: '', email: '', notes: '' }); // Reset form but keep schedule
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Assign Client</h1>
        <p className="text-muted-foreground mb-8">Manually add a patient to a schedule or waitlist.</p>

        <div className="glass-card rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold">Select Schedule</label>
              <select 
                value={formData.schedule_id}
                onChange={e => setFormData({...formData, schedule_id: e.target.value})}
                className="w-full p-3 rounded-xl border-2 border-border bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-medium"
                required
              >
                <option value="">-- Choose a session --</option>
                {openSchedules.map(s => (
                  <option key={s.id} value={s.id}>
                    {format(new Date(s.date), 'MMM do')} | {s.start_time} - {s.title} ({s.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Status Assignment</label>
              <div className="flex gap-4">
                <label className={`flex-1 p-3 border-2 rounded-xl flex items-center justify-center cursor-pointer transition-all ${formData.status === 'confirmed' ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-border text-muted-foreground'}`}>
                  <input type="radio" name="status" checked={formData.status === 'confirmed'} onChange={() => setFormData({...formData, status: 'confirmed'})} className="hidden" />
                  Confirmed Booking
                </label>
                <label className={`flex-1 p-3 border-2 rounded-xl flex items-center justify-center cursor-pointer transition-all ${formData.status === 'queued' ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold' : 'border-border text-muted-foreground'}`}>
                  <input type="radio" name="status" checked={formData.status === 'queued'} onChange={() => setFormData({...formData, status: 'queued'})} className="hidden" />
                  Add to Waitlist
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Full Name</label>
                <input 
                  type="text" required
                  value={formData.client_name}
                  onChange={e => setFormData({...formData, client_name: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-border focus:border-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Phone Number</label>
                <input 
                  type="tel" required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 rounded-xl border-2 border-border focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Email (Optional)</label>
              <input 
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 rounded-xl border-2 border-border focus:border-primary outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Internal Notes</label>
              <textarea 
                rows={3}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="w-full p-3 rounded-xl border-2 border-border focus:border-primary outline-none resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={createBooking.isPending}
              className="w-full py-4 bg-foreground text-background font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-primary hover:text-white transition-all duration-300 flex justify-center items-center gap-2"
            >
              {createBooking.isPending ? "Assigning..." : <><UserPlus size={20} /> Assign Patient</>}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
