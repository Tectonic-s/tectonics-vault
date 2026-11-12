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

    const rawApiKey = process.env.RESEND_API_KEY || process.env.Resend_Key;
    const apiKey = rawApiKey?.trim().replace(/^["']|["']$/g, "");

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
    const safePreheader = escapeHtml(
      `${sanitizedName} (${sanitizedEmail}): ${sanitizedMessage.replace(/\s+/g, " ").slice(0, 110)}`
    );
    const replySubject = encodeURIComponent(`Re: ${sanitizedTopic}`);
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tectonics-vault.vercel.app").replace(/\/+$/, "");
    const receivedAt = `${new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date())} IST`;

    const topicTag =
      sanitizedTopic
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 64) || "general_inquiry";

    const plainText = [
      `VAULT. — NEW TRANSMISSION`,
      `Topic: ${sanitizedTopic}`,
      `Received: ${receivedAt}`,
      ``,
      `From: ${sanitizedName}`,
      `Email: ${sanitizedEmail}`,
      ``,
      `Message:`,
      sanitizedMessage,
      ``,
      `---`,
      `Delivered to ${toAddress} via Vault Connect`,
    ].join("\n");

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      replyTo: sanitizedEmail,
      subject: `[Vault.] ${sanitizedTopic} — ${sanitizedName}`,
      text: plainText,
      tags: [
        { name: "source", value: "vault_connect" },
        { name: "topic", value: topicTag },
      ],
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>New Vault Inquiry</title>
</head>
<body style="margin:0;padding:0;background-color:#effaf5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Hidden Inbox Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${safePreheader}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#effaf5;padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:580px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,0.06);">
          <!-- Card Header -->
          <tr>
            <td style="padding:28px 32px 20px 32px;border-bottom:1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="display:inline-block;font-size:20px;font-weight:800;letter-spacing:-0.03em;color:#111114;">Vault.</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display:inline-block;padding:5px 12px;border-radius:9999px;background-color:#ecfdf5;border:1px solid #a7f3d0;color:#047857;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
                      &#9679;&nbsp;${safeTopic}
                    </span>
                  </td>
                </tr>
              </table>

              <h1 style="margin:20px 0 4px 0;font-size:22px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;color:#111114;">
                New message from ${safeName}
              </h1>
              <p style="margin:0;font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;color:#64748b;">
                ${escapeHtml(receivedAt)}
              </p>
            </td>
          </tr>

          <!-- Sender Metadata Box -->
          <tr>
            <td style="padding:24px 32px 0 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
                <tr>
                  <td width="45%" valign="top" style="padding:14px 16px;border-right:1px solid #e2e8f0;">
                    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin-bottom:4px;">
                      Sender
                    </div>
                    <div style="font-size:14px;font-weight:600;color:#111114;word-break:break-word;">
                      ${safeName}
                    </div>
                  </td>
                  <td width="55%" valign="top" style="padding:14px 16px;">
                    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin-bottom:4px;">
                      Reply Email
                    </div>
                    <div style="font-size:14px;font-weight:600;word-break:break-all;">
                      <a href="mailto:${safeEmail}" style="color:#059669;text-decoration:none;">${safeEmail}</a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Content -->
          <tr>
            <td style="padding:22px 32px 0 32px;">
              <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin-bottom:8px;">
                Message
              </div>
              <div style="background-color:#fafafa;border-left:3px solid #059669;border-radius:0 12px 12px 0;padding:16px 18px;font-size:15px;line-height:1.65;color:#1e293b;white-space:pre-wrap;word-break:break-word;">${safeMessage}</div>
            </td>
          </tr>

          <!-- Quick Action Button -->
          <tr>
            <td style="padding:24px 32px 28px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left">
                    <a href="mailto:${safeEmail}?subject=${replySubject}" style="display:inline-block;background-color:#059669;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:11px 22px;border-radius:10px;">
                      Reply to ${safeName}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;background-color:#f8fafc;border-top:1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;color:#64748b;">
                    Vault. Connect Dispatch
                  </td>
                  <td align="right" style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;">
                    <a href="${escapeHtml(siteUrl)}" style="color:#64748b;text-decoration:none;">tectonics-vault.vercel.app</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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

