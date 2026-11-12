import { NextResponse } from "next/server";
import { Resend } from "resend";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, topic, message } = body;

    // 1. Input Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    const sanitizedTopic = topic && typeof topic === "string" ? topic.trim().slice(0, 50) : "General Inquiry";
    const sanitizedName = name.trim().slice(0, 100);
    const sanitizedEmail = email.trim().slice(0, 150);
    const sanitizedMessage = message.trim().slice(0, 3000);

    const apiKey = process.env.RESEND_API_KEY || process.env.Resend_Key;

    // If API key is not configured (e.g. during local dev setup), return a clear mock success with warning
    if (!apiKey) {
      console.warn("[Vault Contact API] RESEND_API_KEY / Resend_Key is not set in environment. Mocking successful submission.");
      return NextResponse.json({
        success: true,
        mock: true,
        message: "Message received in local dev mode (configure RESEND_API_KEY for live dispatch).",
      });
    }

    const resend = new Resend(apiKey);
    const fromAddress = process.env.CONTACT_FROM_EMAIL || "Vault Contact <onboarding@resend.dev>";
    const toAddress = process.env.CONTACT_TO_EMAIL || "tharun.suresh@outlook.com";

    const safeTopic = escapeHtml(sanitizedTopic);
    const safeName = escapeHtml(sanitizedName);
    const safeEmail = escapeHtml(sanitizedEmail);
    const safeMessage = escapeHtml(sanitizedMessage);

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      replyTo: sanitizedEmail,
      subject: `[Vault Contact] ${sanitizedTopic} — ${sanitizedName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #e6e6e6; padding: 40px 24px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 20px; margin-bottom: 24px;">
            <span style="font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #34d399; background: rgba(52, 211, 153, 0.12); padding: 4px 10px; border-radius: 9999px; border: 1px solid rgba(52, 211, 153, 0.25);">Vault Transmission</span>
            <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 14px 0 6px 0; letter-spacing: -0.02em;">New Inbound Inquiry</h1>
            <p style="font-size: 14px; color: #a3a3a3; margin: 0;">Topic: <strong style="color: #ffffff;">${safeTopic}</strong></p>
          </div>

          <div style="margin-bottom: 24px;">
            <div style="margin-bottom: 14px;">
              <span style="font-size: 11px; font-family: monospace; text-transform: uppercase; color: #737373; letter-spacing: 0.05em;">Sender</span>
              <p style="font-size: 16px; color: #ffffff; margin: 4px 0 0 0; font-weight: 600;">${safeName}</p>
            </div>
            <div style="margin-bottom: 14px;">
              <span style="font-size: 11px; font-family: monospace; text-transform: uppercase; color: #737373; letter-spacing: 0.05em;">Email / Direct Reply</span>
              <p style="font-size: 15px; margin: 4px 0 0 0;"><a href="mailto:${safeEmail}" style="color: #38bdf8; text-decoration: underline;">${safeEmail}</a></p>
            </div>
          </div>

          <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <span style="font-size: 11px; font-family: monospace; text-transform: uppercase; color: #737373; display: block; margin-bottom: 10px; letter-spacing: 0.05em;">Message</span>
            <p style="font-size: 15px; line-height: 1.65; color: #e5e5e5; margin: 0; white-space: pre-wrap;">${safeMessage}</p>
          </div>

          <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 18px; font-size: 12px; color: #737373; font-family: monospace; display: flex; justify-content: space-between;">
            <span>Vault System Dispatch</span>
            <span>Target: ${escapeHtml(toAddress)}</span>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("[Vault Contact API Error]", error);
      return NextResponse.json(
        { error: error.message || "Failed to dispatch email transmission." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal server error occurred.";
    console.error("[Vault Contact Exception]", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

