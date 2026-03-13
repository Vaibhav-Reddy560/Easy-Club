import { NextResponse } from "next/server";
import {
    searchSerper,
    parseSerperResultsToResources,
    verifyResourcesWithAI
} from "@/lib/discovery";

export async function POST(req: Request) {
    try {
        const { domain, location } = await req.json();
        const serperKey = process.env.SERPER_API_KEY;

        if (!serperKey) throw new Error("SERPER_API_KEY is missing.");

        // Dorking strategy for finding professionals
        // Targets LinkedIn, personal portfolios, and professional directories
        const queries = [
            `site:linkedin.com/in/ "${domain}" ${location}`,
            `"${domain}" expert ${location} portfolio`,
            `"${domain}" consultant ${location} linkedin`,
            `site:twitter.com "${domain}" expert ${location}`
        ];

        console.log(`[ResourceRadar] Finding experts for: ${domain} in ${location}`);
        
        const resultsArrays = await Promise.all(
            queries.map(q => searchSerper(q, serperKey, 10))
        );
        
        const allResults = resultsArrays.flat();
        if (allResults.length === 0) return NextResponse.json([]);

        // Phase 1: Raw extraction
        const rawResources = parseSerperResultsToResources(allResults, location);

        // Phase 2: AI Verification (Semantic Expertise Mining)
        const verifiedResources = await verifyResourcesWithAI(rawResources, domain, location);

        return NextResponse.json(verifiedResources);

    } catch (error: any) {
        console.error("Resource Sync Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
