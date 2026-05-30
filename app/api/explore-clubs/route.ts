import { NextResponse } from "next/server";
import { intelligentClubDiscovery } from "@/lib/discovery";
import { validateRequest, ExploreClubsSchema } from "@/lib/validation";

export async function POST(req: Request) {
    console.log("[ExploreClubs] API Route Hit (Local-First Architecture)");
    try {
        const { data: body, error: validationErr } = await validateRequest(req, ExploreClubsSchema);
        if (validationErr) return NextResponse.json({ error: validationErr }, { status: 400 });

        const { type, category, location } = body!;

        // 100% local discovery — reads from compiled JSON database
        const finalClubs = await intelligentClubDiscovery(category, type, location);

        if (!finalClubs || finalClubs.length === 0) {
            console.warn("[Discovery] No clubs found in local database for this query.");
            return NextResponse.json([]);
        }

        console.log(`[Discovery] Successfully returning ${finalClubs.length} local clubs.`);
        return NextResponse.json(finalClubs);

    } catch (error: any) {
        console.error("[ExploreClubs] Fatal Error:", error);
        return NextResponse.json({ error: "Discovery failed." }, { status: 500 });
    }
}
