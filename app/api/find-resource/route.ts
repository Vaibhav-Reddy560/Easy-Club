import { NextResponse } from "next/server";
import {
    searchWeb,
    parseWebResultsToResources,
    verifyResourcesWithAI,
    BaseResource
} from "@/lib/utils/discovery";
import { validateRequest, FindResourceSchema } from "@/lib/utils/validation";

export async function POST(req: Request) {
    try {
        const { data: body, error: validationErr } = await validateRequest(req, FindResourceSchema);
        if (validationErr) {
            return NextResponse.json({ error: validationErr }, { status: 400 });
        }
        const { domain, location } = body!;
        const searchKey = process.env.TAVILY_API_KEY;

        console.log(`[ResourceRadar] Finding real experts for: ${domain} in ${location}`);

        if (!searchKey) {
            console.warn("[ResourceRadar] TAVILY_API_KEY is missing. Using fallback.");
            return NextResponse.json([]);
        }

        // Dorking strategy for finding professionals
        const queries = [
            `site:linkedin.com/in/ "${domain}" ${location}`,
            `"${domain}" expert ${location} portfolio`,
            `"${domain}" consultant ${location} linkedin`,
            `site:twitter.com "${domain}" expert ${location}`
        ];

        const resultsArrays = await Promise.all(
            queries.map(q => searchWeb(q, searchKey, 10))
        );
        
        const allResults = resultsArrays.flat();
        if (allResults.length === 0) return NextResponse.json([]);

        // Phase 1: Raw extraction
        const rawResources = parseWebResultsToResources(allResults, location);

        // Phase 2: AI Verification (Semantic Expertise Mining)
        const verifiedResources = await verifyResourcesWithAI(rawResources, domain, location);

        return NextResponse.json(verifiedResources);

    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Resource Sync Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
