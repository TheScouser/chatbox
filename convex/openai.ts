"use node";

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
    
    return data.map((item) => item.embedding);
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

// Extract text from image using GPT-4o Vision
export async function extractTextFromImage(imageBase64: string, mimeType: string = "image/png"): Promise<string> {
  try {
    const openai = getOpenAIClient();
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please extract all text content from this image. 

Instructions:
- Extract ALL visible text, including headers, body text, captions, footnotes, etc.
- Maintain the logical reading order and structure
- Preserve formatting like bullet points, numbered lists, and paragraphs
- If there are tables, format them clearly with proper spacing
- If text is in multiple columns, read left to right, top to bottom
- Include any text in images, charts, or diagrams
- If the image contains no readable text, respond with "No readable text found"

Please provide only the extracted text without any additional commentary.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 4000,
      temperature: 0.1, // Low temperature for consistent extraction
    });

    const extractedText = response.choices[0]?.message?.content?.trim();
    
    if (!extractedText || extractedText === "No readable text found") {
      return "";
    }
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// PDF text extraction - Currently limited in serverless environment
export async function extractTextFromPDF(_pdfBuffer: ArrayBuffer): Promise<string> {
  // Note: Advanced PDF processing (OCR, image-based PDFs) requires system dependencies
  // that aren't available in Convex's serverless environment.
  
  throw new Error(`PDF processing is currently limited in this environment.

For PDF support, consider these options:

1. **Text-based PDFs**: Use a client-side PDF processing service
2. **Image-based/Scanned PDFs**: Use external OCR services like:
   - Google Cloud Document AI
   - AWS Textract
   - Azure Form Recognizer
   
3. **Alternative**: Convert PDFs to text manually and paste the content

We're working on implementing cloud-based PDF processing for future versions.`);
}