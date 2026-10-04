import OpenAI from "openai";

export const DEFAULT_OPENROUTER_MODEL =
  process.env.OPENROUTER_DEFAULT_MODEL || "google/gemini-2.5-flash";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

/**
 * Returns true if the OpenRouter API key is configured in the environment.
 */
export function isOpenRouterConfigured(): boolean {
  const key = process.env.OPENROUTER_API_KEY;
  return Boolean(key && key.trim().length > 0 && !key.includes("your_openrouter_api_key"));
}

/**
 * Returns an OpenAI client instance pre-configured for OpenRouter.
 */
export function getOpenRouterClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey.includes("your_openrouter_api_key")) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured. Please add your API key to web/.env.local (OPENROUTER_API_KEY=sk-or-v1-...)."
    );
  }

  const defaultHeaders: Record<string, string> = {};

  if (process.env.OPENROUTER_SITE_URL) {
    defaultHeaders["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL;
  }
  if (process.env.OPENROUTER_SITE_NAME) {
    defaultHeaders["X-Title"] = process.env.OPENROUTER_SITE_NAME;
  }

  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders,
  });
}

/**
 * Executes a non-streaming chat completion request via OpenRouter.
 */
export async function createChatCompletion(options: ChatCompletionOptions) {
  const client = getOpenRouterClient();
  const model = options.model || DEFAULT_OPENROUTER_MODEL;

  const messages: ChatMessage[] = [];
  if (options.systemPrompt) {
    messages.push({ role: "system", content: options.systemPrompt });
  }
  messages.push(...options.messages);

  const response = await client.chat.completions.create({
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens,
  });

  return {
    content: response.choices[0]?.message?.content ?? "",
    model: response.model,
    usage: response.usage,
  };
}

/**
 * Returns a streaming completion as an async iterable stream.
 */
export async function createChatStream(options: ChatCompletionOptions) {
  const client = getOpenRouterClient();
  const model = options.model || DEFAULT_OPENROUTER_MODEL;

  const messages: ChatMessage[] = [];
  if (options.systemPrompt) {
    messages.push({ role: "system", content: options.systemPrompt });
  }
  messages.push(...options.messages);

  return client.chat.completions.create({
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens,
    stream: true,
  });
}
