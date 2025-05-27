# MVP Development Tasks

This document contains a granular, step-by-step plan to build the AI Agent Platform MVP. Each task is designed to be small, testable, and focused on a single concern.

## Phase 1: Project Setup & Foundation

### Task 1.1: Initialize Convex Project
**Goal:** Set up the basic Convex project structure
**Start:** Empty repository
**End:** Working Convex project with basic schema
**Test:** `npx convex dev` runs without errors and dashboard is accessible

### Task 1.2: Initialize React + Vite Frontend
**Goal:** Create the frontend application with TypeScript
**Start:** Convex project exists
**End:** React app runs and can connect to Convex
**Test:** `npm run dev` serves the app and Convex connection is established

### Task 1.3: Setup Clerk Authentication
**Goal:** Integrate Clerk for user authentication
**Start:** Frontend and Convex are connected
**End:** Users can sign up/sign in via Clerk
**Test:** User can register, login, and see authenticated state

### Task 1.4: Configure Convex-Clerk Integration
**Goal:** Connect Clerk authentication with Convex backend
**Start:** Clerk is working in frontend
**End:** Convex functions can access authenticated user data
**Test:** Convex query returns current user information

### Task 1.5: Setup Tailwind CSS + Shadcn UI
**Goal:** Configure styling framework and component library
**Start:** React app is running
**End:** Basic UI components are available and styled
**Test:** Render a shadcn button component with proper styling

### Task 1.6: Setup TanStack Router
**Goal:** Configure client-side routing
**Start:** React app with UI components
**End:** Basic routing structure with protected routes
**Test:** Navigate between public and authenticated routes

## Phase 2: Database Schema & Core Models

### Task 2.1: Define User Schema
**Goal:** Create user data model in Convex
**Start:** Convex project with auth
**End:** User table with basic fields (id, email, name, createdAt)
**Test:** User record is created automatically on first login

### Task 2.2: Define Agent Schema
**Goal:** Create agent data model
**Start:** User schema exists
**End:** Agent table with fields (id, userId, name, description, createdAt, updatedAt)
**Test:** Can create and query agents for a specific user

### Task 2.3: Define Knowledge Base Schema
**Goal:** Create knowledge base entry model
**Start:** Agent schema exists
**End:** KnowledgeEntry table with fields (id, agentId, content, source, embeddings, createdAt)
**Test:** Can store and retrieve knowledge entries for an agent

### Task 2.4: Define Chat Conversation Schema
**Goal:** Create chat conversation and message models
**Start:** Agent schema exists
**End:** Conversation and Message tables with proper relationships
**Test:** Can create conversations and add messages

## Phase 3: Basic Dashboard Layout

### Task 3.1: Create Dashboard Layout Component
**Goal:** Build the main dashboard shell
**Start:** Routing is configured
**End:** Dashboard with sidebar navigation and main content area
**Test:** Dashboard renders with proper layout and navigation

### Task 3.2: Create Agent List Page
**Goal:** Display user's agents in a list/grid view
**Start:** Dashboard layout exists
**End:** Page showing all user's agents with basic info
**Test:** User can see their agents (empty state if none exist)

### Task 3.3: Create Agent Creation Form
**Goal:** Allow users to create new agents
**Start:** Agent list page exists
**End:** Modal/page with form to create new agent
**Test:** User can create an agent and see it in the list

### Task 3.4: Create Agent Detail Page
**Goal:** Show individual agent information and management
**Start:** Agent creation works
**End:** Page displaying agent details with navigation tabs
**Test:** User can view agent details and navigate between sections

## Phase 4: Knowledge Base - Rich Text Editor

### Task 4.1: Integrate Rich Text Editor
**Goal:** Add WYSIWYG editor for direct content input
**Start:** Agent detail page exists
**End:** Rich text editor component is functional
**Test:** User can type, format text, and save content

### Task 4.2: Create Knowledge Entry Form
**Goal:** Allow users to create knowledge entries via editor
**Start:** Rich text editor works
**End:** Form to save editor content as knowledge entry
**Test:** User can create and save a knowledge entry

### Task 4.3: Display Knowledge Entries List
**Goal:** Show all knowledge entries for an agent
**Start:** Knowledge entries can be created
**End:** List view of all knowledge entries with edit/delete options
**Test:** User can see all their knowledge entries

