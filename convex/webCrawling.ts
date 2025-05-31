import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// Simple HTML text extraction function
function extractTextFromHTML(html: string): string {
  // Remove script and style elements
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ');
  text = text.trim();
  
  return text;
}

// Extract title from HTML
function extractTitleFromHTML(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }
  return '';
}

// Extract meta description from HTML
function extractDescriptionFromHTML(html: string): string {
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  if (descMatch && descMatch[1]) {
    return descMatch[1].trim();
  }
  return '';
}

export const fetchUrlContent = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, { url }): Promise<{
    url: string;
    title: string;
    description: string;
    content: string;
    contentLength: number;
    fetchedAt: number;
  }> => {
    try {
      // Validate URL
      let validUrl: URL;
      try {
        validUrl = new URL(url);
      } catch (error) {
        throw new Error("Invalid URL format");
      }

      // Only allow HTTP and HTTPS protocols
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        throw new Error("Only HTTP and HTTPS URLs are supported");
      }

      // Fetch the content
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AI-Agent-Crawler/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        // Set a timeout
        signal: AbortSignal.timeout(30000), // 30 seconds
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check content type
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        throw new Error("URL does not return HTML content");
      }

      // Get the HTML content
      const html = await response.text();

      // Extract text content
      const textContent = extractTextFromHTML(html);
      const title = extractTitleFromHTML(html);
      const description = extractDescriptionFromHTML(html);

      // Validate that we got meaningful content
      if (textContent.length < 50) {
        throw new Error("URL does not contain sufficient text content");
      }

      return {
        url: validUrl.toString(),
        title: title || validUrl.hostname,
        description: description || '',
        content: textContent,
        contentLength: textContent.length,
        fetchedAt: Date.now(),
      };

    } catch (error) {
      console.error("Error fetching URL content:", error);
      throw new Error(
        error instanceof Error 
          ? `Failed to fetch URL: ${error.message}`
          : "Failed to fetch URL content"
      );
    }
  },
});

export const processUrlContent = action({
  args: {
    agentId: v.id("agents"),
    url: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, { agentId, url, title }): Promise<{
    knowledgeEntryId: Id<"knowledgeEntries">;
    url: string;
    title: string;
    description: string;
    contentLength: number;
  }> => {
    try {
      // Validate URL
      let validUrl: URL;
      try {
        validUrl = new URL(url);
      } catch (error) {
        throw new Error("Invalid URL format");
      }

      // Only allow HTTP and HTTPS protocols
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        throw new Error("Only HTTP and HTTPS URLs are supported");
      }

      // Fetch the content
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AI-Agent-Crawler/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        signal: AbortSignal.timeout(30000), // 30 seconds
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check content type
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        throw new Error("URL does not return HTML content");
      }

      // Get the HTML content
      const html = await response.text();

      // Extract text content
      const textContent = extractTextFromHTML(html);
      const pageTitle = extractTitleFromHTML(html);
      const description = extractDescriptionFromHTML(html);

      // Validate that we got meaningful content
      if (textContent.length < 50) {
        throw new Error("URL does not contain sufficient text content");
      }

      // Create a knowledge entry from the URL content
      const knowledgeEntry: Id<"knowledgeEntries"> = await ctx.runMutation(api.knowledge.createKnowledgeEntry, {
        agentId,
        title: title || pageTitle || validUrl.hostname,
        content: textContent,
        source: "url",
        sourceMetadata: {
          url: validUrl.toString(),
          filename: pageTitle || validUrl.hostname,
        },
      });

      return {
        knowledgeEntryId: knowledgeEntry,
        url: validUrl.toString(),
        title: pageTitle || validUrl.hostname,
        description: description || '',
        contentLength: textContent.length,
      };

    } catch (error) {
      console.error("Error processing URL content:", error);
      throw new Error(
        error instanceof Error 
          ? error.message
          : "Failed to process URL content"
      );
    }
  },
}); 