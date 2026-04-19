import { NextResponse } from "next/server";
import { callGeminiSafe, callGeminiJSON } from "@/lib/gemini";
import { searchSerper } from "@/lib/discovery";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, clubName, category, messages } = body;

        const serperKey = process.env.SERPER_API_KEY;

        if (action === "start") {
            // Initiate brainstorm
            let researchData = "General market knowledge.";
            if (serperKey) {
                try {
                    const results = await searchSerper(`innovative ${category} club events trends 2024`, serperKey, 3);
                    const flatResults = results.filter(r => r && r.title);
                    if (flatResults.length > 0) {
                        researchData = flatResults.map(r => `Source: ${r.title} - ${r.snippet}`).join("\\n");
                    }
                } catch (e) {
                    console.error("Serper Research Error in Brainstorm:", e);
                }
            }

            const prompt = `
            You are a creative Event Ideation AI guiding a student.
            They are part of "${clubName}" and want to brainstorm an event in the field of "${category}".

            Recent internet trends:
            ${researchData}

            Reply casually, welcoming them. Suggest 3 high-level creative directions or sub-categories they could explore based on the trends, and ask them what interests them most or if they have their own angle.
            Keep it strictly under 4 sentences. Be encouraging and highly punchy.
            `;

            const reply = await callGeminiSafe(prompt);
            return NextResponse.json({ reply: reply || "Let's brainstorm! What kind of event are you aiming for?" });
        }

        if (action === "chat") {
            if (!messages || !Array.isArray(messages)) return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });

            // Check if the user is asking to search the web
            const latestMessage = messages[messages.length - 1]?.content.toLowerCase() || "";
            let internetContext = "";
            
            if (latestMessage.includes("search") || latestMessage.includes("trend") || latestMessage.includes("look up") || latestMessage.includes("online")) {
                if (serperKey) {
                    try {
                        const searchTerms = latestMessage.replace(/(search|look up|find me)/g, "").trim();
                        const results = await searchSerper(`${searchTerms} student club events`, serperKey, 3);
                        internetContext = results.map(r => r.title + " - " + r.snippet).join("\\n");
                    } catch (e) {}
                }
            }

            const chatHistory = messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join("\\n\\n");
            
            const prompt = `
            You are an Event Ideation AI for a student club.
            
            ${internetContext ? `User requested a search. Here are the live results: \\n${internetContext}` : ''}

            CONVERSATION HISTORY:
            ${chatHistory}

            TASK:
            Respond to the user's latest message. Formulate your reply to keep the brainstorming going, or refine an idea they like.
            Keep it brief, practical, and highly creative. DO NOT generate the final blueprint JSON format yet, just converse naturally.
            If they ask for technical feasibility, give a quick analysis.
            `;

            const reply = await callGeminiSafe(prompt);
            return NextResponse.json({ reply: reply || "I'm having a bit of trouble right now, can you repeat that?" });
        }

        if (action === "finalize") {
            if (!messages || !Array.isArray(messages)) return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });

            const chatHistory = messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join("\\n\\n");
            
            const prompt = `
            You are an expert Event Architect. Review the following brainstorming conversation and extract the final agreed-upon or best implied event idea and format it into a structured JSON blueprint.

            CONVERSATION HISTORY:
            ${chatHistory}

            STRICT JSON FORMAT REQUIRED:
            {
                "title": "Punchy, creative unique name",
                "tags": ["Primary Category", "Secondary tag"],
                "description": "A detailed 3-4 sentence comprehensive description of the event, what happens, and what the value proposition is based on the conversation."
            }
            `;

            const rawJson = await callGeminiSafe(prompt);
            
            if (!rawJson) return NextResponse.json({ error: "Failed to generate JSON" }, { status: 500 });

            try {
                // Try treating the output as raw string to find the JSON
                const start = rawJson.indexOf('{');
                const end = rawJson.lastIndexOf('}');
                if (start !== -1 && end !== -1) {
                    const jsonStr = rawJson.slice(start, end + 1);
                    const parsed = JSON.parse(jsonStr);
                    return NextResponse.json(parsed);
                }
                throw new Error("No JSON block found");
            } catch (e) {
                // If it fails to parse perfectly, fallback to JSON structure
                return NextResponse.json({
                    title: "Brainstormed Event",
                    tags: ["Custom Event"],
                    description: rawJson.trim()
                });
            }
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
