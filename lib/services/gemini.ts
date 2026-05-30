import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";

export async function getCustomKeys() {
    try {
        const cookieStore = await cookies();
        const gKey = cookieStore.get("custom_gemini_api_key")?.value;
        const oKey = cookieStore.get("custom_openai_api_key")?.value;

        const cleanKey = (k: string | null | undefined) => {
            if (!k) return undefined;
            const trimmed = k.trim();
            if (trimmed === "" || trimmed === "undefined" || trimmed === "null" || trimmed.toLowerCase() === "placeholder") {
                return undefined;
            }
            return trimmed;
        };

        const geminiKey = cleanKey(gKey);
        const openaiKey = cleanKey(oKey);

        if (geminiKey) {
            console.log(`[AI Key Debug] Received Gemini Key of length ${geminiKey.length}. Start: ${geminiKey.substring(0, 4)}... End: ...${geminiKey.substring(geminiKey.length - 4)}`);
        } else {
            console.log(`[AI Key Debug] No custom Gemini Key received.`);
        }

        if (openaiKey) {
            console.log(`[AI Key Debug] Received OpenAI Key of length ${openaiKey.length}. Start: ${openaiKey.substring(0, 4)}... End: ...${openaiKey.substring(openaiKey.length - 4)}`);
        } else {
            console.log(`[AI Key Debug] No custom OpenAI Key received.`);
        }

        return { geminiKey, openaiKey };
    } catch (e) {
        console.error("[AI Key Debug] Error fetching headers:", e);
        return { geminiKey: undefined, openaiKey: undefined };
    }
}
const MODEL_PRIORITY = [
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-002",
    "gemini-1.5-pro",
    "gemini-pro-latest"
];
const rateLimitUntil = new Map<string, number>();

function isModelCoolingDown(modelName: string): boolean {
    const until = rateLimitUntil.get(modelName);
    return !!(until && Date.now() < until);
}

function markRateLimited(modelName: string, cooldownMs: number) {
    rateLimitUntil.set(modelName, Date.now() + cooldownMs);
}

export async function callGeminiSafe(prompt: string, timeoutMs: number = 15000): Promise<string | null> {
    const { geminiKey, openaiKey } = await getCustomKeys();
    const activeGeminiKey = geminiKey || process.env.GOOGLE_AI_STUDIO_KEY || process.env.GEMINI_API_KEY || "";
    const openAiKey = openaiKey || process.env.OPENAI_API_KEY;
    const errors: string[] = [];

    if (activeGeminiKey) {
        const genAI = new GoogleGenerativeAI(activeGeminiKey);
        for (const modelName of MODEL_PRIORITY) {
            if (isModelCoolingDown(modelName)) continue;

            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                
                // Generate content with AbortSignal timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
                
                try {
                    const result = await model.generateContent({
                       contents: [{ role: "user", parts: [{ text: prompt }] }]
                    }, { signal: controller.signal });
                    clearTimeout(timeoutId);
                    return result.response.text();
                } catch (err) {
                    clearTimeout(timeoutId);
                    throw err;
                }
            } catch (err: unknown) {
                const geminiErr = err as { 
                    message?: string; 
                    status?: number; 
                    errorDetails?: { reason: string }[] 
                };
                const msg = geminiErr?.message || String(err);
                console.error(`[Gemini] ${modelName} error:`, msg);
                errors.push(`${modelName}: ${msg}`);
                
                const status = geminiErr?.status || geminiErr?.errorDetails?.[0]?.reason;
                if (status === 429 || msg.includes("429")) {
                    console.warn(`[Gemini] ${modelName} rate limited. Cooling down.`);
                    markRateLimited(modelName, 60000);
                }
                continue;
            }
        }
    } else {
        errors.push("No Gemini API key available.");
    }

    // --- OpenAI Fallback Mechanism ---
    if (openAiKey) {
        console.warn("[AI Gateway] All Gemini models failed or skipped. Falling back to OpenAI (gpt-4o-mini).");
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${openAiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }]
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (openAiRes.ok) {
                const openAiData = await openAiRes.json();
                return openAiData.choices?.[0]?.message?.content || null;
            } else {
                console.error("[OpenAI] Fallback failed with status:", openAiRes.status);
            }
        } catch (openAiErr) {
            console.error("[OpenAI] Fallback execution error:", openAiErr);
        }
    }

    console.error("[AI Gateway] All models and fallbacks failed. Errors:", errors);
    return null;
}

// Helper to robustly extract and validate JSON from Gemini
export async function callGeminiJSON<T>(prompt: string, schema?: any): Promise<T | null> {
    const text = await callGeminiSafe(prompt);
    if (!text) {
        console.warn("[Gemini JSON] No response from AI. Falling back to raw data.");
        return null;
    }
    
    try {
        // Attempt to extract JSON block using a more robust regex-first approach
        let jsonStr = text;
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            jsonStr = jsonMatch[1];
        } else {
            // Fallback: manually find first and last matching braces
            const start = text.indexOf('{');
            const startArr = text.indexOf('[');
            const firstChar = start !== -1 && (startArr === -1 || start < startArr) ? start : startArr;

            if (firstChar !== -1) {
                const lastBrace = text.lastIndexOf('}');
                const lastBracket = text.lastIndexOf(']');
                const lastChar = Math.max(lastBrace, lastBracket);

                if (lastChar > firstChar) {
                    jsonStr = text.substring(firstChar, lastChar + 1);
                }
            }
        }

        // Strip trailing commas which are common AI generation errors
        jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');

        const parsed = JSON.parse(jsonStr);
        if (schema) {
            const { data, error } = schema.validate(parsed);
            if (error) {
                console.error("[Gemini JSON] Schema validation failed:", error);
                return null;
            }
            return data;
        }
        return parsed as T;
    } catch (e) {
        console.error("[Gemini JSON] Parse error:", e);
        console.error("[Gemini JSON] Raw text was:", text);
        return null; // Return null on complete failure to parse
    }
}
