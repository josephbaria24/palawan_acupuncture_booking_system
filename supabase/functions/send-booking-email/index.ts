/// <reference path="../deno.d.ts" />
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const SMTP_HOST = Deno.env.get("SMTP_HOST")!;
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "587");
const SMTP_USER = Deno.env.get("SMTP_USER")!;
const SMTP_PASS = Deno.env.get("SMTP_PASS")!;
const SMTP_FROM_NAME = Deno.env.get("SMTP_FROM_NAME") || "Palawan Acupuncture";
const SITE_URL = Deno.env.get("SITE_URL") || "https://palawanacupuncture.com";

serve(async (req) => {
  try {
    const { record } = await req.json();
    const { client_name, email, reference_code, schedules } = record;

    if (!email) return new Response("No email provided", { status: 400 });

    const client = new SmtpClient();
    await client.connectTLS({
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      username: SMTP_USER,
      password: SMTP_PASS,
    });

    const trackingUrl = `${SITE_URL}/track/${reference_code}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { font-size: 24px; font-weight: 800; color: #10b981; letter-spacing: -0.02em; }
          .card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .title { font-size: 28px; font-weight: 800; margin-bottom: 16px; color: #111827; }
          .subtitle { color: #6b7280; margin-bottom: 32px; }
          .ref-box { background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 32px; }
          .ref-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #059669; margin-bottom: 8px; }
          .ref-code { font-size: 32px; font-weight: 900; color: #059669; letter-spacing: 0.2em; }
          .details { border-top: 1px solid #f3f4f6; padding-top: 24px; margin-bottom: 32px; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
          .detail-label { color: #6b7280; }
          .detail-value { font-weight: 600; color: #111827; }
          .btn { display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; text-align: center; width: 100%; box-sizing: border-box; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">PALAWAN ACUPUNCTURE</div>
          </div>
          <div class="card">
            <h1 class="title">Booking Received</h1>
            <p class="subtitle">Hello ${client_name}, your request has been recorded. We are reviewing your appointment details.</p>
            
            <div class="ref-box">
              <div class="ref-label">Your Reference Code</div>
              <div class="ref-code">${reference_code}</div>
            </div>

            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Service</span>
                <span class="detail-value">${schedules?.title || 'Acupuncture Session'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${schedules?.date || 'Scheduled Date'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="detail-value">Pending Confirmation</span>
              </div>
            </div>

            <a href="${trackingUrl}" class="btn">Track Your Appointment</a>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Palawan Acupuncture & Wellness Center. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    await client.send({
      from: `${SMTP_FROM_NAME} <${SMTP_USER}>`,
      to: email,
      subject: `Booking Confirmed [${reference_code}] - Palawan Acupuncture`,
      content: html,
      html: html,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
