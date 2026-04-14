import { NextResponse } from "next/server";
import {
    searchSerper,
    parseSerperResultsToEvents
} from "@/lib/discovery";
import { validateRequest, ExploreEventsSchema } from "@/lib/validation";

export async function POST(req: Request) {
    try {
        const { data: body, error: validationErr } = await validateRequest(req, ExploreEventsSchema);
        if (validationErr) {
            return NextResponse.json({ error: validationErr }, { status: 400 });
        }
        const { type, location } = body!;
        const serperKey = process.env.SERPER_API_KEY;

        if (!serperKey) throw new Error("SERPER_API_KEY is missing.");

        const query = `upcoming ${type} event ${location} 2025 college university`;
        const results = await searchSerper(query, serperKey, 20);
        
        // Phase 1: Robust Deterministic Extraction
        const events = parseSerperResultsToEvents(results, location);

        return NextResponse.json(events);

    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Event Sync Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
