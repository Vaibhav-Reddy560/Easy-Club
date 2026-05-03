import { NextResponse } from "next/server";
import { generateSocialLinkJWT } from "@/lib/ayrshare";

export async function GET() {
  try {
    const token = await generateSocialLinkJWT();
    
    if (!token) {
      return NextResponse.json({ error: "Failed to generate Social Link token" }, { status: 500 });
    }

    return NextResponse.json({ token });
  } catch (error: any) {
    console.error("[Social-Link-API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
