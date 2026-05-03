import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Pollinations.ai provides 100% free, high-speed image generation 
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1080&height=1350&nologo=true&enhance=true&seed=${Math.floor(Math.random() * 1000000)}`;

    // PROXY: Fetch the image on the server to bypass CORS blocks in the browser
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error("Failed to fetch image from provider");
    
    const buffer = await imageRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    return NextResponse.json({ 
      image: dataUrl,
      engine: "Pollinations (Proxied)" 
    });


  } catch (error: any) {
    console.error("[API] Pollinations Error:", error.message);
    return NextResponse.json(
      { error: "Generation service temporarily unavailable" },
      { status: 500 }
    );
  }
}


