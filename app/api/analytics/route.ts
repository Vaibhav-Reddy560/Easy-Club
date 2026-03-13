import { NextResponse } from "next/server";
import { getAyrshareAnalytics } from "@/lib/ayrshare";

export async function GET() {
    try {
        const analytics = await getAyrshareAnalytics();
        return NextResponse.json(analytics);
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch social analytics", details: error.message },
            { status: 500 }
        );
    }
}
