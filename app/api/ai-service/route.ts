import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { type, prompt, data } = await req.json();
    const nvKey = process.env.NVIDIA_NIM_API_KEY;
    const geminiKey = process.env.GOOGLE_AI_STUDIO_KEY;

    console.log(`[AI-Service] Incoming Request: ${type} | NVIDIA Key present: ${!!nvKey} | Gemini Key present: ${!!geminiKey}`);

    // --- TIER 1: NVIDIA NIM (Primary) ---
    if (nvKey && nvKey.startsWith("nvapi-")) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10s

      try {
        if (type === "image") {
          const nvRes = await fetch("https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux-1-schnell", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${nvKey}`,
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!nvRes.ok) {
            const errData = await nvRes.text();
            console.error(`[AI-Service] NVIDIA Image Error (${nvRes.status}):`, errData);
            throw new Error(`NVIDIA Image API Failed: ${nvRes.status}`);
          }

          const result = await nvRes.json();
          if (result.artifacts?.[0]?.base64) {
            return NextResponse.json({ 
              image: `data:image/png;base64,${result.artifacts[0].base64}`,
              provider: "NVIDIA NIM",
              tier: 1
            });
          }
        } else {
          // Use 8b model for ultra-fast "Suggest Vibe" response
          const nvRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${nvKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "meta/llama-3.1-8b-instruct", 
              messages: [{ role: "user", content: prompt }],
              temperature: 0.7,
              max_tokens: 1024
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!nvRes.ok) {
             const errData = await nvRes.text();
             console.error(`[AI-Service] NVIDIA Text Error (${nvRes.status}):`, errData);
             throw new Error(`NVIDIA Text API Failed: ${nvRes.status}`);
          }

          const result = await nvRes.json();
          return NextResponse.json({ 
            text: result.choices[0].message.content,
            provider: "NVIDIA NIM",
            tier: 1
          });
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.warn(`[AI-Service] Tier 1 (NVIDIA) Failed: ${err.message}. Falling back to Tier 2...`);
      }
    }



    // --- TIER 2: Gemini AI Studio (Secondary) ---
    if (geminiKey) {
      try {
        console.log(`[AI-Service] Attempting Tier 2: Gemini (${type})`);
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        if (type === "text") {
          const result = await model.generateContent(prompt);
          return NextResponse.json({ 
            text: result.response.text(),
            provider: "Gemini Flash",
            tier: 2
          });
        }
        // If image type reached here, Gemini doesn't do pure image generation yet via Flash API
        // in a simple way like Flux, so we continue to Tier 3 for images.
      } catch (err: any) {
        console.warn(`[AI-Service] Tier 2 Failed: ${err.message}. Falling back to Tier 3...`);
      }
    }

    // --- TIER 3: Pollinations.ai (Tertiary/Safety Net) ---
    console.log(`[AI-Service] Attempting Tier 3: Pollinations (${type})`);
    if (type === "image") {
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1080&height=1350&nologo=true&enhance=true&seed=${Math.floor(Math.random() * 1000000)}&model=flux`;
      
      // Proxy through server to bypass CORS
      const imageRes = await fetch(imageUrl);
      const buffer = await imageRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      
      return NextResponse.json({ 
        image: `data:image/jpeg;base64,${base64}`,
        provider: "Pollinations (Unlimited)",
        tier: 3
      });
    }

    return NextResponse.json({ error: "All AI Tiers Failed" }, { status: 500 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
