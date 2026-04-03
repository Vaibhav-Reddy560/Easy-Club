import { NextResponse } from "next/server";
import { callGeminiJSON } from "@/lib/gemini";
import { validateRequest, GeneratePromoSchema } from "@/lib/validation";

export async function POST(req: Request) {
    try {
        const { data: body, error: validationErr } = await validateRequest(req, GeneratePromoSchema);
        if (validationErr) {
            return NextResponse.json({ error: validationErr }, { status: 400 });
        }
        
        const { event, club, config } = body!;

        const prompt = `
      You are an expert communications strategist for ${club.name}. 
      Your task is to generate TWO versions of a formal promotional campaign message for an event.
      
      STRICT NEGATIVE CONSTRAINTS (MANDATORY):
      - DO NOT USE ASTERISKS (*) or Markdown bolding.
      - DO NOT USE EMOJIS.
      - DO NOT USE SECTION HEADERS like "Practical Details", "Registration Details", or "Contact Information".
      - DO NOT USE 24-HOUR BRACKETS. If the time is 9:30 PM, ONLY write "9:30 PM". Do not add "(21:30)".
      - DO NOT USE "INR". Always use the symbol "₹".
      - DATE FORMAT: Always use "Day Month Year" (e.g., 4th March 2026 or 04 March 2026).

      STRICT FORMATTING RULES:
      1. IDENTICAL STRUCTURE: Both versions must follow the EXACT SAME 7-step structure defined below.
      2. FEE LABELS:
         Line 1: ${club.name} Members: ₹[Cost]
         Line 2: Non ${club.name} Members: ₹[Cost]
      3. LOGISTICS LIST: Just list the labels "Date:", "Time:", "Venue:", etc., without any grouping header.

      EVENT DATA TO INCLUDE:
      - Event Name: ${event.name}
      - Organized by: ${club.name}
      - Event Type: ${config.subType}
      - Theme/Idea: ${config.description}
      - Date: ${config.date}
      - Time: ${config.time}
      - Venue: ${config.venue}, ${config.city}
      - Fee Members: ${config.feeClub}
      - Fee Non-Members: ${config.feeNonClub}
      - Team Size: ${config.teamSize || "Individual"}
      - Occasion/Week: ${config.occasion || ""}
      - Collaborations: ${config.collaborators || ""}
      - Registration Link: ${config.regLink || "TBA"}
      - Brochure Link: ${config.brochureLink || ""}
      - Resource Person Profile: ${config.resourceLink || ""}
      - POC 1: ${config.poc1Name} (${config.poc1Phone})
      - POC 2: ${config.poc2Name} (${config.poc2Phone})

      REQUIRED 7-STEP STRUCTURE:
      1. Starting Quote: Related to the theme.
      2. Greetings: "Greetings from ${club.name}!"
      3. Presentation: "${club.name} [if occasion: on account of Occasion] is excited to present [Event Name] [if collaboration: in collaboration with Collaborators]."
      4. Idea Paragraph: (Long version: 3-5 sentences | Short version: 1-2 sentences).
      5. Practical List:
         Date: [DD-MM-YYYY or Day Month Year]
         Time: [12h format only, no brackets]
         Venue: ...
         Team Size: ...
      6. Registration Lines: 
         ${club.name} Members: ₹...
         Non ${club.name} Members: ₹...
         Register here: [Link]
      7. Contact: POC Name & number for both contacts.

      Return as JSON: { "standard": "...", "concise": "..." }
    `;

        const jsonResponse = await callGeminiJSON<{ standard: string, concise: string }>(prompt);

        if (!jsonResponse) {
            return NextResponse.json({
                error: "AI is temporarily unavailable due to rate limits or invalid format."
            }, { status: 503 });
        }

        return NextResponse.json(jsonResponse);
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Gemini API Error:", err);

        // Check for API Key issues specifically
        if (err.message?.includes("API_KEY_INVALID") || err.message?.includes("403")) {
            return NextResponse.json({ error: "Invalid API Key. Please check .env.local" }, { status: 403 });
        }

        return NextResponse.json({
            error: err.message || "Internal Server Error"
        }, { status: 500 });
    }
}
