import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { name, phone, email, propertyType, purpose, budget, bedrooms, area, message } = body;

  if (!name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 422 });
  }

  // Build email HTML
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:32px;border:1px solid #e5e5e5;border-radius:8px">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="color:#1C1208;font-size:22px;margin:0">New Property Enquiry</h1>
        <p style="color:#7A6652;font-size:13px;margin:6px 0 0">Warsi Jee Construction Company</p>
      </div>
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:0 0 24px"/>

      <table style="width:100%;border-collapse:collapse">
        ${row("Full Name",      name)}
        ${row("Phone Number",   phone)}
        ${row("Email",         email || "Not provided")}
        ${row("Property Type", propertyType || "Not specified")}
        ${row("Purpose",       purpose || "Not specified")}
        ${row("Budget",        budget || "Not specified")}
        ${row("Bedrooms",      bedrooms || "Not specified")}
        ${row("Area Required", area || "Not specified")}
      </table>

      ${message ? `
      <div style="margin-top:20px;background:#f8f8f8;padding:14px;border-radius:6px">
        <p style="color:#7A6652;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin:0 0 6px">Message</p>
        <p style="color:#1C1208;font-size:14px;margin:0;line-height:1.6">${message}</p>
      </div>` : ""}

      <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0 16px"/>
      <p style="color:#aaa;font-size:11px;text-align:center;margin:0">
        Sent from Warsi Jee Construction website contact form
      </p>
    </div>
  `;

  function row(label: string, value: string) {
    return `
      <tr>
        <td style="padding:8px 12px 8px 0;color:#7A6652;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;width:35%;vertical-align:top">${label}</td>
        <td style="padding:8px 0;color:#1C1208;font-size:14px;font-weight:500">${value}</td>
      </tr>`;
  }

  try {
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST   ?? "smtp.gmail.com",
      port:   Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from:    `"Warsi Jee Website" <${process.env.SMTP_USER}>`,
      to:      process.env.SMTP_TO ?? "warsijeeconstructioncompany@gmail.com",
      subject: `New Enquiry from ${name} — ${propertyType || "Property"}`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
  }
}
