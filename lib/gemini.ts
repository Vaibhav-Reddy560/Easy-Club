import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL_PRIORITY = [
    "gemini-3.1-flash-lite-preview",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-3.1-pro-preview",
    "models/gemini-3.1-flash-lite",
    "models/gemini-2.5-flash"
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
    const errors: string[] = [];
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
    console.error("[Gemini] All models failed. Errors:", errors);
    return null;
}

// Helper to robustly extract and validate JSON from Gemini
export async function callGeminiJSON<T>(prompt: string, schema?: any): Promise<T | null> {
    const text = await callGeminiSafe(prompt);
    if (!text) return null;
    
    try {
        // Attempt to extract JSON block if wrapped in markdown
        let jsonStr = text;
        const start = text.indexOf('{');
        const startArr = text.indexOf('[');
        const firstChar = start !== -1 && startArr !== -1 
                            ? Math.min(start, startArr) 
                            : Math.max(start, startArr);
                            
        if (firstChar !== -1) {
            const lastBrace = text.lastIndexOf('}');
            const lastBracket = text.lastIndexOf(']');
            const lastChar = Math.max(lastBrace, lastBracket);
            
            if (lastChar > firstChar) {
                jsonStr = text.substring(firstChar, lastChar + 1);
            }
        }

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
        return null; // Return null on complete failure to parse
    }
}
