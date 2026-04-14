import { NextResponse } from "next/server";
import { callGeminiSafe, callGeminiJSON } from "@/lib/gemini";
import { validateRequest, GenerateDocumentSchema } from "@/lib/validation";

export async function POST(req: Request) {
    try {
        const { data: body, error: validationErr } = await validateRequest(req, GenerateDocumentSchema);
        if (validationErr) {
            return NextResponse.json({ error: validationErr }, { status: 400 });
        }

        const { type, event, club, config } = body!;

        let prompt = "";

        if (type === 'letter') {
            prompt = `
                You are a professional administrative assistant at BMS College of Engineering.
                Generate a formal "Permission Letter" or "Sponsorship Proposal" (decide based on event config) for the event "${event.name}".
                
                STRICT CONSTRAINTS:
                - Use a professional, official tone.
                - Include placeholders for signatures if needed.
                - Return the content as plain Markdown text.
                - Address the letter to "The Principal, BMS College of Engineering, Bengaluru".
                - Use data: Date: ${config.date}, Venue: ${config.venue}, Club: ${club.name}.
            `;
        } else if (type === 'sheet') {
            prompt = `
                You are a data management agent for ${club.name}.
                Generate a sample "Event Budget" or "Volunteer Schedule" for "${event.name}" as a JSON Array of objects.
                
                STRICT CONSTRAINTS:
                - Format must be a valid JSON array of objects.
                - Each object should have consistent keys (e.g., "Item", "Description", "Cost").
                - No other text outside the JSON block.
            `;
        } else {
            return NextResponse.json({ error: "Invalid generation type" }, { status: 400 });
        }

        if (type === 'sheet') {
            const jsonResponse = await callGeminiJSON(prompt);
            if (!jsonResponse) {
                return NextResponse.json({ error: "Invalid JSON format returned from AI" }, { status: 500 });
            }
            return NextResponse.json({ data: jsonResponse });
        }

        const text = await callGeminiSafe(prompt);
        if (!text) {
            return NextResponse.json({ error: "AI failed to generate content" }, { status: 503 });
        }

        return NextResponse.json({ content: text });

    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Document Generation Error:", err);
        return NextResponse.json({ error: err.message || "Failed to generate document" }, { status: 500 });
    }
}