### Task 4.4: Edit Knowledge Entries
**Goal:** Allow editing of existing knowledge entries
**Start:** Knowledge entries list exists
**End:** User can edit existing entries
**Test:** User can modify and save changes to knowledge entries

### Task 4.5: Delete Knowledge Entries
**Goal:** Allow deletion of knowledge entries
**Start:** Edit functionality works
**End:** User can delete knowledge entries with confirmation
**Test:** User can delete entries and they disappear from the list

## Phase 5: Document Upload Processing

### Task 5.1: Setup Convex File Storage
**Goal:** Configure file upload capability
**Start:** Convex project is set up
**End:** Files can be uploaded to Convex storage
**Test:** Upload a test file and retrieve its URL

### Task 5.2: Create File Upload Component
**Goal:** Build UI for document uploads
**Start:** File storage is configured
**End:** Drag-and-drop file upload component
**Test:** User can select and upload files (PDF, DOC, TXT)

### Task 5.3: Implement Text Extraction Action
**Goal:** Extract text content from uploaded documents
**Start:** File upload works
**End:** Convex action that extracts text from PDF/DOC/TXT files
**Test:** Upload a document and verify text is extracted correctly

### Task 5.4: Implement Text Chunking
**Goal:** Split extracted text into manageable chunks
**Start:** Text extraction works
**End:** Function that splits text into semantic chunks
**Test:** Long text is split into appropriate chunks

### Task 5.5: Store Document Knowledge Entries
**Goal:** Save processed document content as knowledge entries
**Start:** Text chunking works
**End:** Document chunks are stored as knowledge entries
**Test:** Uploaded document appears as multiple knowledge entries

## Phase 6: Embedding Generation & Vector Search

### Task 6.1: Setup OpenAI API Integration
**Goal:** Configure OpenAI API for embeddings
**Start:** Text processing works
**End:** Convex action can call OpenAI embeddings API
**Test:** Generate embeddings for sample text

### Task 6.2: Generate Embeddings for Knowledge Entries
**Goal:** Create embeddings for all knowledge content
**Start:** OpenAI integration works
**End:** All knowledge entries have embeddings stored
**Test:** Knowledge entries have embedding vectors

### Task 6.3: Setup Convex Vector Search
**Goal:** Configure vector search in Convex
**Start:** Embeddings are generated
**End:** Vector search index is created and functional
**Test:** Can perform similarity search on knowledge entries

### Task 6.4: Implement Knowledge Retrieval Function
**Goal:** Find relevant knowledge for user queries
**Start:** Vector search is configured
**End:** Function that retrieves relevant knowledge chunks
**Test:** Query returns most relevant knowledge entries

## Phase 7: Basic Chat Interface

### Task 7.1: Create Chat Widget Component
**Goal:** Build the embedded chat interface
**Start:** Vector search works
**End:** Basic chat UI with message list and input
**Test:** Chat widget renders and accepts user input

### Task 7.2: Implement Chat Message Storage
**Goal:** Store chat conversations in database
**Start:** Chat widget exists
**End:** Messages are saved to Convex database
**Test:** Chat messages persist and can be retrieved

### Task 7.3: Implement Basic AI Response
**Goal:** Generate AI responses using OpenAI
**Start:** Knowledge retrieval works
**End:** AI responds to user queries using relevant knowledge
**Test:** User query receives relevant AI-generated response

### Task 7.4: Add Real-time Chat Updates
**Goal:** Make chat updates real-time using Convex subscriptions
**Start:** Basic AI responses work
**End:** Chat updates in real-time without page refresh
**Test:** Multiple users can chat and see updates instantly

## Phase 8: Agent Deployment & Iframe

### Task 8.1: Create Agent Public Chat Page
**Goal:** Public page for agent chat accessible via URL
**Start:** Chat interface works
**End:** Public route that loads agent chat by ID
**Test:** Can access agent chat via public URL

### Task 8.2: Implement Iframe Embedding
**Goal:** Make chat embeddable in external websites
**Start:** Public chat page exists
**End:** Chat page works properly when embedded in iframe
**Test:** Chat widget functions correctly when embedded

