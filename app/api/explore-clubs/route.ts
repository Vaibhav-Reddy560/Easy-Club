import { NextResponse } from "next/server";
import {
    searchSerper,
    parseSerperResultsToClubs
} from "@/lib/discovery";

export async function POST(req: Request) {
    try {
        const { type, category, location } = await req.json();
        const serperKey = process.env.SERPER_API_KEY;

        if (!serperKey) throw new Error("SERPER_API_KEY is missing.");

        // Tailored queries based on category to prevent "college" clubs leaking into "non-college" results
        const query = category === "College" 
            ? `student "${type}" club ${location} university college -retail`
            : `"${type}" community organization ${location} -university -college -student`;

        console.log(`[ExploreClubs v4] Fetching: ${type} Category: ${category} @ ${location}`);
        
        const results = await searchSerper(query, serperKey, 25);
        
        if (!results || results.length === 0) return NextResponse.json([]);

        // Phase 1: Robust Deterministic Extraction
        const clubs = parseSerperResultsToClubs(results, location);

        return NextResponse.json(clubs);

    } catch (error: any) {
        console.error("Explore Clubs API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
