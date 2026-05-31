export function requireAIKey(): boolean {
  if (typeof window === 'undefined') return true;
  
  const gKey = localStorage.getItem("custom_gemini_api_key");
  const oKey = localStorage.getItem("custom_openai_api_key");
  
  if (!gKey && !oKey) {
    window.dispatchEvent(new CustomEvent("require-ai-key"));
    return false;
  }
  
  return true;
}
