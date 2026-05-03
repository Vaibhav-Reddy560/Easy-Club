import { NextResponse } from "next/server";
import { getEmbeddings } from "@/lib/huggingface";
import { ScrapedClub } from "@/lib/types";

/**
 * Semantic Re-ranking API
 * Takes a list of clubs and a query, then sorts them by semantic relevance using Hugging Face.
 */
export async function POST(req: Request) {
    try {
        const { clubs, query }: { clubs: ScrapedClub[], query: string } = await req.json();

        if (!query || !clubs || clubs.length === 0) {
            return NextResponse.json(clubs);
        }

        // 1. Get embedding for the search query
        const queryEmbedding = await getEmbeddings(query);
        if (!queryEmbedding) {
            console.error("[Semantic Search] Failed to get query embedding");
            return NextResponse.json(clubs); // Fallback to original order
        }

        // 2. Get embeddings for all club descriptions and calculate similarity
        // Note: In a production app with thousands of clubs, we would pre-calculate these.
        // For "Explore Clubs" which returns ~25 results, we can do it on the fly.
        const rankedClubs = await Promise.all(
            clubs.map(async (club) => {
                const clubText = `${club.name} ${club.description} ${club.college}`.toLowerCase();
                const clubEmbedding = await getEmbeddings(clubText);
                
                if (!clubEmbedding) return { club, score: 0 };

                // Cosine Similarity
                const score = cosineSimilarity(queryEmbedding, clubEmbedding);
                return { club, score };
            })
        );

        // 3. Sort by score descending
        const sorted = rankedClubs
            .sort((a, b) => b.score - a.score)
            .map(r => r.club);

        return NextResponse.json(sorted);

    } catch (error) {
        console.error("Semantic Search API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

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
