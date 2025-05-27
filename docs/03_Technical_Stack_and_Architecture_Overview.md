# 3. Technical Stack and Architecture Overview

## 3.1. Frontend

*   **Framework/Library:** React
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Routing:** TanStack Router (React Router)
*   **State Management/Data Fetching:** Convex React (replaces TanStack Query)
*   **UI Components:** Shadcn UI
*   **Styling:** Tailwind CSS (comes with Shadcn UI)

## 3.2. Backend

*   **Platform:** Convex (Full-stack TypeScript platform)
*   **Database:** Convex Database (NoSQL document database with ACID transactions)
*   **Real-time:** Built-in real-time subscriptions via Convex
*   **Functions:** Convex functions (queries, mutations, actions)
*   **File Storage:** Convex File Storage for document uploads
*   **Vector Search:** Convex Vector Search for embeddings and similarity search
*   **Authentication:** Clerk (integrated with Convex)
*   **AI/LLM Integration:**
    *   Interaction with LLM APIs (OpenAI, Anthropic, etc.) via Convex actions
    *   Embedding generation using Convex actions
    *   Vector search using Convex's built-in vector database
*   **Document Processing:** Server-side processing via Convex actions
*   **Web Crawling:** Implemented as Convex actions for fetching web content
*   **Scheduled Tasks:** Convex cron jobs for periodic tasks (document reprocessing, cleanup, etc.)

## 3.3. Hosting & Deployment

*   **Frontend:** Vercel (recommended for Convex integration)
*   **Backend:** Convex Cloud (fully managed)
*   **Database:** Convex Database (included with Convex Cloud)
*   **Authentication:** Clerk (cloud-hosted)
*   **File Storage:** Convex File Storage (included)
*   **Iframe Delivery:** Served via Vercel with Convex backend integration

## 3.4. High-Level Architecture Considerations

*   **Unified Platform:** Convex provides database, real-time updates, file storage, and serverless functions in one platform
*   **Type Safety:** End-to-end TypeScript from frontend to backend
*   **Real-time by Default:** All data updates are automatically real-time via Convex subscriptions
*   **Authentication Integration:** Clerk seamlessly integrates with Convex for user management
*   **Scalability:** Convex automatically scales based on usage
*   **Security:** Built-in security with Convex's authentication integration and Clerk's user management
*   **Data Flow for Agent Query:**
    1.  End-user sends a query via the iframe chat widget
    2.  Frontend calls Convex mutation with the query
    3.  Convex action generates an embedding for the query
    4.  Convex performs vector search against the agent's knowledge base
    5.  Convex action sends query + context to LLM API
    6.  LLM response is processed and stored via Convex mutation
    7.  Real-time subscription automatically updates the chat widget

## 3.5. Iframe Communication

*   The embedded iframe communicates with the parent window using `postMessage` API for cross-origin communication
*   Initial configuration (agent ID, theme, etc.) passed via URL parameters or postMessage
*   Convex handles all backend communication with built-in authentication via Clerk 