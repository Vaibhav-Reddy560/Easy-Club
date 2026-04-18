import { NextResponse } from "next/server";
import {
    searchSerper,
    parseSerperResultsToClubs,
    getCachedDiscovery,
    setCachedDiscovery
} from "@/lib/discovery";
import { validateRequest, ExploreClubsSchema } from "@/lib/validation";

export async function POST(req: Request) {
    try {
        const { data: body, error: validationErr } = await validateRequest(req, ExploreClubsSchema);
        if (validationErr) {
            return NextResponse.json({ error: validationErr }, { status: 400 });
        }
        const { type, category, location } = body!;
        const serperKey = process.env.SERPER_API_KEY;

        if (!serperKey) throw new Error("SERPER_API_KEY is missing.");

        // Check Cache first
        const cacheKey = `clubs_${category}_${type}_${location}`.toLowerCase().replace(/\s+/g, "_");
        const cachedResults = await getCachedDiscovery<any[]>(cacheKey);
        if (cachedResults) return NextResponse.json(cachedResults);

        console.log(`[ExploreClubs v4] Fetching: ${type} Category: ${category} @ ${location}`);
        
        const query = `${type} ${category} in ${location}`;
        const results = await searchSerper(query, serperKey, 25);
        if (!results || results.length === 0) return NextResponse.json([]);

        const clubs = parseSerperResultsToClubs(results, location);
        
        // Save to cache
        if (clubs.length > 0) await setCachedDiscovery(cacheKey, clubs);

        return NextResponse.json(clubs);

    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Explore Clubs API Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
