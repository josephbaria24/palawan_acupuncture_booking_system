import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateIcsFile } from "@/utils/calendar";

export async function GET(request: NextRequest) {
  try {
    // Extract params
    const email = request.nextUrl.searchParams.get("email");
    const isAdmin = request.nextUrl.searchParams.get("admin") === "true";

    if (!email && !isAdmin) {
      return new NextResponse("Email or Admin required", { status: 400 });
    }

    let query = supabase.from("schedules").select(`*, bookings(id, status)`);

    if (isAdmin) {
      // Admin gets all schedules
      const { data: schedules, error } = await query
        .order('date', { ascending: true });
        
      if (error) throw new Error(`Supabase Error: ${error.message}`);
      
      const events = (schedules || []).map((schedule: any) => {
        const date = new Date(schedule.date);
        const [sh, sm] = (schedule.start_time || "08:00").split(':');
        const [eh, em] = (schedule.end_time || "08:30").split(':');
        const start = new Date(date);
        start.setHours(parseInt(sh), parseInt(sm), 0, 0);
        const end = new Date(date);
        end.setHours(parseInt(eh), parseInt(em), 0, 0);

        const confirmedCount = schedule.bookings?.filter((b: any) => b.status === 'confirmed').length || 0;

        return {
          title: `Clinic: ${schedule.title} (${confirmedCount}/${schedule.capacity})`,
          description: `Status: ${schedule.status}. Bookings: ${confirmedCount}. Notes: ${schedule.notes || 'None'}`,
          location: schedule.location || "Palawan Acupuncture Clinic",
          startTime: start.toISOString(),
          endTime: end.toISOString()
        };
      });

      return generateIcsResponse(events, "Palawan Clinic Master Schedule");
    }

    // Patient logic
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        *,
        schedules (*)
      `)
      .eq("email", email)
      .eq("status", "confirmed");

    if (error) throw new Error(`Supabase Error: ${error.message}`);

    const events = (bookings || []).map((booking: any) => {
      const schedule = booking.schedules;
      const date = new Date(schedule.date);
      const [sh, sm] = (schedule.start_time || "08:00").split(':');
      const [eh, em] = (schedule.end_time || "08:30").split(':');
      const start = new Date(date);
      start.setHours(parseInt(sh), parseInt(sm), 0, 0);
      const end = new Date(date);
      end.setHours(parseInt(eh), parseInt(em), 0, 0);

      return {
        title: `Acupuncture: ${schedule.title}`,
        description: `Appointment Ref: ${booking.reference_code}. Please arrive 15 mins early.`,
        location: schedule.location || "Palawan Acupuncture Clinic",
        startTime: start.toISOString(),
        endTime: end.toISOString()
      };
    });

    return generateIcsResponse(events, "My Acupuncture Bookings");
  } catch (error: any) {
    console.error("Calendar API Error:", error);
    return new NextResponse(`Calendar Error: ${error.message}`, { status: 500 });
  }
}

function generateIcsResponse(events: any[], calendarName: string) {
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Palawan Acupuncture//NONSGML v1.0//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calendarName}`,
    "X-WR-TIMEZONE:Asia/Manila",
    "X-PUBLISHED-TTL:PT1H",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Manila",
    "X-LIC-LOCATION:Asia/Manila",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0800",
    "TZOFFSETTO:+0800",
    "TZNAME:PST",
    "DTSTART:19700101T000000",
    "END:STANDARD",
    "END:VTIMEZONE",
  ].join("\r\n");

  if (events.length === 0) {
    // Add a dummy event to prevent "Empty Calendar" errors in some clients
    icsContent += "\r\n" + [
      "BEGIN:VEVENT",
      `DTSTAMP:${dtStamp}`,
      `DTSTART;TZID=Asia/Manila:${dtStamp.replace('Z', '')}`,
      `DTEND;TZID=Asia/Manila:${dtStamp.replace('Z', '')}`,
      "SUMMARY:Clinic Schedule Feed Active",
      "DESCRIPTION:This is a placeholder to confirm your calendar sync is working. Add schedules in the app to see them here.",
      "LOCATION:Palawan Acupuncture Clinic",
      "STATUS:CONFIRMED",
      "END:VEVENT",
    ].join("\r\n");
  }

  events.forEach(event => {
    // Format: 20260507T090000 (No Z at the end for TZID based time)
    const formatIcsLocalTime = (dateStr: string) => {
      const date = new Date(dateStr);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      const ss = String(date.getSeconds()).padStart(2, '0');
      return `${y}${m}${d}T${hh}${mm}${ss}`;
    };

    icsContent += "\r\n" + [
      "BEGIN:VEVENT",
      `DTSTAMP:${dtStamp}`,
      `DTSTART;TZID=Asia/Manila:${formatIcsLocalTime(event.startTime)}`,
      `DTEND;TZID=Asia/Manila:${formatIcsLocalTime(event.endTime)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
      `LOCATION:${event.location}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
    ].join("\r\n");
  });

  icsContent += "\r\nEND:VCALENDAR";

  return new NextResponse(icsContent, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="clinic-schedule.ics"`,
    },
  });
}
