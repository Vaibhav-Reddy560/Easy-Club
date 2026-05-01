import { NextRequest, NextResponse } from "next/server";
import { callGeminiSafe } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, postEventData, clubName } = body;

    if (!event || !postEventData) {
      return NextResponse.json({ error: "Missing event or postEventData" }, { status: 400 });
    }

    const config = event.config || {};

    const prompt = `You are an expert event management consultant. Generate a professional, detailed post-event report in clean markdown format.

EVENT DETAILS:
- Name: ${event.name}
- Club: ${clubName || "Not specified"}
- Type: ${config.subType || config.type || "General Event"}
- Date: ${config.date || "Not specified"}
- Time: ${config.time || "Not specified"}
- Venue: ${config.venue || "Not specified"}
- City: ${config.city || "Not specified"}
- Description: ${config.description || "No description provided"}

POST-EVENT DATA:
- Total Registrations: ${postEventData.totalRegistrations}
- Total Attendees: ${postEventData.totalAttendees}
- Club Member Attendees: ${postEventData.clubMemberAttendees}
- Non-Club Member Attendees: ${postEventData.nonClubMemberAttendees}
- Participant Engagement: ${postEventData.participantEngagement}
- Benefits Gained by Participants: ${postEventData.benefitsGained}
- Day-of-Event Conduct Summary: ${postEventData.conductSummary}

Generate the report using EXACTLY these headings. The first heading MUST BE EXACTLY "# ${clubName || 'Club'} Events" (Do not add any extra text or use other variations):
1. # ${clubName || 'Club'} Events
   (Write a brief summary of the event purpose and scope here)
2. ## Attendance & Registration Analysis
   (Numbers with club/non-club split, registration-to-attendance conversion rate)
3. ## Participant Engagement
   (Analysis of how participants engaged)
4. ## Outcomes & Benefits
   (What participants gained)
5. ## Event Execution
   (How the day went, logistics, any issues)
6. ## Key Metrics
   (Bullet-point summary of critical numbers)
7. ## Recommendations
   (Actionable suggestions for future editions)

Keep the tone professional but concise. Use markdown formatting. Do NOT wrap the response in a code block. Always use the exact heading names provided above without appending any extra text.`;

    const content = await callGeminiSafe(prompt, 30000);

    if (!content) {
      return NextResponse.json({ error: "AI generation failed. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("[generate-report] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
