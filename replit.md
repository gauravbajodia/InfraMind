# InfraMind - Internal AI Assistant

## Overview

InfraMind is a full-stack RAG (Retrieval-Augmented Generation) system designed to help engineering teams retrieve internal documentation and organizational knowledge. The application combines a modern React frontend with an Express.js backend, utilizing PostgreSQL for data storage and OpenAI's GPT-4o for AI-powered responses.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **January 2025**: Added comprehensive data source management with frontend credential input
- **January 2025**: Implemented dynamic data source lists showing only configured sources
- **January 2025**: Created detailed README with setup instructions and API documentation
- **January 2025**: Added sample connected data sources for demonstration
- **January 2025**: Fixed GitHub sync error handling and improved error messages
- **January 2025**: Reverted demo mode implementation back to original chat-focused interface

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod for validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4o for language processing
- **File Handling**: Multer for document uploads
- **Vector Storage**: In-memory storage with planned FAISS/ChromaDB integration

### Database Design
The schema includes core entities for:
- Users (authentication and role management)
- Documents (with metadata and source tracking)
- Conversations and Messages (chat history)
- Vector Embeddings (for semantic search)
- Data Sources (external integrations)

## Key Components

### RAG System
- **Document Processing**: Supports multiple formats (Markdown, PDF, txt, JSON)
- **Chunking Strategy**: Text is split into manageable chunks with metadata preservation
- **Vector Embeddings**: OpenAI embeddings for semantic similarity search
- **Response Generation**: Context-aware responses using retrieved documents

### Chat Interface
- **Real-time Chat**: Message-based interface with conversation history
- **Source Citations**: Responses include references to source documents
- **File Upload**: Direct document upload with processing pipeline
- **Conversation Management**: Persistent chat sessions with timestamps

### Document Ingestion
- **Multi-source Support**: GitHub, Confluence, Jira, Slack integrations planned
- **File Processing**: Automatic content extraction and metadata tagging
- **Progress Tracking**: Job-based ingestion with status monitoring
- **Error Handling**: Comprehensive error tracking and recovery

## Data Flow

1. **Document Ingestion**: Files are uploaded or synced from external sources
2. **Processing**: Documents are parsed, chunked, and vectorized
3. **Storage**: Content and embeddings are stored in PostgreSQL
4. **Query Processing**: User queries are converted to embeddings
5. **Retrieval**: Similar document chunks are found using vector search
6. **Generation**: OpenAI generates contextual responses with source citations
7. **Response**: Results are returned with metadata and conversation tracking

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL (via Neon serverless)
- **AI Services**: OpenAI API for embeddings and completions
- **UI Framework**: Radix UI components for accessible interfaces
- **Build Tools**: Vite for frontend, ESBuild for backend compilation

### Development Tools
- **TypeScript**: Full type safety across the stack
- **Drizzle Kit**: Database migrations and schema management
- **TanStack Query**: API state management and caching
- **Tailwind CSS**: Utility-first styling approach

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds to `dist/public` directory
- **Backend**: ESBuild compiles TypeScript to `dist` directory
- **Static Serving**: Express serves built frontend in production

### Environment Configuration
- **Development**: Hot reloading with Vite middleware
- **Production**: Optimized builds with static file serving
- **Database**: Environment-based connection strings
- **API Keys**: Secure environment variable management

### Scalability Considerations
- **Vector Storage**: Designed for migration to dedicated vector databases
- **Caching**: Query client provides intelligent caching strategies
- **Error Handling**: Comprehensive error boundaries and logging
- **Performance**: Optimized database queries and lazy loading