# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server:**
```bash
npm run dev
# or
npm start
```
Runs Vite dev server on port 3000

**Build for production:**
```bash
npm run build
```
Runs Vite build and TypeScript compilation

**Run tests:**
```bash
npm test
```
Uses Vitest for testing

**Linting and formatting:**
```bash
npm run lint       # Biome linting with auto-fix
npm run format     # Biome formatting
npm run check      # Biome check with auto-fix (combines lint + format)
```

**Convex backend:**
```bash
npx convex dev     # Start Convex development server
npx convex init    # Initialize Convex (sets env vars automatically)
```

## Architecture Overview

This is a **chatbot/AI agent platform** built with React + Convex, supporting multi-tenant organizations with embeddable chat widgets.

### Tech Stack
- **Frontend:** React 19, TypeScript, TanStack Router, Vite
- **Backend:** Convex (full-stack TypeScript platform with real-time subscriptions)
- **Database:** Convex Database (NoSQL with ACID transactions)
- **Auth:** Clerk (integrated with Convex)
- **Styling:** Tailwind CSS + Shadcn UI components
- **AI/LLM:** OpenAI integration via Convex actions
- **Vector Search:** Convex built-in vector database for embeddings
- **File Processing:** Server-side document processing via Convex actions
- **Testing:** Vitest + React Testing Library
- **Code Quality:** Biome (linting + formatting)

### Key Features
- **Multi-tenant organizations** with role-based access (owner/admin/editor/viewer)
- **AI agents** with knowledge bases built from documents/URLs/text
- **Embeddable chat widgets** served via iframe with cross-origin communication
- **Usage tracking and analytics** with rate limiting and security monitoring
- **Stripe billing integration** with organization-level subscriptions
- **Real-time chat** powered by Convex subscriptions

### Directory Structure

**`/convex/`** - Backend functions and schema
- `schema.ts` - Database schema with organizations, agents, knowledge, conversations, billing, security
- `agents.ts`, `chat.ts`, `knowledge.ts` - Core business logic
- `auth.config.ts` - Clerk authentication configuration
- `billing.ts`, `usage.ts` - Stripe integration and usage tracking
- `security.ts` - Rate limiting and security monitoring
- `vectorSearch.ts`, `embeddings.ts` - AI/ML functionality

**`/src/routes/`** - File-based routing (TanStack Router)
- `dashboard.*.tsx` - Multi-tenant dashboard pages
- `embed.$agentId.tsx` - Embeddable widget endpoint
- `chat.$agentId.tsx` - Standalone chat interface
- `demo.*.tsx` - Demo/test pages (can be deleted)

**`/src/components/`** - React components
- `ui/` - Shadcn UI components
- `billing/` - Subscription and billing components
- `usage/` - Analytics and usage tracking components
- `ChatWidget.tsx` - Main chat interface
- `DashboardLayout.tsx` - Dashboard shell

**`/src/widget/`** - Embeddable widget build target
- Built separately as `widget.min.js` for iframe embedding

### Data Model Key Concepts

- **Organizations** are the main tenant entities with members and subscriptions
- **Agents** belong to organizations and have knowledge bases + chat conversations
- **Knowledge entries** are vectorized and searchable content (documents, URLs, Q&A)
- **Conversations** contain message threads between users and agents
- **Usage tracking** monitors API calls, rate limits, and security incidents per organization

### Development Patterns

**Convex Integration:**
- Use `useQuery()` for reactive data fetching
- Use `useMutation()` for data modifications
- Database relationships use `v.id("tableName")` references
- Vector search uses `.vectorIndex()` with 1536-dimension embeddings

**Organization Context:**
- Most operations are scoped to the current organization
- Check user roles before allowing admin operations
- Use `OrganizationContext.tsx` for organization state

**Security:**
- Widget embedding uses domain verification and rate limiting
- All user actions are logged in `auditLogs` table
- Suspicious activity triggers security incidents

**Shadcn UI:**
Add new components with:
```bash
pnpx shadcn@latest add component-name
```

### Environment Setup

Required environment variables:
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk authentication
- `VITE_CONVEX_URL` - Convex backend URL  
- `CONVEX_DEPLOYMENT` - Convex deployment name

Run `npx convex init` to set Convex variables automatically.