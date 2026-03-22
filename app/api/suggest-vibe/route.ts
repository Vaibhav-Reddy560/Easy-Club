import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Map event types to Google Fonts style categories
const FONT_SUGGESTIONS: Record<string, string[]> = {
  technical: ["Orbitron", "Space Grotesk", "JetBrains Mono", "Rajdhani", "Exo 2", "Share Tech Mono"],
  cultural: ["Playfair Display", "Cormorant Garamond", "Cinzel", "Great Vibes", "Della Respira"],
  social: ["Poppins", "Quicksand", "Nunito", "Comfortaa", "Baloo 2"],
  competition: ["Teko", "Bebas Neue", "Oswald", "Anton", "Black Ops One"],
  default: ["Inter", "Outfit", "Montserrat", "Sora", "DM Sans"]
};

// Fallback vibe templates when API rate-limited
const FALLBACK_VIBES: Record<string, string> = {
  technical: "Color palette: Deep navy (#0a1628), electric cyan (#00d4ff), and bright gold (#f59e0b) accents. The mood should feel futuristic, high-tech, and energetic — like a mission control interface. Background: Abstract circuit board patterns, glowing node networks, or a dark space with geometric light trails.",
  cultural: "Color palette: Royal purple (#4a1a6b), warm ivory (#fef3c7), and antique gold (#d4a539). The mood should feel elegant, celebratory, and artistic — think grand theater entrance. Background: Flowing silk textures, ornate mandala patterns, or dramatic curtain folds with spotlight effects.",
  social: "Color palette: Warm coral (#ff6b6b), soft peach (#ffd4a0), and clean white (#ffffff). The mood should feel warm, inviting, and community-driven — like a friendly gathering. Background: Soft gradient overlays, abstract human silhouettes in motion, or colorful confetti particles.",
  competition: "Color palette: Crimson red (#dc2626), jet black (#0a0a0a), and metallic silver (#c0c0c0). The mood should feel intense, competitive, and adrenaline-charged — like a championship arena. Background: Dynamic speed lines, arena spotlights, or bold geometric angular shapes.",
  default: "Color palette: Charcoal (#1a1a2e), warm amber (#f59e0b), and off-white (#f5f5f5). The mood should feel professional, sleek, and modern. Background: Subtle gradient mesh, soft bokeh lights, or minimalist geometric patterns with depth."
};

function pickFontCategory(type?: string, subType?: string): string {
  const sub = (subType || "").toLowerCase();
  if (["hackathon", "workshop", "conference", "coding", "peer learning", "talk"].includes(sub)) return "technical";
  if (["cultural", "dance", "singing", "theatre", "fine arts", "fashion", "literary"].includes(sub)) return "cultural";
  if (["competition", "racing", "sports", "fitness"].includes(sub)) return "competition";
  if (["stand up", "charity", "cooking", "social service"].includes(sub)) return "social";
  if ((type || "").toLowerCase() === "technical") return "technical";
  return "default";
}

async function callWithRetry(fn: () => Promise<string>, maxRetries = 2): Promise<string | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const msg = (error as { message?: string }).message || "";
      const isRateLimit = msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests");
      if (isRateLimit && attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        const delay = (attempt + 1) * 15000; // 15s, 30s
        console.log(`Rate limited, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { eventName, description, type, subType, creativityLevel = 5 } = await req.json();

    // Pick font based on event category
    const category = pickFontCategory(type, subType);
    const fontPool = FONT_SUGGESTIONS[category];
    const fontIndex = Math.min(Math.floor((creativityLevel / 10) * fontPool.length), fontPool.length - 1);
    const selectedFont = fontPool[fontIndex];
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(selectedFont)}:wght@400;700;900&display=swap`;

    // Pick text effect based on creativity level
    let effectStyle = "shadow";
    if (creativityLevel >= 8) effectStyle = "neon-glow";
    else if (creativityLevel >= 6) effectStyle = "gradient-gold";
    else if (creativityLevel >= 4) effectStyle = "emboss";
    else if (creativityLevel >= 2) effectStyle = "shadow-depth";

    // Try Gemini API with retry, fallback to local template
    let vibe: string;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const creativityAdj = creativityLevel >= 7 ? "bold, daring, and highly creative" : creativityLevel >= 4 ? "professional and polished" : "clean and minimal";

      const prompt = `You are an expert graphic designer. Based on this event, suggest a short visual direction (3-4 sentences max) for a poster design:

Event Name: "${eventName}"
Description: "${description || 'No description provided'}"
Type: ${type || 'General'} / ${subType || 'Workshop'}
Creative Direction: ${creativityAdj}

Describe:
1. The color palette (specific hex colors or color names)
2. The overall mood/atmosphere
3. What kind of background imagery would work

Be concise and specific. Do NOT include markdown formatting. Just plain text paragraphs.`;

      const result = await callWithRetry(async () => {
        const res = await model.generateContent(prompt);
        return res.response.text();
      });

      vibe = result || FALLBACK_VIBES[category];
    } catch (apiError) {
      // API completely unavailable — use smart local fallback
      console.log("Gemini API unavailable, using local vibe fallback for category:", category);
      vibe = FALLBACK_VIBES[category];
      // Personalize the fallback slightly
      if (eventName) {
        vibe = `For "${eventName}": ` + vibe;
      }
    }

    return NextResponse.json({
      vibe,
      fontFamily: selectedFont,
      fontUrl,
      effectStyle,
      category,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Vibe Suggestion Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to suggest vibe" },
      { status: 500 }
    );
  }
}
