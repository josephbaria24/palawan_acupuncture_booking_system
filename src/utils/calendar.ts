import { format } from "date-fns";

export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  // Google Calendar Template URL: https://www.google.com/calendar/render?action=TEMPLATE&text=...&dates=...&details=...&location=...
  const formatTime = (date: string) => format(new Date(date), "yyyyMMdd'T'HHmmss'Z'");
  
  const url = new URL("https://www.google.com/calendar/render");
  url.searchParams.append("action", "TEMPLATE");
  url.searchParams.append("text", event.title);
  url.searchParams.append("dates", `${formatTime(event.startTime)}/${formatTime(event.endTime)}`);
  url.searchParams.append("details", event.description);
  url.searchParams.append("location", event.location);
  
  return url.toString();
}

const formatIcsTime = (date: Date) => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export function generateIcsFile(event: CalendarEvent): string {
  const dtStamp = formatIcsTime(new Date());
  const dtStart = formatIcsTime(new Date(event.startTime));
  const dtEnd = formatIcsTime(new Date(event.endTime));
  
  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Palawan Acupuncture//NONSGML v1.0//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  
  return icsLines.join("\r\n");
}

export function downloadIcsFile(event: CalendarEvent) {
  const content = generateIcsFile(event);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `appointment-${format(new Date(event.startTime), "yyyy-MM-dd")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
