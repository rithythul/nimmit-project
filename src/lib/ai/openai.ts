import OpenAI from "openai";

let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Get a chat completion from OpenAI
 */
export async function getChatCompletion(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<string> {
  const {
    model = "gpt-4o-mini",
    temperature = 0.7,
    maxTokens = 1000,
  } = options;

  const response = await getOpenAI().chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  return response.choices[0]?.message?.content || "";
}

/**
 * Get a JSON response from OpenAI
 */
export async function getJSONCompletion<T>(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<T> {
  const {
    model = "gpt-4o-mini",
    temperature = 0.3,
    maxTokens = 1000,
  } = options;

  const response = await getOpenAI().chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "{}";
  return JSON.parse(content) as T;
}

export { getOpenAI };
