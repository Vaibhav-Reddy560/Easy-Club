import { NextResponse } from "next/server";
import { generateSocialLinkJWT } from "@/lib/ayrshare";

export async function GET() {
    try {
        const token = await generateSocialLinkJWT();
        
        if (!token) {
            return NextResponse.json({ error: "Failed to generate Ayrshare JWT" }, { status: 500 });
        }

        // Return the full URL for the Social Link window
        const url = `https://app.ayrshare.com/social-link?token=${token}`;
        return NextResponse.json({ url });
    } catch (error: unknown) {
        const err = error as { message?: string };
        return NextResponse.json(
            { error: "Protocol error generating social connection", details: err.message },
            { status: 500 }
        );
    }
}
