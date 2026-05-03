import { NextResponse } from "next/server";
import { validateRequest, GenerateImageSchema } from "@/lib/validation";
import { generateImageFromHF } from "@/lib/huggingface";

// Fallback high-quality SVG themes
const GRADIENT_THEMES: Record<string, { colors: string[]; patternType: string }> = {
    technical: {
        colors: ["#020617", "#0f172a", "#1e293b", "#334155"],
        patternType: "circuits"
    },
    cultural: {
        colors: ["#2e1065", "#4c1d95", "#6d28d9", "#8b5cf6"],
        patternType: "ornate"
    },
    social: {
        colors: ["#450a0a", "#7f1d1d", "#991b1b", "#b91c1c"],
        patternType: "organic"
    },
    competition: {
        colors: ["#0f172a", "#1e293b", "#dc2626", "#991b1b"],
        patternType: "speed"
    },
    default: {
        colors: ["#000000", "#111111", "#222222", "#333333"],
        patternType: "minimal"
    }
};

function generateRichSVG(width: number, height: number, category: string): string {
    const theme = GRADIENT_THEMES[category] || GRADIENT_THEMES.default;
    const c = theme.colors;
    
    let patternContent = "";
    
    if (theme.patternType === "circuits") {
        patternContent = `
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${c[3]}" stroke-width="0.5" opacity="0.2"/>
            </pattern>
            <g opacity="0.4" stroke="${c[3]}" stroke-width="1" fill="none">
                <path d="M 0 100 L 200 100 L 250 150 L 500 150" stroke-dasharray="5,5"/>
                <path d="M 800 200 L 600 200 L 550 250 L 100 250" stroke-dasharray="10,5"/>
                <circle cx="200" cy="100" r="3" fill="${c[3]}"/>
                <circle cx="500" cy="150" r="3" fill="${c[3]}"/>
            </g>
        `;
    } else if (theme.patternType === "ornate") {
        patternContent = `
            <g opacity="0.3" fill="none" stroke="${c[3]}" stroke-width="2">
                <ellipse cx="540" cy="675" rx="400" ry="600" opacity="0.2"/>
                <ellipse cx="540" cy="675" rx="300" ry="500" opacity="0.1"/>
            </g>
        `;
    }

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
            <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stop-color="${c[1]}"/>
                <stop offset="100%" stop-color="${c[0]}"/>
            </radialGradient>
            ${patternContent.includes("pattern") ? patternContent.split("</pattern>")[0] + "</pattern>" : ""}
        </defs>
        <rect width="100%" height="100%" fill="url(#bgGrad)"/>
        ${patternContent.includes("<g") ? patternContent.substring(patternContent.indexOf("<g")) : ""}
    </svg>`.trim();

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function POST(req: Request) {
    try {
        const { data: body, error } = await validateRequest(req, GenerateImageSchema);
        if (error) {
            return NextResponse.json({ error }, { status: 400 });
        }
        const { vibe, creativityLevel, dimensions } = body!;

        // 1. Preserve the full richness of the AI-suggested vibe
        // We only remove boilerplate prefixes that don't add visual value
        let cleanVibe = (vibe || "")
            .replace(/For "[^"]+":/g, "")
            .trim();

        if (cleanVibe.length < 10) {
            cleanVibe = "premium professional event background, atmospheric lighting, ultra-high resolution, clean aesthetic";
        }

        const [wStr, hStr] = (dimensions || "1080x1350").split("x");
        const width = parseInt(wStr) || 1080;
        const height = parseInt(hStr) || 1350;

        // 2. Determine Category for fallback
        let catKey = "default";
        const v = cleanVibe.toLowerCase();
        if (["tech", "hack", "comput", "circuit", "future", "digital", "modern"].some(k => v.includes(k))) catKey = "technical";
        else if (["art", "cultur", "celebrate", "dance", "sing", "elegant"].some(k => v.includes(k))) catKey = "cultural";
        else if (["sport", "race", "compete", "sharp", "fast"].some(k => v.includes(k))) catKey = "competition";
        else if (["social", "warm", "friend", "commun", "soft"].some(k => v.includes(k))) catKey = "social";

        console.log(`[HF-Generation] Starting Flux.1 session for vibe: ${cleanVibe.substring(0, 50)}...`);

        // 3. Generate high-fidelity image using Hugging Face
        // We pass the RAW vibe to FLUX so it sees the hex codes and specific imagery requests
        const hfImage = await generateImageFromHF(
            `${cleanVibe}. High-fidelity professional poster background, cinematic lighting, ultra-detailed, sharp focus, 8k resolution, clean composition, NO TEXT, NO WORDS.`,
            { width, height }
        );


        if (!hfImage) {
            console.warn("[HF-Generation] HF failed, returning high-quality SVG fallback");
            return NextResponse.json({
                image: generateRichSVG(width, height, catKey),
                fallbackSvg: generateRichSVG(width, height, catKey),
                engine: "fallback-svg",
                warning: "AI generation unavailable, using vector fallback"
            });
        }

        return NextResponse.json({
            image: hfImage, // This is the base64 string from FLUX
            fallbackSvg: generateRichSVG(width, height, catKey),
            engine: "huggingface-flux"
        });

    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Image Generation Error:", err);
        return NextResponse.json({
            error: err.message || "Failed to generate image"
        }, { status: 500 });
    }
}

