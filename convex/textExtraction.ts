import { action, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { extractTextFromPDF } from "./openai";
import type { Id } from "./_generated/dataModel";
import PizZip from "pizzip";

// Simple text extraction for different file types
// This is a basic implementation - in production you'd want to use proper libraries
async function extractTextFromFile(buffer: ArrayBuffer, contentType: string, filename: string): Promise<string> {
  try {
    // For TXT files, just decode as UTF-8
    if (contentType === 'text/plain' || filename.endsWith('.txt')) {
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(buffer);
    }
    
    // For DOCX files, use pizzip to extract text from document.xml
    if (contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || filename.endsWith('.docx')) {
      try {
        const zip = new PizZip(buffer);
        
        // Get the main document content
        const documentXml = zip.file("word/document.xml");
        if (!documentXml) {
          throw new Error("Could not find document.xml in DOCX file");
        }
        
        const xmlContent = documentXml.asText();
        
        // Extract text from XML by removing tags
        // This is a simple approach - for production you might want a proper XML parser
        const textContent = xmlContent
          .replace(/<[^>]*>/g, ' ') // Remove XML tags
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        if (!textContent || textContent.length === 0) {
          throw new Error("No text content could be extracted from the DOCX file");
        }
        
        return textContent;
      } catch (docxError) {
        console.error('DOCX extraction failed:', docxError);
        throw new Error(`Failed to extract text from DOCX file: ${docxError instanceof Error ? docxError.message : 'Unknown error'}`);
      }
    }
    
    // For DOC files (legacy format), try a basic approach
    if (contentType === 'application/msword' || filename.endsWith('.doc')) {
      // DOC files are more complex binary format
      // For now, we'll provide a helpful error message with alternatives
      throw new Error(`Legacy .doc files are not fully supported yet. 

Please try one of these alternatives:
1. Save the document as .docx format in Microsoft Word
2. Copy and paste the text content manually
3. Convert to .txt format

We're working on adding full .doc support in future versions.`);
    }
    
    // For PDF files, use GPT-4o for text extraction
    if (contentType === 'application/pdf' || filename.endsWith('.pdf')) {
      // Use GPT-4o to extract text from PDF
      const extractedText = await extractTextFromPDF(buffer);
      
      if (!extractedText.trim()) {
        throw new Error("No text content could be extracted from the PDF");
      }
      
      return extractedText;
    }
    
    // Fallback: try to decode as text
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(buffer);
    
    // Check if it looks like readable text
    if (text.length > 0 && text.split('').filter(char => char.charCodeAt(0) < 32 && char !== '\n' && char !== '\r' && char !== '\t').length / text.length < 0.1) {
      return text;
    }
    
    throw new Error(`Unsupported file format: ${filename}. Supported formats: .txt, .docx, .pdf`);
    
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text from ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Internal mutation to create knowledge entries from extracted text
export const createKnowledgeFromText = internalMutation({
  args: {
    agentId: v.id("agents"),
    text: v.string(),
    source: v.string(),
    sourceMetadata: v.object({
      filename: v.optional(v.string()),
    }),
    fileId: v.id("files"),
  },
  handler: async (ctx, args): Promise<Id<"knowledgeEntries">> => {
    // For now, create a single knowledge entry with the full text
    // In a more sophisticated implementation, you might want to chunk the text
    // following the patterns from the Convex AI chat guide
    
    const knowledgeEntryId = await ctx.db.insert("knowledgeEntries", {
      agentId: args.agentId,
      title: `Document: ${args.sourceMetadata.filename}`,
      content: args.text,
      source: args.source,
      sourceMetadata: args.sourceMetadata,
    });
    
    return knowledgeEntryId;
  },
});

// Internal mutation to update file status
export const updateFileStatus = internalMutation({
  args: {
    fileId: v.id("files"),
    status: v.union(
      v.literal("uploaded"),
      v.literal("processing"), 
      v.literal("processed"),
      v.literal("error")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.fileId, { status: args.status });
  },
});

export const extractTextFromUploadedFile = action({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; textLength: number; filename: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    // Get file metadata using a query
    const file = await ctx.runQuery(internal.files.getFileById, { fileId: args.fileId });
    if (!file) {
      throw new Error("File not found");
    }
    
    // Verify authorization using a query
    const isAuthorized = await ctx.runQuery(internal.files.verifyFileAccess, { 
      fileId: args.fileId,
      clerkId: identity.subject 
    });
    
    if (!isAuthorized) {
      throw new Error("Not authorized to process this file");
    }
    
    try {
      // Update file status to processing
      await ctx.runMutation(internal.textExtraction.updateFileStatus, {
        fileId: args.fileId,
        status: "processing"
      });
      
      // Get file content from storage
      const fileUrl = await ctx.storage.getUrl(file.storageId);
      if (!fileUrl) {
        throw new Error("Could not get file URL");
      }
      
      // Fetch file content
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      
      // Extract text content
      const extractedText = await extractTextFromFile(buffer, file.contentType, file.filename);
      
      if (!extractedText.trim()) {
        throw new Error("No text content could be extracted from the file");
      }
      
      // Create knowledge entries from extracted text
      const knowledgeEntryId = await ctx.runMutation(internal.textExtraction.createKnowledgeFromText, {
        agentId: file.agentId,
        text: extractedText,
        source: "document",
        sourceMetadata: {
          filename: file.filename,
        },
        fileId: args.fileId,
      });
      
      // Generate embeddings for the newly created knowledge entry
      try {
        await ctx.runAction(internal.embeddings.generateEmbeddingsForEntries, {
          entryIds: [knowledgeEntryId],
        });
        console.log(`Generated embeddings for knowledge entry from ${file.filename}`);
      } catch (embeddingError) {
        console.error('Failed to generate embeddings:', embeddingError);
        // Don't fail the whole process if embedding generation fails
      }
      
      // Update file status to processed
      await ctx.runMutation(internal.textExtraction.updateFileStatus, {
        fileId: args.fileId,
        status: "processed"
      });
      
      return {
        success: true,
        textLength: extractedText.length,
        filename: file.filename,
      };
      
    } catch (error) {
      console.error('Text extraction failed:', error);
      
      // Update file status to error
      await ctx.runMutation(internal.textExtraction.updateFileStatus, {
        fileId: args.fileId,
        status: "error"
      });
      
      throw error;
    }
  },
}); 