"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import * as cheerio from "cheerio";

// Advanced content extraction using multiple strategies
function extractContentWithAdvancedCheerio(html: string, url: string) {
  console.log(`Processing HTML (${html.length} chars) for: ${url}`);
  
  const $ = cheerio.load(html);
  
  // Extract basic metadata first
  const title = $('title').text().trim() || 
               $('h1').first().text().trim() || 
               $('meta[property="og:title"]').attr('content') || 
               $('meta[name="twitter:title"]').attr('content') || '';
  
  const description = $('meta[name="description"]').attr('content') || 
                     $('meta[property="og:description"]').attr('content') ||
                     $('meta[name="twitter:description"]').attr('content') || '';
  
  // Strategy 1: Try to extract from semantic HTML elements (best for server-side rendered)
  let content = '';
  let extractionMethod = '';
  
  const semanticSelectors = [
    { selector: 'main', name: 'main element' },
    { selector: 'article', name: 'article element' },
    { selector: '[role="main"]', name: 'main role' },
    { selector: '.content, .main-content, .page-content', name: 'content classes' },
    { selector: '.post-content, .entry-content, .article-content', name: 'post content classes' },
    { selector: '.documentation, .docs-content, .doc-content', name: 'documentation classes' }
  ];
  
  for (const { selector, name } of semanticSelectors) {
    const $element = $(selector);
    if ($element.length > 0) {
      // Remove unwanted elements from within the content area
      $element.find('script, style, nav, .navigation, .menu, .sidebar, .ads, .advertisement, .comments').remove();
      
      // Extract text with proper spacing
      const textContent = extractTextWithSpacing($element);
      if (textContent.length > content.length && textContent.length > 50) {
        content = textContent;
        extractionMethod = name;
        console.log(`Found content using ${name}: ${textContent.length} chars`);
      }
    }
  }
  
  // Strategy 2: Extract from structured content elements with proper formatting
  if (content.length < 100) {
    console.log('Trying structured content extraction');
    const textParts: string[] = [];
    
    // Process headings and paragraphs separately to maintain structure
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 5 && !text.match(/^(menu|navigation|footer|header|sidebar)/i)) {
        textParts.push(`\n\n${text}\n`); // Add line breaks around headings
      }
    });
    
    $('p, li, blockquote, td, th, .text, .description').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 15 && !text.match(/^(menu|navigation|footer|header|sidebar)/i)) {
        textParts.push(text);
      }
    });
    
    if (textParts.length > 0) {
      // Join with spaces and clean up formatting
      let structuredContent = textParts.join(' ');
      
      // Improve spacing around headings and sentences
      structuredContent = structuredContent
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\n\s+/g, '\n') // Clean up line breaks
        .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // Space after sentences
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Space between camelCase
        .trim();
      
      if (structuredContent.length > content.length) {
        content = structuredContent;
        extractionMethod = 'structured elements';
        console.log(`Found content using structured elements: ${content.length} chars`);
      }
    }
  }
  
  // Strategy 3: Extract from data attributes and hidden content (for client-side rendered)
  if (content.length < 100) {
    console.log('Trying data attributes and hidden content');
    const dataContent: string[] = [];
    
    // Look for content in data attributes
    $('[data-content], [data-text], [data-description]').each((_, el) => {
      const $el = $(el);
      const dataText = $el.attr('data-content') || $el.attr('data-text') || $el.attr('data-description');
      if (dataText && dataText.length > 20) {
        dataContent.push(dataText);
      }
    });
    
    // Look for content in noscript tags (fallback content)
    $('noscript').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 20) {
        dataContent.push(text);
      }
    });
    
    // Look for JSON-LD structured data
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const jsonData = JSON.parse($(el).text());
        if (jsonData.description) dataContent.push(jsonData.description);
        if (jsonData.text) dataContent.push(jsonData.text);
        if (jsonData.articleBody) dataContent.push(jsonData.articleBody);
      } catch (e) {
        // Ignore invalid JSON
      }
    });
    
    if (dataContent.length > 0) {
      const hiddenContent = dataContent.join('\n\n').trim();
      if (hiddenContent.length > content.length) {
        content = hiddenContent;
        extractionMethod = 'data attributes and hidden content';
        console.log(`Found content using hidden content: ${content.length} chars`);
      }
    }
  }
  
  // Strategy 4: Intelligent body text extraction with spacing (last resort)
  if (content.length < 50) {
    console.log('Using intelligent body text extraction');
    
    // Remove all unwanted elements
    $('script, style, nav, header, footer, .navigation, .menu, .sidebar, .ads, .advertisement, .comments, .related, .share, .social').remove();
    
    // Extract text with proper spacing
    const bodyText = extractTextWithSpacing($('body'));
    
    if (bodyText.length > content.length) {
      content = bodyText;
      extractionMethod = 'body text';
      console.log(`Found content using body text: ${content.length} chars`);
    }
  }
  
  // Strategy 5: Create meaningful content from metadata if all else fails
  if (content.length < 20) {
    console.log('Creating content from metadata');
    const metaParts = [];
    
    if (title) metaParts.push(`Title: ${title}`);
    if (description) metaParts.push(`Description: ${description}`);
    
    // Extract any visible headings
    const headings = $('h1, h2, h3, h4, h5, h6').map((_, el) => $(el).text().trim()).get()
      .filter(h => h.length > 0 && h.length < 200);
    if (headings.length > 0) {
      metaParts.push(`Headings: ${headings.slice(0, 5).join(', ')}`);
    }
    
    // Add URL for reference
    metaParts.push(`Source: ${url}`);
    
    // Detect if it's likely a client-side rendered page
    if (html.includes('data-has-hydrated') || 
        html.includes('__NEXT_DATA__') || 
        html.includes('window.__INITIAL_STATE__') ||
        html.includes('React') ||
        html.includes('Vue') ||
        html.includes('Angular') ||
        html.includes('app.js') ||
        html.includes('bundle.js')) {
      metaParts.push('Note: This appears to be a client-side rendered website. Limited content may be available.');
    }
    
    content = metaParts.join('\n\n');
    extractionMethod = 'metadata fallback';
    console.log(`Created content from metadata: ${content.length} chars`);
  }
  
  console.log(`Final extraction - Method: ${extractionMethod}, Content: ${content.length} chars`);
  
  return {
    title,
    description,
    content,
    contentLength: content.length,
    extractionMethod
  };
}

