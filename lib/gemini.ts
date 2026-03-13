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

export async function callGeminiSafe(prompt: string): Promise<string | null> {
    const errors: string[] = [];
    for (const modelName of MODEL_PRIORITY) {
        if (isModelCoolingDown(modelName)) continue;

        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text();
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
