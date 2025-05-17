# 3. Technical Stack and Architecture Overview

## 3.1. Frontend

*   **Framework/Library:** React
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Routing:** TanStack Router (React Router)
*   **State Management/Data Fetching:** TanStack Query (React Query)
*   **UI Components:** Shadcn UI
*   **Styling:** Tailwind CSS (comes with Shadcn UI)

## 3.2. Backend (Conceptual - Requires further definition)

*   **Language/Framework:** To be determined (e.g., Python with FastAPI/Flask, Node.js with Express, etc.)
*   **Database:** To be determined (e.g., PostgreSQL for relational data, MongoDB for NoSQL, Vector Database for embeddings).
*   **AI/LLM Integration:**
    *   Interaction with a Large Language Model (LLM) API (e.g., OpenAI, Anthropic, or self-hosted).
    *   Embedding generation for documents and queries.
    *   Vector search for retrieving relevant context.
*   **Document Processing:** Libraries for parsing PDFs, DOCs, TXT files.
*   **Web Crawling:** Libraries/services for fetching and parsing web content.
*   **Authentication:** JWT-based or similar.
*   **Task Queues (Potentially):** For handling asynchronous tasks like document processing, crawling, and agent retraining (e.g., Celery, RabbitMQ).

## 3.3. Hosting & Deployment (Conceptual)

*   **Frontend:** Static hosting (e.g., Vercel, Netlify, AWS S3/CloudFront).
*   **Backend:** Server-based hosting (e.g., AWS EC2/ECS/Lambda, Google Cloud Run, Heroku).
*   **Database:** Managed database service (e.g., AWS RDS, MongoDB Atlas).
*   **Iframe Delivery:** Ensure the iframe content is served efficiently and securely.

## 3.4. High-Level Architecture Considerations

*   **Modular Design:** Separate services for user management, agent configuration, data ingestion, AI interaction, and the chat interface.
*   **API-Driven:** Frontend communicates with the backend via RESTful or GraphQL APIs.
*   **Scalability:** Design components to scale independently (e.g., ingestion pipeline, chat request handling).
*   **Security:** Implement security best practices for data storage, API access, and user authentication.
*   **Data Flow for Agent Query:**
    1.  End-user sends a query via the iframe chat widget.
    2.  Query is forwarded to the backend.
    3.  Backend generates an embedding for the query.
    4.  Backend performs a vector search against the specific agent's knowledge base (indexed documents/content) to find relevant context.
    5.  Backend sends the query + relevant context to an LLM.
    6.  LLM generates a response.
    7.  Backend sends the response back to the chat widget.

## 3.5. Iframe Communication

*   The embedded iframe will need to communicate with the parent window for potential actions like resizing or passing initial configuration (e.g., agent ID). `postMessage` API will likely be used for cross-origin communication. 