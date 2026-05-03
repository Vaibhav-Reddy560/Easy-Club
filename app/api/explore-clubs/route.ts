import { NextResponse } from "next/server";
import {
    searchSerper,
    parseSerperResultsToClubs,
    getCachedDiscovery,
    setCachedDiscovery
} from "@/lib/discovery";
import { validateRequest, ExploreClubsSchema } from "@/lib/validation";
import { getEmbeddings } from "@/lib/huggingface";
import { ScrapedClub } from "@/lib/types";

function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function semanticRank(clubs: ScrapedClub[], query: string): Promise<ScrapedClub[]> {
    if (!query || clubs.length === 0) return clubs;

    try {
        const queryEmbedding = await getEmbeddings(query);
        if (!queryEmbedding) return clubs;

        const ranked = await Promise.all(
            clubs.map(async (club) => {
                const text = `${club.name} ${club.description} ${club.college}`.toLowerCase();
                const emb = await getEmbeddings(text);
                if (!emb) return { club, score: 0 };
                return { club, score: cosineSimilarity(queryEmbedding, emb) };
            })
        );

        return ranked.sort((a, b) => b.score - a.score).map(r => r.club);
    } catch (e) {
        console.error("[Semantic Rank Error]", e);
        return clubs;
    }
}

export async function POST(req: Request) {
    try {
        const { data: body, error: validationErr } = await validateRequest(req, ExploreClubsSchema);
        if (validationErr) {
            return NextResponse.json({ error: validationErr }, { status: 400 });
        }
        const { type, category, location } = body!;
        const serperKey = process.env.SERPER_API_KEY;

        if (!serperKey) throw new Error("SERPER_API_KEY is missing.");

        const cacheKey = `clubs_${category}_${type}_${location}`.toLowerCase().replace(/\s+/g, "_");
        const cachedResults = await getCachedDiscovery<ScrapedClub[]>(cacheKey);
        
        let clubs: ScrapedClub[] = [];

        if (cachedResults) {
            clubs = cachedResults;
        } else {
            console.log(`[ExploreClubs v5] Fetching: ${type} @ ${location}`);
            const query = `${type} club in ${location}`;
            const results = await searchSerper(query, serperKey, 25);
            if (results && results.length > 0) {
                clubs = parseSerperResultsToClubs(results, location);
                if (clubs.length > 0) await setCachedDiscovery(cacheKey, clubs);
            }
        }

        // Apply Semantic Ranking
        const searchQuery = `${type} ${category} ${location}`;
        const rankedClubs = await semanticRank(clubs, searchQuery);

        return NextResponse.json(rankedClubs);

    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Explore Clubs API Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

