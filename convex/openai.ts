import OpenAI from "openai";

// Initialize OpenAI client
// Make sure to set OPENAI_API_KEY in your Convex environment variables
function getOpenAIClient() {
  // In Convex, environment variables are available on process.env
  // This will be available at runtime in the Convex environment
  const apiKey = (globalThis as any).process?.env?.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return new OpenAI({ apiKey });
}

// Generate embeddings for text using OpenAI's embedding model
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  
  try {
    const openai = getOpenAIClient();
    const { data } = await openai.embeddings.create({
      input: texts,
      model: "text-embedding-3-small", // Updated to latest model
      dimensions: 1536, // Standard dimension for this model
    });
    
    return data.map((item: any) => item.embedding);
  } catch (error) {
    console.error('OpenAI embedding error:', error);
    throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate a single embedding for convenience
export async function embedText(text: string): Promise<number[]> {
  const embeddings = await embedTexts([text]);
  return embeddings[0];
}

// Generate chat completion using OpenAI
export async function generateChatCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  } = {}
) {
  const {
    model = "gpt-4o-mini", // Updated to latest efficient model
    temperature = 0.7,
    maxTokens = 1000,
    stream = false,
  } = options;

  try {
    const openai = getOpenAIClient();
    return await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
    });
  } catch (error) {
    console.error('OpenAI chat completion error:', error);
    throw new Error(`Failed to generate chat completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 