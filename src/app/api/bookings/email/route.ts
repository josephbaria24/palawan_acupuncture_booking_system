import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const { booking, schedule } = await req.json();

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

    const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://palawanacupuncture.com'}/track/${booking.reference_code}`;
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

    // --- Patient Confirmation Email (Premium & High-Compatibility) ---
    const patientHtml = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Booking Confirmation - Palawan Acupuncture</title>
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
                          <div style="font-weight: 800; font-size: 14px; letter-spacing: 0.15em; color: #10B981; text-transform: uppercase;">Palawan <span style="color: #111827;">Acupuncture</span></div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Hero Message -->
                <tr>
                  <td align="left" style="padding: 20px 40px 40px;">
                    <div style="font-size: 32px; font-weight: 800; line-height: 1.1; color: #111827; margin-bottom: 20px; letter-spacing: -0.03em;">Wait, we've got you!</div>
                    <div style="font-size: 16px; line-height: 1.6; color: #64748B;">Hello <strong>${booking.client_name}</strong>, your session has been successfully booked. We've locked your slot and notified our clinic practitioners.</div>
                  </td>
                </tr>

                <!-- Reference Card -->
                <tr>
                  <td align="center" style="padding: 0 40px 40px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 16px; padding: 24px;">
                      <tr>
                        <td align="center">
                          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94A3B8; margin-bottom: 8px;">Booking Reference Code</div>
                          <div style="font-size: 32px; font-weight: 900; color: #10B981; letter-spacing: 0.15em; font-family: 'Courier New', Courier, monospace;">${booking.reference_code}</div>
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
                    
                    <div style="font-size: 13px; color: #94A3B8; font-style: italic; background-color: #F1F5F9; padding: 12px 16px; border-radius: 12px;">
                      Note: Please arrive 15 minutes early. If your status is "Waitlisted", we'll alert you via email if a spot opens up.
                    </div>
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
                    <a href="https://palawanacupuncture.com" style="color: #64748B; text-decoration: underline;">Visit Our Website</a>
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
        <h2 style="margin-top: 0;">New Booking Alert 🔔</h2>
        <p>A new clinic session has been booked via the public portal.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
        <div style="font-size: 14px; line-height: 2;">
          <b>Patient:</b> ${booking.client_name}<br/>
          <b>Phone:</b> ${booking.phone}<br/>
          <b>Session:</b> ${schedule?.title || 'Acupuncture'}<br/>
          <b>Schedule:</b> ${formattedDate} @ ${formattedTime}<br/>
          <b>Reference:</b> ${booking.reference_code}
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
      subject: `Booking Confirmed [${booking.reference_code}] - Palawan Acupuncture`,
      html: patientHtml,
    });

    // Send to Clinic Admin
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Palawan Acupuncture'}" <${process.env.SMTP_USER}>`,
      to: "palawanacupuncture@gmail.com",
      subject: `New Patient Alert: ${booking.client_name}`,
      html: adminHtml,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Email API failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
