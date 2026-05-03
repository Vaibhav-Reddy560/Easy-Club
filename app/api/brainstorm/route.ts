import { NextResponse } from "next/server";
import { callGeminiSafe, callGeminiJSON } from "@/lib/gemini";
import { searchSerper } from "@/lib/discovery";

/**
 * Event Brainstorming API v2.0 - "Architect" Upgrade
 * Features: Thought tracing, smart search triggers, and structured blueprint logic.
 */

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, clubName, category, messages } = body;
        const serperKey = process.env.SERPER_API_KEY;

        if (action === "start") {
            let researchData = "General market knowledge.";
            let status = "Analyzing Basic Trends";

            if (serperKey) {
                try {
                    const results = await searchSerper(`innovative student ${category} club events trends ${new Date().getFullYear()}`, serperKey, 5);
                    const flatResults = results.filter(r => r && r.title);
                    if (flatResults.length > 0) {
                        researchData = flatResults.map(r => `Source: ${r.title} - ${r.snippet}`).join("\n");
                        status = "Synthesizing Live Market Data";
                    }
                } catch (e) {
                    console.error("Serper Research Error in Brainstorm:", e);
                }
            }

            const prompt = `
            You are an expert Event Architect for student organizations.
            Organization: "${clubName}"
            Core Field: "${category}"

            LIVE MARKET CONTEXT:
            ${researchData}

            TASK:
            Initiate a high-performance brainstorming session. 
            Welcoming them, then suggest 3 specific, non-generic event archetypes (one safe, one innovative, one high-impact) based on the trends.
            Each event name MUST be extremely concise (max 2-3 words).
            Ask which direction they want to "Architect" first.
            
            TONE:
            Punchy, elite, and professional. Use formatting like bold text for key terms.
            Keep it strictly under 5 sentences.
            `;

            const reply = await callGeminiSafe(prompt);
            return NextResponse.json({ 
                reply: reply || "Welcome to the Architect Hub. Let's build something iconic. What's our first angle?",
                status
            });
        }

        if (action === "chat") {
            if (!messages || !Array.isArray(messages)) return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });

            const latestMessage = messages[messages.length - 1]?.content.toLowerCase() || "";
            let internetContext = "";
            let status = "Processing Logic";
            
            // Smart trigger: if user mentions a city, a specific competitor, or asks for "real examples"
            const needsSearch = /(search|trend|online|look up|in\b|venue|example|competition|at\b|near\b)/.test(latestMessage);

            if (needsSearch && serperKey) {
                try {
                    status = "Executing Deep Discovery Scan";
                    const searchTerms = latestMessage.replace(/(search|look up|find me)/g, "").trim();
                    const results = await searchSerper(`${searchTerms} best student events examples`, serperKey, 4);
                    internetContext = results.map(r => r.title + " - " + r.snippet).join("\n");
                } catch (e) {}
            }

            const chatHistory = messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join("\n\n");
            
            // Integrate Hugging Face Sentiment Analysis to adjust persona
            const { analyzeSentiment } = await import("@/lib/huggingface");
            const sentimentResult = await analyzeSentiment(latestMessage);
            const sentimentTone = sentimentResult 
                ? `The user's current tone is ${sentimentResult.label} (Confidence: ${(sentimentResult.score * 100).toFixed(0)}%).` 
                : "";

            const prompt = `
            You are the Lead Event Architect.
            
            ${internetContext ? `BACKGROUND RESEARCH FOUND:\n${internetContext}` : ''}
            ${sentimentTone ? `SENTIMENT ADVISORY: ${sentimentTone} Adjust your response style to match: if positive/excited, be an enthusiastic partner; if negative/frustrated, be a supportive and reassuring problem-solver; if neutral, stay focused on technical precision.` : ''}

            CONVERSATION CONTEXT:
            ${chatHistory}

            ARCHITECT'S CHECKLIST (INTERNAL):
            - Theme & Vibe
            - Technical/Social Logic
            - Scalability
            - Success Metrics

            TASK:
            Respond to the user. Keep the momentum. If they suggest an idea, refine it with "Architectural Detail" (e.g., adding a specific twist or scaling suggestion).
            Be brief, practical, and highly creative.
            `;


            const reply = await callGeminiSafe(prompt);
            
            // Determine a context-aware status for the UI
            const nextStatus = latestMessage.includes("how") ? "Calculating Logistics" : 
                               latestMessage.includes("where") ? "Mapping Venues" : 
                               "Refining Architecture";

            return NextResponse.json({ 
                reply: reply || "I'm analyzing the blueprint... let's keep going.",
                status: status === "Processing Logic" ? nextStatus : status
            });
        }

        if (action === "finalize") {
            if (!messages || !Array.isArray(messages)) return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });

            const chatHistory = messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join("\n\n");
            
            const prompt = `
            You are the Final Review Architect. Convert the following session into a production-ready Event Blueprint.

            CONVERSATION HISTORY:
            ${chatHistory}

            Return a VALID JSON object exactly in this format:
            {
                "title": "Concise creative name (MAX 3 WORDS)",
                "tags": ["Primary Category", "Secondary tag"],
                "description": "A comprehensive 3-5 sentence description detailing the twist, the value, and the core experience."
            }
            `;

            const parsed = await callGeminiJSON<{ title: string, tags: string[], description: string }>(prompt);
            
            if (parsed) {
                return NextResponse.json(parsed);
            }

            // Fallback if structured generation fails
            return NextResponse.json({
                title: "Architected Prototype",
                tags: [category, "Draft"],
                description: "Failed to parse final blueprint. Please review the chat history for core details."
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Brainstorming API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}
