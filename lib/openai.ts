
export async function callOpenAIJSON<T>(prompt: string, model: string = "gpt-4o-mini"): Promise<T | null> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("OPENAI_API_KEY is missing. Falling back to Gemini or raw data.");
        return null;
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: "system", content: "You are a helpful assistant that returns ONLY valid JSON." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("OpenAI API Error:", error);
            return null;
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        return JSON.parse(content) as T;
    } catch (e) {
        console.error("OpenAI request failed:", e);
        return null;
    }
}