// Helper function to extract text with proper spacing and formatting
function extractTextWithSpacing($element: any): string {
  // Simple approach: extract text and add proper spacing
  let text = $element.text();
  
  // Clean up excessive whitespace while preserving some structure
  text = text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // Ensure space after sentences
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase words
    .trim();
  
  return text;
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
    metadata?: {
      charset?: string;
      extractionMethod?: string;
    };
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

      console.log(`Fetching URL: ${url}`);

      // Fetch with optimized headers
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Charset': 'utf-8, iso-8859-1;q=0.5',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        signal: AbortSignal.timeout(30000),
      });

      console.log(`Response: ${response.status}, final URL: ${response.url}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        throw new Error("URL does not return HTML content");
      }

      const html = await response.text();
      
      if (!html || html.length < 100) {
        throw new Error("Received empty or too short content");
      }

      // Extract content using advanced strategies
      const extracted = extractContentWithAdvancedCheerio(html, validUrl.toString());

      // Always return something useful, even if minimal
      if (extracted.content.length < 10) {
        throw new Error(`Unable to extract meaningful content from this URL. This may be a heavily client-side rendered page that requires JavaScript execution.`);
      }

      return {
        url: validUrl.toString(),
        title: extracted.title || validUrl.hostname,
        description: extracted.description || '',
        content: extracted.content,
        contentLength: extracted.contentLength,
        fetchedAt: Date.now(),
        metadata: {
          charset: 'utf-8',
          extractionMethod: extracted.extractionMethod,
        },
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
    metadata?: {
      charset?: string;
      extractionMethod?: string;
    };
  }> => {
    try {
      const urlData = await ctx.runAction(api.webCrawling.fetchUrlContent, { url });

      const sourceMetadata = {
        url: urlData.url,
        filename: urlData.title,
      };

      const knowledgeEntry: Id<"knowledgeEntries"> = await ctx.runMutation(api.knowledge.createKnowledgeEntry, {
        agentId,
        title: title || urlData.title,
        content: urlData.content,
        source: "url",
        sourceMetadata,
      });

      // Generate embeddings for the newly created knowledge entry
      try {
        await ctx.runAction(internal.embeddings.generateEmbeddingsForEntries, {
          entryIds: [knowledgeEntry],
        });
        console.log(`Generated embeddings for knowledge entry from ${urlData.url}`);
      } catch (embeddingError) {
        console.error('Failed to generate embeddings:', embeddingError);
        // Don't fail the whole process if embedding generation fails
      }

      return {
        knowledgeEntryId: knowledgeEntry,
        url: urlData.url,
        title: urlData.title,
        description: urlData.description,
        contentLength: urlData.contentLength,
        metadata: urlData.metadata,
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