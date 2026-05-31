import { NextResponse } from "next/server";
import { callGeminiJSON } from "@/lib/services/gemini";
import { validateRequest, ExploreEventsSchema } from "@/lib/utils/validation";

export async function POST(req: Request) {
    try {
        const { data: body, error: validationErr } = await validateRequest(req, ExploreEventsSchema);
        if (validationErr) {
            return NextResponse.json({ error: validationErr }, { status: 400 });
        }

        const { type, location } = body!;

        console.log(`[Event Radar] Discovering events for ${type} in ${location}`);

        const prompt = `You are an Event Radar AI. Generate a list of 5 realistic, upcoming student club events for "${type}" in the location "${location}" for the current year (${new Date().getFullYear()}).
        
        RULES:
        1. Make the event names and descriptions highly realistic and tailored to ${type}.
        2. Assign a realistic college or campus name in ${location} as the host.
        3. Make the description 2 sentences explaining what the event is about.
        
        RETURN ONLY a JSON array matching this schema exactly:
        [{
            "name": "Event Name",
            "clubName": "Hosting Student Organization",
            "college": "College Name in ${location}",
            "description": "Event description",
            "date": "E.g., Upcoming next month",
            "location": "${location}",
            "website": "https://example.com/event",
            "imageUrl": "Random unspalsh image url related to the event type, e.g. https://images.unsplash.com/photo-1540575467063-178a50c2df87",
            "tags": ["Verified", "Upcoming"]
        }]`;

        let events = await callGeminiJSON<any[]>(prompt);
        
        if (!events || !Array.isArray(events)) {
            events = [];
        }

        return NextResponse.json(events);

    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Event Radar Sync Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
