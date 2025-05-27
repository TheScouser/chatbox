import { action, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Simple text extraction for different file types
// This is a basic implementation - in production you'd want to use proper libraries
async function extractTextFromFile(buffer: ArrayBuffer, contentType: string, filename: string): Promise<string> {
  try {
    // For TXT files, just decode as UTF-8
    if (contentType === 'text/plain' || filename.endsWith('.txt')) {
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(buffer);
    }
    
    // For other file types, we'll implement basic extraction
    // In a real implementation, you'd use libraries like:
    // - pdf-parse for PDFs
    // - mammoth for DOCX
    // - officeparser for multiple formats
    
    if (contentType === 'application/pdf' || filename.endsWith('.pdf')) {
      // Placeholder for PDF extraction
      // In production: use pdf-parse or similar
      return `[PDF content extraction not implemented yet for ${filename}]`;
    }
    
    if (contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || filename.endsWith('.docx')) {
      // Placeholder for DOCX extraction
      // In production: use mammoth or similar
      return `[DOCX content extraction not implemented yet for ${filename}]`;
    }
    
    if (contentType === 'application/msword' || filename.endsWith('.doc')) {
      // Placeholder for DOC extraction
      // In production: use officeparser or similar
      return `[DOC content extraction not implemented yet for ${filename}]`;
    }
    
    // Fallback: try to decode as text
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
    
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
  handler: async (ctx, args) => {
    // For now, create a single knowledge entry with the full text
    // In a more sophisticated implementation, you might want to chunk the text
    // following the patterns from the Convex AI chat guide
    
    await ctx.db.insert("knowledgeEntries", {
      agentId: args.agentId,
      title: `Document: ${args.sourceMetadata.filename}`,
      content: args.text,
      source: args.source,
      sourceMetadata: args.sourceMetadata,
    });
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
  handler: async (ctx, args) => {
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
      await ctx.runMutation(internal.textExtraction.createKnowledgeFromText, {
        agentId: file.agentId,
        text: extractedText,
        source: "document",
        sourceMetadata: {
          filename: file.filename,
        },
        fileId: args.fileId,
      });
      
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