import { v4 as uuidv4 } from 'uuid';

// Types
export type PaymentOption = 'cash' | 'card' | 'bank_transfer' | 'e_wallet' | 'pay_on_site';
export type ScheduleStatus = 'open' | 'full' | 'closed' | 'completed';
export type BookingStatus = 'confirmed' | 'queued' | 'cancelled';

export interface Schedule {
  id: string;
  title?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  slotDuration: number; // minutes
  capacity: number;
  queueEnabled: boolean;
  price: number;
  paymentOptions: PaymentOption[];
  notes: string;
  status: ScheduleStatus;
  createdAt: string;
}

export interface Booking {
  id: string;
  scheduleId: string;
  clientName: string;
  phone: string;
  email: string;
  notes: string;
  status: BookingStatus;
  queuePosition?: number;
  assignedBy: 'client' | 'admin';
  createdAt: string;
}

// Initial Seed Data
const seedSchedules: Schedule[] = [
  {
    id: 'sched-1',
    title: 'Morning Healing Session',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '12:00',
    slotDuration: 30,
    capacity: 6,
    queueEnabled: true,
    price: 120,
    paymentOptions: ['card', 'cash'],
    notes: 'Please arrive 10 mins early.',
    status: 'open',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sched-2',
    title: 'Deep Tissue & Acupuncture',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    startTime: '13:00',
    endTime: '17:00',
    slotDuration: 45,
    capacity: 5,
    queueEnabled: true,
    price: 150,
    paymentOptions: ['card', 'pay_on_site'],
    notes: 'Extended sessions available.',
    status: 'open',
    createdAt: new Date().toISOString()
  }
];

const seedBookings: Booking[] = [
  {
    id: 'book-1',
    scheduleId: 'sched-1',
    clientName: 'Sarah Jenkins',
    phone: '555-0101',
    email: 'sarah@example.com',
    notes: 'First time patient',
    status: 'confirmed',
    assignedBy: 'client',
    createdAt: new Date().toISOString()
  },
  {
    id: 'book-2',
    scheduleId: 'sched-1',
    clientName: 'Michael Chen',
    phone: '555-0102',
    email: 'michael@example.com',
    notes: 'Lower back pain',
    status: 'confirmed',
    assignedBy: 'admin',
    createdAt: new Date().toISOString()
  }
];

// DB Wrapper
class MockDatabase {
  private get<T>(key: string, seed: T): T {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(data) as T;
  }

  private set<T>(key: string, data: T) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- Schedules ---
  getSchedules(): Schedule[] {
    return this.get<Schedule[]>('acu_schedules', seedSchedules).sort((a, b) => 
      new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime()
    );
  }

  getSchedule(id: string): Schedule | undefined {
    return this.getSchedules().find(s => s.id === id);
  }

  createSchedule(data: Omit<Schedule, 'id' | 'createdAt' | 'status'>): Schedule {
    const schedules = this.getSchedules();
    const newSchedule: Schedule = {
      ...data,
      id: `sched-${uuidv4().substring(0, 8)}`,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    this.set('acu_schedules', [...schedules, newSchedule]);
    return newSchedule;
  }

  updateSchedule(id: string, data: Partial<Schedule>): Schedule {
    const schedules = this.getSchedules();
    const index = schedules.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Schedule not found');
    
    schedules[index] = { ...schedules[index], ...data };
    this.set('acu_schedules', schedules);
    return schedules[index];
  }

  deleteSchedule(id: string) {
    const schedules = this.getSchedules().filter(s => s.id !== id);
    this.set('acu_schedules', schedules);
    // Also delete associated bookings
    const bookings = this.getBookings().filter(b => b.scheduleId !== id);
    this.set('acu_bookings', bookings);
  }

  // --- Bookings ---
  getBookings(): Booking[] {
    return this.get<Booking[]>('acu_bookings', seedBookings).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getBookingsForSchedule(scheduleId: string): Booking[] {
    return this.getBookings().filter(b => b.scheduleId === scheduleId);
  }

  createBooking(data: Omit<Booking, 'id' | 'createdAt' | 'queuePosition'>): Booking {
    const bookings = this.getBookings();
    const scheduleBookings = bookings.filter(b => b.scheduleId === data.scheduleId && b.status === 'confirmed');
    const schedule = this.getSchedule(data.scheduleId);
    
    if (!schedule) throw new Error('Schedule not found');

    let status = data.status;
    let queuePosition = undefined;

    // Auto-queue logic if full
    if (scheduleBookings.length >= schedule.capacity && status === 'confirmed') {
      if (schedule.queueEnabled) {
        status = 'queued';
        const queuedCount = bookings.filter(b => b.scheduleId === data.scheduleId && b.status === 'queued').length;
        queuePosition = queuedCount + 1;
      } else {
        throw new Error('Schedule is full and queue is not enabled');
      }
    }

    const newBooking: Booking = {
      ...data,
      id: `book-${uuidv4().substring(0, 8)}`,
      status,
      queuePosition,
      createdAt: new Date().toISOString()
    };

    this.set('acu_bookings', [...bookings, newBooking]);

    // Update schedule status if just became full
    if (status === 'confirmed' && scheduleBookings.length + 1 >= schedule.capacity) {
      this.updateSchedule(schedule.id, { status: 'full' });
    }

    return newBooking;
  }

  updateBookingStatus(id: string, status: BookingStatus): Booking {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Booking not found');

    const booking = bookings[index];
    const scheduleId = booking.scheduleId;
    
    bookings[index].status = status;
    if (status !== 'queued') {
      bookings[index].queuePosition = undefined;
    }

    this.set('acu_bookings', bookings);

    // Re-evaluate queue positions for this schedule
    const queuedBookings = this.getBookingsForSchedule(scheduleId)
      .filter(b => b.status === 'queued')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    const updatedBookings = this.getBookings();
    queuedBookings.forEach((qb, i) => {
      const idx = updatedBookings.findIndex(b => b.id === qb.id);
      if (idx !== -1) updatedBookings[idx].queuePosition = i + 1;
    });
    this.set('acu_bookings', updatedBookings);

    // Re-evaluate schedule status
    const schedule = this.getSchedule(scheduleId);
    if (schedule) {
      const confirmedCount = this.getBookingsForSchedule(scheduleId).filter(b => b.status === 'confirmed').length;
      if (confirmedCount < schedule.capacity && schedule.status === 'full') {
        this.updateSchedule(scheduleId, { status: 'open' });
      } else if (confirmedCount >= schedule.capacity && schedule.status === 'open') {
        this.updateSchedule(scheduleId, { status: 'full' });
      }
    }

    return bookings[index];
  }
}

export const db = new MockDatabase();
