import { NextRequest, NextResponse } from "next/server";
import { callGeminiSafe } from "@/lib/services/gemini";

export async function POST(req: NextRequest) {
    try {
        const { event, expert, club } = await req.json();

        if (!event || !expert) {
            return NextResponse.json({ error: "Event and Expert data are required" }, { status: 400 });
        }

        const clubName = club?.name || "Easy Club";

        const prompt = `
You are a professional outreach coordinator for ${clubName}.
Write a highly professional, persuasive, and tailored "Master Invitation Template" that the club can send to industry experts.

**Target Persona**:
- Role: ${expert.role}
- Expertise: ${expert.expertise}
- Location: ${expert.location}

**Event Context**:
- Event Name: ${event.name}
- Type: ${event.config?.type || 'Technical'}
- Subtype: ${event.config?.subType || 'Workshop'}
- Description: ${event.config?.description || 'A flagship event for students.'}
- Hosting Organization: ${clubName}

**Requirements**:
1.  **Subject Line**: Engaging and professional.
2.  **Greeting**: Start exactly with "Dear [Expert Name]," (use this exact placeholder).
3.  **Opening**: Introduce ${clubName} as the organizing entity at [Your College Name], [City/Location], and mention the event. 
4.  **Value Prop**: Explain why their expertise in ${expert.expertise} is invaluable to the attendees.
5.  **Logistics**: Mention it's an upcoming event in ${expert.location}. Ask about their availability.
6.  **Closing**: Professional sign-off. Include placeholders for the sender to fill out:
    Sincerely,
    [Your Name]
    [Your Role]
    ${clubName} Organizing Committee

Format the output cleanly. Make it a ready-to-send template with [Expert Name], [Your Name], and [Your Role] as the ONLY placeholders.
`.trim();

        const content = await callGeminiSafe(prompt, 20000);

        if (!content) {
            console.error("[generate-outreach] Gemini failed. Using Fallback Template.");
            const fallbackText = `Subject: Invitation: Guest Speaker Role at ${event.name}

Dear ${expert.name},

I hope this email finds you well.

I am writing to you on behalf of the organizing committee for ${event.name}, an upcoming ${event.config?.subType || 'event'} hosted by our organization. Given your remarkable expertise as a ${expert.role} in ${expert.expertise}, we would be absolutely honored to invite you as a distinguished Guest Speaker.

Our attendees would greatly benefit from your insights and experience in the industry. The event will be taking place in ${expert.location}.

We understand you have a busy schedule, but we would be immensely grateful if you could share your availability for a brief discussion regarding this opportunity.

Thank you for your time and consideration.

Best regards,
The Organizing Committee
${event.name}`;
            return NextResponse.json({ content: fallbackText });
        }

        return NextResponse.json({ content });
    } catch (error: unknown) {
        const err = error as { message?: string };
        return NextResponse.json(
            { error: "AI Outreach generation failed", details: err.message },
            { status: 500 }
        );
    }
}
