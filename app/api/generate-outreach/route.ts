import { NextRequest, NextResponse } from "next/server";
import { callGeminiSafe } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const { event, expert } = await req.json();

        if (!event || !expert) {
            return NextResponse.json({ error: "Event and Expert data are required" }, { status: 400 });
        }

        const prompt = `
You are a professional outreach coordinator for a prestigious college club.
Write a highly professional, persuasive, and tailored invitation email for the following expert:

**Expert Name**: ${expert.name}
**Assigned Role**: ${expert.role}
**Expertise**: ${expert.expertise}
**Location**: ${expert.location}

**Event Context**:
- Event Name: ${event.name}
- Type: ${event.config?.type || 'Technical'}
- Subtype: ${event.config?.subType || 'Workshop'}
- Description: ${event.config?.description || 'A flagship event for students.'}

**Requirements**:
1.  **Subject Line**: Engaging and professional (e.g., "Invitation: Guest Speaker Role at ${event.name}")
2.  **Greeting**: Use "Dear ${expert.name},"
3.  **Opening**: Introduce the club/organization and the event.
4.  **Value Prop**: Explain why their specific expertise in ${expert.expertise} would be invaluable to the students.
5.  **Logistics**: Mention it's an upcoming event in ${expert.location}. Ask for their availability.
6.  **Closing**: Professional sign-off.

Format the output clearly. Do not use placeholders; if something is unknown, keep it general but professional.
`.trim();

        const content = await callGeminiSafe(prompt, 20000);

        if (!content) {
            return NextResponse.json({ error: "AI failed to generate outreach template" }, { status: 500 });
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
