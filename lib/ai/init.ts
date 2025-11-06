/**
 * AI SDK initialization
 * Sets up API keys for AI providers
 */

import { config } from "@/lib/config"

// Set Google Generative AI API key globally
if (config.ai.google.apiKey) {
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = config.ai.google.apiKey
}

// Set OpenAI API key globally
if (config.ai.openai.apiKey) {
  process.env.OPENAI_API_KEY = config.ai.openai.apiKey
}

export function initializeAI() {
  // Validate configuration
  if (config.ai.provider === "google" && !config.ai.google.apiKey) {
    console.warn("[AI_INIT] Google API key is missing")
  }
  
  if (config.ai.provider === "openai" && !config.ai.openai.apiKey) {
    console.warn("[AI_INIT] OpenAI API key is missing")
  }
}

// Auto-initialize on import
initializeAI()
