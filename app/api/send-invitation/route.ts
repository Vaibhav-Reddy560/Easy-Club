import { NextResponse } from "next/server";
import { sendInvitationEmail } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const { email, subject, content } = await req.json();

    if (!email || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Convert line breaks to HTML for a premium look
    const htmlContent = `
      <div style="font-family: 'Inter', sans-serif; background-color: #050505; color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #c5a059;">
        <h1 style="color: #c5a059; font-size: 24px; margin-bottom: 20px; border-bottom: 1px solid rgba(197, 160, 89, 0.2); padding-bottom: 10px;">Event Invitation: Easy Club</h1>
        <div style="line-height: 1.6; font-size: 16px; color: #e0e0e0;">
          ${content.replace(/\n/g, '<br/>')}
        </div>
        <div style="margin-top: 40px; font-size: 12px; color: #666; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px;">
          Sent via Easy Club - Premium Event Management Orchestrator
        </div>
      </div>
    `;

    const result = await sendInvitationEmail(email, subject, htmlContent);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Invitation-API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
