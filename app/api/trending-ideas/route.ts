import { NextResponse } from "next/server";
import { callGeminiJSON } from "@/lib/gemini";
import { searchSerper } from "@/lib/discovery";
import { validateRequest, TrendingIdeasSchema } from "@/lib/validation";

export async function POST(req: Request) {
    try {
        const { data: body, error: validationErr } = await validateRequest(req, TrendingIdeasSchema);
        if (validationErr) {
            return NextResponse.json({ error: validationErr }, { status: 400 });
        }
        const { category } = body!;
        const serperKey = process.env.SERPER_API_KEY;

        if (!category) {
            return NextResponse.json({ error: "Category is required" }, { status: 400 });
        }

        // Phase 1: Real-world research using Serper (Elite University Targeting)
        const searchQueries = [
            `successful ${category} club events IIT NIT BITS university`,
            `annual ${category} fest campus activities India 2024`,
            `best ${category} workshop student participation examples`
        ];

        let researchData = "Search for high-profile university events and industry-standard student fests.";
        if (serperKey) {
            try {
                const results = await Promise.all(
                    searchQueries.map(q => searchSerper(q, serperKey, 6))
                );
                const flatResults = results.flat().filter(r => r && r.title);
                if (flatResults.length > 0) {
                    researchData = flatResults.map(r => `SOURCE: ${r.title} | CONTENT: ${r.snippet}`).join("\n");
                }
            } catch (serperErr) {
                console.error("Serper Research Error:", serperErr);
            }
        }

        // Phase 2: AI synthesis into actionable blueprints
        const prompt = `
            You are a Market Intelligence Engine for College Clubs. 
            The user wants trending event ideas for a club in the category: "${category}".

            REAL-WORLD RESEARCH DATA:
            ${researchData}

            TASK:
            Synthesize the research data into 6 (SIX) unique, high-fidelity, and PRACTICAL "Event Blueprints". 
            
            STRICT DIVERSITY RULES:
            1. NO COMMON NAMES: Do NOT use common suffixes or prefixes like "Arena", "League", "Innovation Day", "Workshop", "Express", "Expo", "Summit", or "Pulse" for every item. Every name must be completely distinct in structure.
            2. UNIQUE METADATA: Every single blueprint must have a COMPLETELY UNIQUE "references" and "whyTrending" field. Do not repeat justifications across items.
            3. REAL & SPECIFIC REFERENCES: References should cite specific successful events at real universities (e.g., "Inspired by IIT Bombay's Techfest 2023") or industry milestones.
            4. PUNCHY TITLES: Use creative, industry-aligned titles (e.g., "The Binary Breakdown", "Formula-G Campus Challenge", "Vocal-Edge Solo Sessions").

            EACH BLUEPRINT FORMAT:
            {
                "title": "Unique, Punchy, Specific Name",
                "tags": ["ActivityType", "Vibe"],
                "summary": "1 sentence explaining the core activity.",
                "references": "Specific real-world/university reference",
                "whyTrending": "Specific, unique reason for current trend",
                "complexity": "Low/Medium/High",
                "reach": "Participant range (e.g. 200+)"
            }

            RETURN ONLY A JSON ARRAY OF 6 OBJECTS. NO MARKDOWN. NO PREAMBLE.`;

        const ideas = await callGeminiJSON<any[]>(prompt);

        if (!ideas) {
            console.error("[TrendingIdeas] Gemini failed. Using Premium Fallback Library.");
            
            const library: Record<string, { title: string, tags: string[], summary: string, references: string, whyTrending: string, complexity: string, reach: string }[]> = {
                "Coding": [
                    { title: "The 404 Debug Duel", tags: ["Competitive", "Technical"], summary: "A fast-paced contest where teams race to fix intentional bugs in complex production-grade codebases.", references: "Inspired by Microsoft's internal Bug Bash events.", whyTrending: "Gamified learning is seeing 40% higher engagement in tech clubs.", complexity: "Medium", reach: "60-100" },
                    { title: "Agent-A-Thon", tags: ["AI", "Hackathon"], summary: "Build and deploy 3 functional AI agents for campus productivity in 12 hours.", references: "Inspired by recent YC-backed AI hackathons in SF.", whyTrending: "Agentic AI is the #1 requested topic among student developers.", complexity: "High", reach: "40-80" },
                    { title: "Legacy Code Revival", tags: ["Open Source", "Contribution"], summary: "Contribute to real open-source projects under mentor guidance.", references: "Inspired by Google Summer of Code (GSoC).", whyTrending: "Direct industry impact is a major career motivator for 2025 grads.", complexity: "Medium", reach: "30-50" },
                    { title: "Binary Breakout", tags: ["Cybersecurity", "Game"], summary: "A capture-the-flag (CTF) event hidden within a sequence of logic puzzles.", references: "Inspired by DefCon's junior challenges.", whyTrending: "Cybersecurity awareness is at an all-time high with increasing digital threats.", complexity: "High", reach: "100+" }
                ],
                "Racing": [
                    { title: "Grand Prix Simulator League", tags: ["Esports", "Mechanical"], summary: "A high-stakes simulation tournament with telemetry analysis from real aero engineers.", references: "Inspired by Formula Student teams' virtual testing phases.", whyTrending: "Sim-racing viewership has exploded on campus networks.", complexity: "Medium", reach: "100-200" },
                    { title: "The Pitstop Challenge", tags: ["Hands-on", "Speed"], summary: "A physical workshop on rapid mechanical diagnostics and tire changes.", references: "Inspired by Red Bull Racing's campus activation tours.", whyTrending: "F1 popularity in India is at an all-time high among college students.", complexity: "Low", reach: "150+" },
                    { title: "Aero-Sprint Mini", tags: ["Design", "Aerodynamics"], summary: "Design and test 3D-printed miniature spoilers for wind tunnel efficiency.", references: "Inspired by Boeing's aerodynamics workshops.", whyTrending: "Fluid dynamics modeling is becoming a staple skill for mechanical engineers.", complexity: "High", reach: "30-50" }
                ],
                "Robotics": [
                    { title: "Bot-Sumo Championship", tags: ["Hardware", "Battle"], summary: "Design and build autonomous 3kg sumo bots to push opponents out of the ring.", references: "Inspired by RoboGames and Techfest IIT Bombay.", whyTrending: "Physical hardware battles drive the highest non-technical student engagement.", complexity: "Medium", reach: "150+" },
                    { title: "Drone Nav-Maze", tags: ["Drones", "Programming"], summary: "Code drones to navigate a dark obstacle course using only ultrasonic sensors.", references: "Inspired by DJI's education initiatives.", whyTrending: "Autonomous flight logic is a top-tier skill in the 2025 robotics market.", complexity: "High", reach: "40-60" }
                ],
                "Singing": [
                    { title: "The Unplugged Arena", tags: ["Acoustic", "Vocal"], summary: "A raw, microphone-only acoustic session featuring soul, jazz, and regional folk covers.", references: "Inspired by Coke Studio and MTV Unplugged local sessions.", whyTrending: "Acoustic and lo-fi performances have seen a 60% rise in campus popularity.", complexity: "Low", reach: "150+" },
                    { title: "Vibe-Check Vocals", tags: ["Acapella", "Modern"], summary: "A high-energy acapella battle covering latest billboard hits with beatboxing.", references: "Inspired by the Pitch Perfect collegiate competitions.", whyTrending: "Vocal percussion and group harmony are trending heavily on social media.", complexity: "Medium", reach: "200+" }
                ]
            };

            const categoryFallbacks = library[category] || [
                { title: `The ${category} Masterclass`, tags: ["Expert-Led", "Networking"], summary: "Direct demo and strategy session with a prominent industry leader.", references: "Standard format at IIT Delhi's annual club showcases.", whyTrending: "Direct access to mentors is the top value proposition for modern student clubs.", complexity: "Low", reach: "100+" },
                { title: `${category} Deep-Dive`, tags: ["Academic", "Insights"], summary: "A panel discussion on the future of the industry with faculty and researchers.", references: "Inspired by IISc's public talk series.", whyTrending: "Interdisciplinary research is the new frontier for student publications.", complexity: "Medium", reach: "80+" }
            ];
            
            return NextResponse.json(categoryFallbacks);
        }

        return NextResponse.json(ideas);

    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Trending Ideas API Error:", err);
        return NextResponse.json({ error: "Failed to fetch trending ideas", details: err.message }, { status: 500 });
    }
}
