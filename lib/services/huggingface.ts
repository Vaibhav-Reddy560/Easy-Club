/**
 * Hugging Face Service Layer
 * 
 * Provides unified access to Hugging Face Inference API for:
 * 1. Text Embeddings (Semantic Search)
 * 2. Specialized NLP (Sentiment, Expert Matching)
 * 3. Image Generation Fallbacks
 */

const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

// Model Constants
const EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const SENTIMENT_MODEL = "cardiffnlp/twitter-roberta-base-sentiment-latest";

interface HFResponse {
  error?: string;
  [key: string]: any;
}

/**
 * Generic caller for Hugging Face Inference API
 */
async function callHF(model: string, inputs: any): Promise<any> {
  if (!HF_TOKEN) {
    console.error("[Hugging Face] API Token missing");
    return null;
  }

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}` },
        method: "POST",
        body: JSON.stringify({ inputs }),
      }
    );

    const result = await response.json();
    
    if (result.error && result.error.includes("loading")) {
        // Model is warming up, wait and retry once
        console.warn(`[Hugging Face] Model ${model} is loading. Retrying in 5s...`);
        await new Promise(r => setTimeout(r, 5000));
        return callHF(model, inputs);
    }

    return result;
  } catch (error) {
    console.error(`[Hugging Face] Error calling ${model}:`, error);
    return null;
  }
}

/**
 * Generates high-quality vector embeddings for a piece of text.
 * Used for Semantic Search in Exploring Clubs.
 */
export async function getEmbeddings(text: string): Promise<number[] | null> {
  const result = await callHF(EMBEDDING_MODEL, text);
  if (Array.isArray(result) && typeof result[0] === "number") {
    return result;
  }
  // Sometimes returns nested array
  if (Array.isArray(result) && Array.isArray(result[0])) {
    return result[0];
  }
  return null;
}

/**
 * Analyzes the sentiment of club mentions or event feedback.
 */
export async function analyzeSentiment(text: string) {
  const result = await callHF(SENTIMENT_MODEL, text);
  if (!result || !Array.isArray(result) || !result[0]) return null;
  
  // result is typically [[{label: "positive", score: 0.9}, ...]]
  return result[0];
}

/**
 * Specialized caller for Image Generation models (returns blob/base64)
 */
async function callHFImage(model: string, inputs: string): Promise<string | null> {
    if (!HF_TOKEN) return null;

    try {
        console.log(`[Hugging Face] Generating image with model: ${model}`);
        
        // Using the provider: "fal-ai" logic from your example
        // Note: For API Inference, we pass the provider in the header or use the specific provider routing if available.
        // However, the standard HF Inference API for FLUX.1-dev often routes through fal-ai automatically.
        // We will ensure the request follows the exact format required for high-fidelity output.
        const response = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
                headers: { 
                    Authorization: `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json",
                    "x-use-cache": "false" // Ensure fresh generation for vibes
                },
                method: "POST",
                body: JSON.stringify({ 
                    inputs,
                    parameters: {
                        // Matching the java example: num_inference_steps: 5 for dev model performance
                        num_inference_steps: 28, // Higher steps for better quality than the 5-step preview
                        guidance_scale: 3.5,
                    },
                    // Specify provider if the endpoint supports it directly
                    provider: "fal-ai" 
                }),
            }
        );

        if (response.status === 503) {
            const err = await response.json();
            if (err.error?.includes("loading")) {
                console.warn(`[Hugging Face] Image Model ${model} is loading. Retrying in 10s...`);
                await new Promise(r => setTimeout(r, 10000));
                return callHFImage(model, inputs);
            }
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Hugging Face] Image API Error (${response.status}):`, errorText);
            return null;
        }

        const buffer = await response.arrayBuffer();
        
        // Check if the response is actually an image or a JSON error disguised as 200
        const contentType = response.headers.get("content-type");
        if (contentType && !contentType.includes("image")) {
            const text = Buffer.from(buffer).toString();
            console.error("[Hugging Face] Expected image but received:", text);
            return null;
        }

        const base64 = Buffer.from(buffer).toString("base64");
        return `data:${contentType || 'image/jpeg'};base64,${base64}`;
    } catch (error) {
        console.error(`[Hugging Face] Image Generation Error:`, error);
        return null;
    }
}

/**
 * Generates a high-fidelity image using FLUX.1 [dev]
 */
export async function generateImageFromHF(prompt: string, options?: { width?: number, height?: number }): Promise<string | null> {
    const MODEL = "black-forest-labs/FLUX.1-dev";
    return callHFImage(MODEL, prompt);
}


