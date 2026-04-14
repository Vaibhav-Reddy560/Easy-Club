import { NextResponse } from "next/server";
import { getAyrshareAnalytics } from "@/lib/ayrshare";

export async function GET() {
    try {
        const analytics = await getAyrshareAnalytics();
        return NextResponse.json(analytics);
    } catch (error: unknown) {
        const err = error as { message?: string };
        return NextResponse.json(
            { error: "Failed to fetch social analytics", details: err.message },
            { status: 500 }
        );
    }
}