### Task 8.3: Generate Embed Code
**Goal:** Provide iframe embed code to users
**Start:** Iframe embedding works
**End:** Dashboard shows embed code for each agent
**Test:** User can copy embed code and it works on external site

### Task 8.4: Add Basic Chat Widget Customization
**Goal:** Allow basic styling customization
**Start:** Embed code generation works
**End:** Users can customize colors and basic appearance
**Test:** Customization options affect the embedded widget

## Phase 9: Web Crawling (Basic)

### Task 9.1: Implement URL Content Fetching
**Goal:** Fetch content from single URLs
**Start:** Document processing pipeline exists
**End:** Convex action that fetches and extracts text from URLs
**Test:** Can extract text content from a webpage URL

### Task 9.2: Create URL Input Form
**Goal:** Allow users to add URLs as knowledge sources
**Start:** URL fetching works
**End:** Form to add URLs to agent knowledge base
**Test:** User can add a URL and see it processed

### Task 9.3: Process Crawled Content
**Goal:** Convert crawled content to knowledge entries
**Start:** URL content fetching works
**End:** Crawled content is chunked and stored as knowledge entries
**Test:** URL content appears as knowledge entries in the agent

### Task 9.4: Display Data Sources Management
**Goal:** Show all data sources for an agent
**Start:** Multiple data source types work
**End:** Unified view of all data sources (documents, text, URLs)
**Test:** User can see and manage all their data sources

## Phase 10: Testing & Polish

### Task 10.1: Add Loading States
**Goal:** Improve UX with proper loading indicators
**Start:** Core functionality works
**End:** All async operations show loading states
**Test:** User sees loading indicators during operations

### Task 10.2: Add Error Handling
**Goal:** Handle and display errors gracefully
**Start:** Loading states are implemented
**End:** Proper error messages for all failure scenarios
**Test:** Errors are displayed clearly to users

### Task 10.3: Add Form Validation
**Goal:** Validate user inputs properly
**Start:** Error handling exists
**End:** All forms have proper validation and error messages
**Test:** Invalid inputs show helpful error messages

### Task 10.4: Implement Basic Analytics
**Goal:** Show basic usage statistics
**Start:** Chat functionality is complete
**End:** Dashboard shows message count and basic metrics
**Test:** User can see how many messages their agent has handled

### Task 10.5: Add Responsive Design
**Goal:** Ensure mobile compatibility
**Start:** Desktop functionality is complete
**End:** All interfaces work properly on mobile devices
**Test:** App functions correctly on various screen sizes

### Task 10.6: Performance Optimization
**Goal:** Optimize loading times and responsiveness
**Start:** All features are implemented
**End:** Fast loading times and smooth interactions
**Test:** App loads quickly and responds smoothly to user actions

## Phase 11: MVP Deployment

### Task 11.1: Setup Production Environment
**Goal:** Configure production Convex deployment
**Start:** All features are tested locally
**End:** Production Convex environment is configured
**Test:** Production environment is accessible and functional

### Task 11.2: Deploy Frontend to Vercel
**Goal:** Deploy the React app to production
**Start:** Production backend is ready
**End:** Frontend is deployed and connected to production backend
**Test:** Production app is accessible and fully functional

### Task 11.3: Configure Custom Domain (Optional)
**Goal:** Setup custom domain for the application
**Start:** App is deployed
**End:** App is accessible via custom domain
**Test:** Custom domain loads the application correctly

### Task 11.4: Final End-to-End Testing
**Goal:** Comprehensive testing of the complete system
**Start:** App is deployed to production
**End:** All user stories are verified in production
**Test:** Complete user journey works from signup to embedded chat

---

## Notes for Implementation

- Each task should be completed and tested before moving to the next
- Tasks within a phase can sometimes be worked on in parallel
- Some tasks may reveal the need for additional sub-tasks
- Focus on MVP functionality first - advanced features can be added later
- Maintain a simple, clean codebase that can be easily extended

## Success Criteria for MVP

1. Users can sign up and create agents
2. Users can add knowledge via rich text editor and document uploads
3. Users can embed working chat widgets on their websites
4. End users can have meaningful conversations with AI agents
5. The system is secure, performant, and reliable 