# 5. Data Sources for Agent Training

This document outlines the various methods through which users can provide data to train their AI agents. The goal is to offer flexibility and accommodate different types of existing knowledge bases that businesses might have.

## 5.1. Document Uploads

*   **Purpose:** Allow users to upload existing documents that contain support information, product details, FAQs, policies, etc.
*   **Supported File Types:**
    *   PDF (.pdf)
    *   Microsoft Word (.doc, .docx)
    *   Plain Text (.txt)
    *   (Consider others like Markdown .md, CSV for structured Q&A pairs in the future)
*   **Processing:**
    1.  User uploads a file through the agent management dashboard.
    2.  Backend receives the file.
    3.  The file content is extracted (text is parsed from PDFs, DOCs).
    4.  Extracted text is chunked into manageable segments.
    5.  Embeddings are generated for each chunk.
    6.  Chunks and their embeddings are stored in a vector database, associated with the specific agent.
*   **User Interface:**
    *   Clear upload interface.
    *   Indication of supported file types and size limits.
    *   Progress indication for uploads and processing.
    *   Ability to view, update (re-upload), or delete uploaded documents from an agent's knowledge base.

## 5.2. Rich Text Editor

*   **Purpose:** Provide a way for users to directly create and edit knowledge base content within the platform. Useful for quickly adding specific Q&As, short articles, or making corrections.
*   **Features:**
    *   Standard WYSIWYG editing capabilities (bold, italics, lists, headings, links).
    *   Ability to create multiple distinct entries or articles.
*   **Processing:**
    1.  User creates or edits content in the rich text editor.
    2.  Content is saved (likely as HTML or Markdown).
    3.  The text content is extracted.
    4.  Text is chunked, embeddings generated, and stored similar to document uploads.
*   **User Interface:**
    *   Intuitive editor integrated into the agent management dashboard.
    *   Ability to create, save, edit, and delete text entries.

## 5.3. Web Crawling (Links/Sitemap)

*   **Purpose:** Enable users to train agents using content from existing websites, such as FAQ pages, knowledge bases, or product documentation.
*   **Input Methods:**
    *   Single URL: User provides a direct link to a specific page.
    *   Sitemap URL: User provides a link to an XML sitemap for broader crawling.
    *   (Future: Domain-based crawling with depth limits).
*   **Processing:**
    1.  User submits URL(s) or a sitemap link.
    2.  Backend initiates a web crawler.
    3.  Crawler fetches content from the specified URLs (respecting `robots.txt`).
    4.  Relevant text content is extracted from the HTML (stripping boilerplate, navigation, ads).
    5.  Extracted text is chunked, embeddings generated, and stored.
*   **User Interface:**
    *   Input fields for URLs/sitemaps.
    *   Status updates on the crawling process (e.g., pages crawled, content found).
    *   Ability to manage crawled sources (view, re-crawl, delete).
*   **Considerations:**
    *   **Crawl Depth & Scope:** Define limits to prevent overly broad or deep crawls.
    *   **Content Extraction Quality:** Robust HTML parsing to get clean, relevant text.
    *   **Frequency of Re-crawling:** Allow users to schedule or manually trigger re-crawls to keep content fresh.
    *   **Respect `robots.txt`:** Ensure the crawler adheres to website crawling policies.

## 5.4. General Data Source Management

*   Users should be able to see a list of all data sources (documents, text entries, crawled sites) contributing to an agent's knowledge.
*   Option to temporarily disable or re-enable a data source without deleting it.
*   Clear indication when a data source has been updated and the agent might need retraining or re-indexing. 