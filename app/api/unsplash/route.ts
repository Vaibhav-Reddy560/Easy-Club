import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query, orientation = "portrait" } = await req.json();
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
      // Fallback to a placeholder or deprecated source.unsplash.com if no key
      // source.unsplash.com is deprecated but might still return a redirect
      const fallbackUrl = `https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80`; // Abstract gradient fallback
      return NextResponse.json({ 
        imageUrl: fallbackUrl,
        author: "Unsplash Fallback",
        provider: "Unsplash (No Key)"
      });
    }

    // Force Unsplash to return digital/abstract backgrounds instead of physical photography
    // The user explicitly requested to always use keywords "Abstract" and "backgrounds"
    const enforcedQuery = `${query} abstract background`;

    const res = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(enforcedQuery)}&orientation=${orientation}`, {
      headers: {
        "Authorization": `Client-ID ${accessKey}`,
        "Accept-Version": "v1"
      }
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Unsplash API] Error:", err);
      throw new Error(`Unsplash API Failed: ${res.status}`);
    }

    const data = await res.json();
    
    // Add ixlib params for better optimization
    let imageUrl = data.urls.regular;
    if (imageUrl.includes("ixid=")) {
      // Upgrade to raw/full with our own params
      imageUrl = data.urls.raw + "&auto=format&fit=crop&w=1080&q=80";
    }

    return NextResponse.json({ 
      imageUrl,
      author: data.user?.name || "Unsplash Photographer",
      link: data.links?.html,
      provider: "Unsplash"
    });

  } catch (error: any) {
    console.error("[Unsplash] Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
