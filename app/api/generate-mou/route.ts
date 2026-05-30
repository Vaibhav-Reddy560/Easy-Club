import { NextRequest, NextResponse } from "next/server";
import { callGeminiSafe } from "@/lib/services/gemini";
import { Club, Sponsor, ClubEvent } from "@/lib/types";

export async function POST(req: NextRequest) {
    try {
        const { club, sponsor, event } = await req.json() as { club: Club; sponsor: Sponsor; event?: ClubEvent };

        if (!club || !club.name || !sponsor || !sponsor.company) {
            return NextResponse.json({ error: "Club and Sponsor data are required" }, { status: 400 });
        }

        const deliverablesList = sponsor.deliverables && sponsor.deliverables.length > 0
            ? sponsor.deliverables.map(d => `- ${d.text}`).join('\n')
            : "Standard sponsor benefits as mutually agreed.";

        const eventSection = event
            ? `
**Event Context**:
This MOU is specifically tied to the upcoming event: **${event.config?.name || event.id}**.
The sponsorship deliverables and financial commitments apply to this event.`
            : `This MOU is a general club sponsorship agreement.`;

        const prompt = `
You are a highly professional legal contract writer specializing in university club sponsorships.

Draft a professional, formal Memorandum of Understanding (MOU) between the following parties:

**Party 1 (The Club)**: ${club.name}
**Party 2 (The Sponsor)**: ${sponsor.company}
${sponsor.pocName ? `**Sponsor Point of Contact**: ${sponsor.pocName}\n` : ''}${sponsor.pocEmail ? `**Sponsor Email**: ${sponsor.pocEmail}\n` : ''}

**Financial Commitment**:
- Deal Value: ₹${sponsor.value.toLocaleString('en-IN')}
- Package Tier: ${sponsor.tier || 'Custom'} Tier

**Deliverables Promised by The Club**:
${deliverablesList}
${eventSection}

Generate a complete, formal legal MOU document with these sections:
1. **Title**: MEMORANDUM OF UNDERSTANDING
2. **Date & Parties**: State the current date and the two parties entering the agreement.
3. **Purpose**: Briefly explain the purpose of this sponsorship (including the specific event if mentioned).
4. **Financial Terms**: Explicitly state the total Deal Value of ₹${sponsor.value.toLocaleString('en-IN')} to be paid by the Sponsor.
5. **Obligations of ${club.name} (Deliverables)**: Detail the exact deliverables promised.
6. **Obligations of ${sponsor.company}**: Detail their obligation to provide the funds and any necessary brand assets.
7. **Term & Termination**: Standard clause on when the agreement ends.
8. **Signatures**: Create a formal signature block for both parties (Name, Title, Date, Signature Line).

Write in a highly formal, legal, and professional tone. Format clearly with headings. Do not use markdown code blocks, just raw markdown text. This document will be downloaded as a DOCX file and sent for signature.
`.trim();

        const content = await callGeminiSafe(prompt, 30000);

        if (!content) {
            return NextResponse.json({ error: "AI generation failed. Please try again." }, { status: 500 });
        }

        return NextResponse.json({ content });
    } catch (error: unknown) {
        const err = error as { message?: string };
        return NextResponse.json(
            { error: "MOU generation failed", details: err.message },
            { status: 500 }
        );
    }
}
