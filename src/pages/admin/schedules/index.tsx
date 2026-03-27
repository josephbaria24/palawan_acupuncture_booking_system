import { AdminLayout } from "@/components/layout/admin-layout";
import { useSchedules, useBookings } from "@/hooks/use-acupuncture";
import { Link } from "wouter";
import { format } from "date-fns";
import { Plus, Search, MapPin, Clock, Users } from "lucide-react";
import { ScheduleBadge } from "@/components/ui/status-badge";
import { useState } from "react";

export default function SchedulesList() {
  const { data: schedules = [], isLoading } = useSchedules();
  const { data: bookings = [] } = useBookings();
  const [filter, setFilter] = useState('');

  const filteredSchedules = schedules.filter(s => 
    (s.title?.toLowerCase() || '').includes(filter.toLowerCase()) ||
    s.date.includes(filter)
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Schedules</h1>
          <p className="text-muted-foreground mt-1">Manage your clinic's availability.</p>
        </div>
        <Link href="/admin/schedules/new" className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:bg-primary/90 hover:-translate-y-0.5 transition-all flex items-center gap-2 shrink-0">
          <Plus size={18} /> New Schedule
        </Link>
      </div>

      <div className="glass-card p-2 rounded-2xl mb-8 flex items-center px-4">
        <Search className="text-muted-foreground mr-3" size={20} />
        <input 
          type="text" 
          placeholder="Search by title or date (YYYY-MM-DD)..." 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-transparent border-none py-3 outline-none focus:ring-0 placeholder:text-muted-foreground"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-card rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedules.map(schedule => {
            const bookedCount = bookings.filter(b => b.schedule_id === schedule.id && b.status === 'confirmed').length;
            const queuedCount = bookings.filter(b => b.schedule_id === schedule.id && b.status === 'queued').length;
            
            return (
              <Link key={schedule.id} href={`/admin/schedules/${schedule.id}`}>
                <div className="glass-card rounded-2xl p-6 h-full border border-border hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <ScheduleBadge status={schedule.status} />
                    <span className="font-display font-bold text-lg text-primary">₱{schedule.price}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {schedule.title || 'Acupuncture Session'}
                  </h3>
                  
                  <div className="space-y-2 mb-6 flex-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary/70" />
                      {format(new Date(schedule.date), 'EEEE, MMMM do, yyyy')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary/70" />
                      {schedule.start_time} - {schedule.end_time} ({schedule.slot_duration}m slots)
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary/70" />
                      {bookedCount} / {schedule.capacity} Booked
                      {queuedCount > 0 && <span className="text-amber-500 font-medium ml-1">({queuedCount} queued)</span>}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border flex justify-between items-center text-sm font-medium text-primary">
                    Manage Schedule &rarr;
                  </div>
                </div>
              </Link>
            )
          })}
          
          {filteredSchedules.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted-foreground bg-card border-2 border-dashed border-border rounded-2xl">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No schedules found</h3>
              <p>Create a new schedule to start accepting bookings.</p>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

// Temporary icon to avoid importing Calendar twice
function CalendarIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
}
