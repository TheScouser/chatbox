"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import PizZip from "pizzip";

// PDF text extraction using external Node service
async function extractTextFromPDF(buffer: ArrayBuffer, filename: string): Promise<string> {
  try {
    
    // Create FormData for multipart upload
    const formData = new FormData();
    
    // Convert ArrayBuffer to Blob and append to form
    const pdfBlob = new Blob([buffer], { type: 'application/pdf' });
    formData.append('pdf', pdfBlob, filename);
    
    // Call the local Node service
    const response = await fetch('https://chatbox-pdf-parsing.onrender.com/parse-pdf', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`PDF parsing service returned ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !result.data || !result.data.text) {
      throw new Error(result.error || 'No text content returned from PDF parsing service');
    }
    
    const extractedText = result.data.text;
    
    
    
    return extractedText;
    
  } catch (error) {
    
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      throw new Error(`PDF parsing service is not available. Please ensure the service is running on localhost:3001.

To start the service, run your PDF parsing server locally.

Error: ${error.message}`);
    }
    
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}

This might be due to:
- PDF parsing service being unavailable
- Network connectivity issues
- Invalid or corrupted PDF file
- Password-protected or encrypted PDF

Please try:
1. Ensuring the PDF parsing service is running
2. Converting to a text-based format (.txt, .docx)
3. Copy and paste the text manually`);
  }
}

// Simple text extraction for different file types
// This is a robust implementation using specialized libraries for each format
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
    
    // For PDF files, use external Node service for text extraction
    if (contentType === 'application/pdf' || filename.endsWith('.pdf')) {
      try {
        
        const extractedText = await extractTextFromPDF(buffer, filename);
        
        if (!extractedText || extractedText.trim().length === 0) {
          throw new Error("No text content could be extracted from the PDF. The PDF might be image-based or encrypted.");
        }
        
        
        return extractedText;
        
      } catch (pdfError) {
        throw pdfError; // Re-throw with the detailed error message from extractTextFromPDF
      }
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
    throw new Error(`Failed to extract text from ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const extractTextFromUploadedFile = action({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; textLength: number; filename: string; chunksCreated: number }> => {
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
      await ctx.runMutation(internal.knowledge.updateFileStatus, {
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
      
      
      // Create knowledge entries from extracted text (with chunking)
      const knowledgeEntryIds = await ctx.runMutation(internal.knowledge.createKnowledgeFromText, {
        agentId: file.agentId,
        text: extractedText,
        source: "document",
        sourceMetadata: {
          filename: file.filename,
        },
        fileId: args.fileId,
      });
      
      
      // Generate embeddings for the newly created knowledge entries
      try {
        await ctx.runAction(internal.embeddings.generateEmbeddingsForEntries, {
          entryIds: knowledgeEntryIds,
        });
      } catch (embeddingError) {
        // Don't fail the whole process if embedding generation fails
      }
      
      // Update file status to processed
      await ctx.runMutation(internal.knowledge.updateFileStatus, {
        fileId: args.fileId,
        status: "processed"
      });
      
      
      return {
        success: true,
        textLength: extractedText.length,
        filename: file.filename,
        chunksCreated: knowledgeEntryIds.length,
      };
      
    } catch (error) {
      
      // Update file status to error
      await ctx.runMutation(internal.knowledge.updateFileStatus, {
        fileId: args.fileId,
        status: "error"
      });
      
      throw error;
    }
  },
}); 