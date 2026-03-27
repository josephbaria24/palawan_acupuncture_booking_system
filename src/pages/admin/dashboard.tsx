import { AdminLayout } from "@/components/layout/admin-layout";
import { useSchedules, useBookings } from "@/hooks/use-acupuncture";
import { Users, Calendar, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { ScheduleBadge, BookingBadge } from "@/components/ui/status-badge";

export default function AdminDashboard() {
  const { data: schedules = [], isLoading: loadingSchedules } = useSchedules();
  const { data: bookings = [], isLoading: loadingBookings } = useBookings();

  const today = format(new Date(), 'yyyy-MM-dd');
  
  const todaysSchedules = schedules.filter(s => s.date === today);
  const totalBookedSlots = bookings.filter(b => b.status === 'confirmed').length;
  const queuedClients = bookings.filter(b => b.status === 'queued').length;
  
  // Rough revenue estimate (confirmed bookings * price of their schedule)
  const estimatedRevenue = bookings.filter(b => b.status === 'confirmed').reduce((acc, booking) => {
    const schedule = schedules.find(s => s.id === booking.schedule_id);
    return acc + (schedule?.price || 0);
  }, 0);

  if (loadingSchedules || loadingBookings) {
    return <AdminLayout><div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening at the clinic today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Today's Sessions" 
          value={todaysSchedules.length} 
          icon={<Calendar className="text-primary" />} 
          trend="Active today"
        />
        <StatCard 
          title="Total Bookings" 
          value={totalBookedSlots} 
          icon={<Users className="text-blue-500" />} 
          trend="Confirmed slots"
        />
        <StatCard 
          title="Waitlist" 
          value={queuedClients} 
          icon={<Clock className="text-amber-500" />} 
          trend="Pending queue"
        />
        <StatCard 
          title="Est. Revenue" 
          value={`₱${estimatedRevenue}`} 
          icon={<TrendingUp className="text-emerald-500" />} 
          trend="From confirmed"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Schedules */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-display">Upcoming Schedules</h2>
            <Link href="/admin/schedules" className="text-sm text-primary font-medium hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {schedules.slice(0, 5).map(schedule => (
              <Link key={schedule.id} href={`/admin/schedules/${schedule.id}`}>
                <div className="group flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-secondary/20 transition-all cursor-pointer">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-lg bg-secondary flex flex-col items-center justify-center text-primary font-bold">
                      <span className="text-xs font-medium uppercase opacity-80">{format(new Date(schedule.date), 'MMM')}</span>
                      <span>{format(new Date(schedule.date), 'dd')}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{schedule.title || 'Acupuncture Session'}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock size={14} /> {schedule.start_time} - {schedule.end_time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <ScheduleBadge status={schedule.status} />
                    <p className="text-xs text-muted-foreground mt-2 font-medium">
                      {bookings.filter(b => b.schedule_id === schedule.id && b.status === 'confirmed').length} / {schedule.capacity} booked
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {schedules.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                No upcoming schedules. <Link href="/admin/schedules/new" className="text-primary hover:underline">Create one</Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold font-display mb-6">Recent Bookings</h2>
          <div className="space-y-4">
            {bookings.slice(0, 6).map(booking => (
              <div key={booking.id} className="flex items-start gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  {booking.client_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{booking.client_name}</p>
                  <p className="text-xs text-muted-foreground truncate">For {schedules.find(s=>s.id === booking.schedule_id)?.title || 'Session'}</p>
                </div>
                <BookingBadge status={booking.status} />
              </div>
            ))}
            {bookings.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string | number, icon: React.ReactNode, trend: string }) {
  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-secondary/50 rounded-xl">{icon}</div>
      </div>
      <h3 className="text-3xl font-display font-bold text-foreground mb-1">{value}</h3>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground font-medium">
        {trend}
      </div>
    </div>
  )
}
