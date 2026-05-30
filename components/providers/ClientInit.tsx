"use client";

if (typeof window !== "undefined") {
    const gemini = localStorage.getItem("custom_gemini_api_key");
    const openai = localStorage.getItem("custom_openai_api_key");
    if (gemini) document.cookie = `custom_gemini_api_key=${gemini}; path=/; max-age=31536000`;
    if (openai) document.cookie = `custom_openai_api_key=${openai}; path=/; max-age=31536000`;
}

export default function ClientInit() {
    return null;
}
