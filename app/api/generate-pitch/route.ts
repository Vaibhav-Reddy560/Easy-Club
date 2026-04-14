import { NextRequest, NextResponse } from "next/server";
import { callGeminiSafe } from "@/lib/gemini";

export async function POST(req: NextRequest) {
    try {
        const { club, sponsors } = await req.json();

        if (!club || !club.name) {
            return NextResponse.json({ error: "Club data is required" }, { status: 400 });
        }

        const sponsorSection = sponsors && sponsors.length > 0
            ? sponsors.map((s: { company: string; category: string; value: number; stage: string; notes?: string }) =>
                `- ${s.company} (${s.category}): ₹${s.value.toLocaleString('en-IN')} — Stage: ${s.stage}${s.notes ? `. Notes: ${s.notes}` : ''}`
              ).join('\n')
            : "No active sponsors yet.";

        const totalRevenue = sponsors?.filter((s: { stage: string }) => s.stage === 'Closed')
            .reduce((acc: number, s: { value: number }) => acc + s.value, 0) || 0;
        
        const pipelineValue = sponsors?.filter((s: { stage: string }) => s.stage !== 'Closed')
            .reduce((acc: number, s: { value: number }) => acc + s.value, 0) || 0;

        const prompt = `
You are a professional sponsorship pitch deck writer for college clubs in India.

Write a compelling, investor-ready sponsorship pitch deck document for the following organization:

**Organization Name**: ${club.name}
**Total Events**: ${club.events?.length || 0}
**Active Sponsors / Deals**:
${sponsorSection}

**Financial Summary**:
- Revenue Closed: ₹${totalRevenue.toLocaleString('en-IN')}
- Pipeline Value: ₹${pipelineValue.toLocaleString('en-IN')}

Generate a complete pitch deck document with these professional sections:
1. **Executive Summary** — Who we are, our mission, and our reach
2. **Why Partner With Us** — Key value propositions for a sponsor
3. **Our Impact & Reach** — Events organized, member count, social presence
4. **Sponsorship Tiers** — Platinum (₹2,00,000+), Gold (₹1,00,000+), Silver (₹50,000+), Bronze (₹25,000+)
5. **What We Offer Sponsors** — Visibility, branding, recruitment pipeline access, exposure from events
6. **Our Current Partners** — Acknowledge existing deals (use the partner list above)
7. **Contact & Next Steps** — How to get in touch and move forward

Write in a professional, confident tone. Format clearly with headings and sub-points. This is the actual document content, not a template — make it specific to ${club.name}.
`.trim();

        const content = await callGeminiSafe(prompt, 30000);

        if (!content) {
            return NextResponse.json({ error: "AI generation failed. Please try again." }, { status: 500 });
        }

        return NextResponse.json({ content });
    } catch (error: unknown) {
        const err = error as { message?: string };
        return NextResponse.json(
            { error: "Pitch generation failed", details: err.message },
            { status: 500 }
        );
    }
}
