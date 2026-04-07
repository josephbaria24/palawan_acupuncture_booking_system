import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const { booking, schedule, type = 'confirmation' } = await req.json();

    if (!booking) {
      return NextResponse.json({ error: "Missing booking credentials" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://palawan_acupuncture_booking_system.vercel.app'}/track/${booking.reference_code}`;
    const formattedDate = schedule?.date ? format(new Date(schedule.date), 'EEEE, MMMM dd, yyyy') : 'No date specified';

    // Convert 24h to 12h: "08:00" -> "8:00 AM"
    const format12h = (timeStr: string) => {
      try {
        const [hours, minutes] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return format(date, 'h:mm a');
      } catch (e) {
        return timeStr;
      }
    };

    const formattedTime = schedule
      ? `${format12h(schedule.start_time)} - ${format12h(schedule.end_time)}`
      : 'No time specified';

    // Google Calendar Link Generation (Isomorphic for Email)
    let googleCalendarUrl = "";
    if (schedule && booking.status === 'confirmed') {
      const formatGCalTime = (d: string, t: string) => {
        const [h, m] = t.split(':');
        const date = new Date(d);
        date.setHours(parseInt(h), parseInt(m), 0, 0);
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      const start = formatGCalTime(schedule.date, schedule.start_time);
      const end = formatGCalTime(schedule.date, schedule.end_time);
      
      const url = new URL("https://www.google.com/calendar/render");
      url.searchParams.append("action", "TEMPLATE");
      url.searchParams.append("text", `Acupuncture Session: ${schedule.title}`);
      url.searchParams.append("dates", `${start}/${end}`);
      url.searchParams.append("details", `Your acupuncture appointment (Ref: ${booking.reference_code}). Please arrive 15 minutes early.`);
      url.searchParams.append("location", "Palawan Clinic");
      googleCalendarUrl = url.toString();
    }

    // --- Dynamic Content Logic ---
    let subject = `Booking Confirmed [${booking.reference_code}] - Palawan Acupuncture`;
    let heroTitle = "Wait, we've got you!";
    let heroDescription = `Hello <strong>${booking.client_name}</strong>, your session has been successfully booked. We've locked your slot and notified our clinic practitioners.`;
    let brandColor = "#10B981"; // Emerald for confirmed

    if (type === 'waitlist') {
      subject = `Waitlist Joined [${booking.reference_code}] - Palawan Acupuncture`;
      heroTitle = "You're on the list!";
      heroDescription = `Hello <strong>${booking.client_name}</strong>, the session is currently full, so we've added you to the waitlist. We will notify you immediately if a spot becomes available.`;
      brandColor = "#F59E0B"; // Amber for waitlist
    } else if (type === 'promotion') {
      subject = `Great News: Your Spot is Confirmed! [${booking.reference_code}]`;
      heroTitle = "You're officially in!";
      heroDescription = `Hello <strong>${booking.client_name}</strong>, good news! A spot has opened up and your booking has been promoted from the waitlist to **Confirmed**. Your appointment is now secured.`;
      brandColor = "#10B981"; // Emerald for confirmed
    }

    // --- Patient Confirmation Email (Premium & High-Compatibility) ---
    const patientHtml = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${subject}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #FDFBFA; }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #FDFBFA;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FDFBFA;">
          <tr>
            <td align="center" style="padding: 40px 10px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E1DD; box-shadow: 0 4px 50px rgba(97, 63, 46, 0.08);">
                
                <!-- Header / Logo -->
                <tr>
                  <td align="left" style="padding: 40px 40px 10px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td>
                          <div style="font-weight: 800; font-size: 14px; letter-spacing: 0.15em; color: ${brandColor}; text-transform: uppercase;">Palawan <span style="color: #111827;">Acupuncture</span></div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Hero Message -->
                <tr>
                  <td align="left" style="padding: 20px 40px 40px;">
                    <div style="font-size: 32px; font-weight: 800; line-height: 1.1; color: #111827; margin-bottom: 20px; letter-spacing: -0.03em;">${heroTitle}</div>
                    <div style="font-size: 16px; line-height: 1.6; color: #64748B;">${heroDescription}</div>
                  </td>
                </tr>

                <!-- Reference Card -->
                <tr>
                  <td align="center" style="padding: 0 40px 40px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 16px; padding: 24px;">
                      <tr>
                        <td align="center">
                          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94A3B8; margin-bottom: 8px;">Booking Reference Code</div>
                          <div style="font-size: 32px; font-weight: 900; color: ${brandColor}; letter-spacing: 0.15em; font-family: 'Courier New', Courier, monospace;">${booking.reference_code}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Session Details Table -->
                <tr>
                  <td align="left" style="padding: 0 40px 40px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #F1F5F9; padding-top: 24px;">
                      <tr>
                        <td width="35%" style="padding-bottom: 12px; font-size: 13px; font-weight: 600; color: #64748B;">Patient</td>
                        <td width="65%" style="padding-bottom: 12px; font-size: 14px; font-weight: 700; color: #111827;">${booking.client_name}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; font-size: 13px; font-weight: 600; color: #64748B;">Session Type</td>
                        <td style="padding-bottom: 12px; font-size: 14px; font-weight: 700; color: #111827;">${schedule?.title || 'Relief Acupuncture'}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 12px; font-size: 13px; font-weight: 600; color: #64748B;">Scheduled Date</td>
                        <td style="padding-bottom: 12px; font-size: 14px; font-weight: 700; color: #111827;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 24px; font-size: 13px; font-weight: 600; color: #64748B;">Time Window</td>
                        <td style="padding-bottom: 24px; font-size: 14px; font-weight: 700; color: #111827;">${formattedTime}</td>
                      </tr>
                    </table>
                    
                    <div style="font-size: 13px; color: #94A3B8; font-style: italic; background-color: #F1F5F9; padding: 12px 16px; border-radius: 12px; margin-bottom: 24px;">
                      Note: Please arrive 15 minutes early. ${type === 'waitlist' ? 'Since you are on the Waitlist, we will only secure your slot if a spot opens up.' : 'Your spot is now secured.'}
                    </div>

                    ${googleCalendarUrl ? `
                    <div style="text-align: center;">
                      <a href="${googleCalendarUrl}" style="display: inline-block; font-size: 13px; color: #10B981; text-decoration: none; font-weight: 700; border: 1px solid #10B981; padding: 10px 20px; border-radius: 10px;">+ Add to Google Calendar</a>
                    </div>
                    ` : ''}
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding: 0 40px 40px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${trackingUrl}" style="display: block; background-color: #111827; color: #ffffff !important; text-decoration: none; padding: 18px 24px; border-radius: 14px; font-weight: 800; font-size: 16px; text-align: center; box-shadow: 0 10px 20px rgba(17, 24, 39, 0.15);">Track Status & Details</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 0 40px 40px; color: #94A3B8; font-size: 11px; line-height: 1.5; font-weight: 500;">
                    &copy; ${new Date().getFullYear()} Palawan Acupuncture Clinic. Healing with heart.<br/>
                    Pure wellness located at the heart of Palawan.<br/>
                    <a href="https://palawan_acupuncture_booking_system.vercel.app" style="color: #64748B; text-decoration: underline;">Visit Our Website</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // --- Admin Alert Email ---
    const adminHtml = `
      <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="margin-top: 0;">New Booking Alert 🔔 ${type === 'waitlist' ? '(Waitlist)' : ''}</h2>
        <p>A new clinic session has been booked via the public portal.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
        <div style="font-size: 14px; line-height: 2;">
          <b>Patient:</b> ${booking.client_name}<br/>
          <b>Phone:</b> ${booking.phone}<br/>
          <b>Session:</b> ${schedule?.title || 'Acupuncture'}<br/>
          <b>Schedule:</b> ${formattedDate} @ ${formattedTime}<br/>
          <b>Reference:</b> ${booking.reference_code}<br/>
          <b>Type:</b> ${type.toUpperCase()}
        </div>
        <p style="margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/schedules" style="color: #10b981; font-weight: bold;">View Admin Dashboard &rarr;</a>
        </p>
      </div>
    `;

    // Send to Patient
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Palawan Acupuncture'}" <${process.env.SMTP_USER}>`,
      to: booking.email,
      subject: subject,
      html: patientHtml,
    });

    // Send to Clinic Admin (Only for initial bookings, not promotion alerts)
    if (type !== 'promotion') {
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Palawan Acupuncture'}" <${process.env.SMTP_USER}>`,
        to: "josephbaria89@gmail.com",
        subject: `New Patient Alert: ${booking.client_name} ${type === 'waitlist' ? '(WAITLIST)' : ''}`,
        html: adminHtml,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Email API failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
