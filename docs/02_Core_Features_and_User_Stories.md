# 2. Core Features and User Stories

## 2.1. Core Features

### 2.1.1. Agent Creation & Management
*   **Dashboard:** Centralized interface for users to create, view, edit, and manage their AI agents.
*   **Multiple Agent Support:** Users can create and manage multiple distinct AI agents for different websites or purposes.
*   **Agent Configuration:** Settings for agent name, persona (optional), default responses for unknown queries, etc.

### 2.1.2. Knowledge Base Population
*   **Document Upload:** Support for uploading various file types (PDF, DOC, DOCX, TXT) to train the agent.
*   **Rich Text Editor:** An in-app editor for users to directly input and format text-based knowledge (FAQs, product info, etc.).
*   **Website Crawling:** Ability to provide website URLs or sitemaps for the platform to crawl and extract information.
*   **Data Source Management:** Users can view, update, or remove data sources linked to their agents.
*   **Retraining:** Mechanism to retrain agents when knowledge base is updated.

### 2.1.3. Agent Deployment
*   **Iframe Embedding:** Generate an iframe embed code for each agent.
*   **Customization (Basic):** Options to customize the appearance of the chat widget (colors, logo - to be decided).

### 2.1.4. Chat Interface (End-User Facing)
*   **Interactive Chat:** Clean and intuitive chat interface for end-users.
*   **Conversation History (Session-based):** End-users can see the current conversation.
*   **Clear Indication of AI:** Transparency that the end-user is interacting with an AI agent.

### 2.1.5. User Account Management
*   **Authentication:** Secure user registration and login.
*   **Profile Management:** Basic user profile settings.

## 2.2. High-Level User Stories

### Business User (Agent Creator/Manager)
*   **U S1:** As a business owner, I want to sign up and create an account on the platform so I can build AI agents.
*   **U S2:** As a business owner, I want to create a new AI agent by giving it a name and basic configuration so I can start training it.
*   **U S3:** As a business owner, I want to upload PDF and TXT documents containing my company's support information so the AI agent can learn from them.
*   **U S4:** As a business owner, I want to use a rich text editor to directly input FAQs and answers so I can quickly add specific knowledge to the agent.
*   **U S5:** As a business owner, I want to provide a link to my website's FAQ page or sitemap so the platform can crawl it and add the content to the agent's knowledge.
*   **U S6:** As a business owner, I want to view and manage the different data sources I've added for an agent so I can keep its knowledge up-to-date.
*   **U S7:** As a business owner, I want to get an iframe code for my trained AI agent so I can easily embed it on my company website.
*   **U S8:** As a business owner, I want to see how many interactions my agent has had (basic analytics) so I can gauge its usage.

### End-User (Customer of the Business)
*   **U S9:** As a website visitor, I want to see a chat widget on the business's website so I can ask questions.
*   **U S10:** As a website visitor, I want to type my questions into the chat widget and receive relevant answers from the AI agent so I can get support quickly.
*   **U S11:** As a website visitor, I want the conversation to be clear and easy to follow so I can understand the information provided. 