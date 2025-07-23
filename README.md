# InfraMind - Enterprise AI Assistant

![InfraMind Dashboard](https://via.placeholder.com/800x400/1f2937/ffffff?text=InfraMind+Dashboard)

InfraMind is a full-stack RAG (Retrieval-Augmented Generation) system designed to help engineering teams retrieve internal documentation and organizational knowledge. The application combines a modern React frontend with an Express.js backend, utilizing PostgreSQL for data storage and OpenAI's GPT-4o for AI-powered responses.

## 🚀 Features

- **AI-Powered Chat Interface**: Query your organizational knowledge using natural language
- **Multi-Source Data Integration**: Connect GitHub, Confluence, Jira, Slack, and various databases
- **Real-time Analytics**: Monitor system health, document counts, and sync status
- **Document Management**: Upload, process, and manage documents with metadata
- **Smart Search**: Vector-based semantic search across all connected sources
- **User Authentication**: Secure login system with session management
- **Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui components

## 📊 Screenshots

### Chat Interface
![Chat Interface](https://via.placeholder.com/600x400/3b82f6/ffffff?text=AI+Chat+Interface)

### Data Sources Management
![Data Sources](https://via.placeholder.com/600x400/10b981/ffffff?text=Data+Sources+Management)

### Analytics Dashboard
![Analytics](https://via.placeholder.com/600x400/f59e0b/ffffff?text=Analytics+Dashboard)

### Document Upload
![Document Upload](https://via.placeholder.com/600x400/8b5cf6/ffffff?text=Document+Upload)

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- TanStack Query for state management
- Wouter for routing
- Tailwind CSS + shadcn/ui for styling
- Lucide React for icons

**Backend:**
- Express.js with TypeScript
- Drizzle ORM with PostgreSQL
- OpenAI API for embeddings and completions
- Multer for file uploads
- In-memory vector storage (expandable to FAISS/ChromaDB)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd infra-mind
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/infra_mind

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here

# Server Configuration
PORT=5000
NODE_ENV=development
```

4. **Set up the database**
```bash
# Run database migrations
npm run db:push

# Optional: Seed with sample data
npm run db:seed
```

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## ⚙️ Configuration

### OpenAI API Setup

1. **Get your API key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add it to your `.env` file as `OPENAI_API_KEY`

2. **Configure model settings** (optional)
   Edit `server/services/openai.ts`:
   ```typescript
   const EMBEDDING_MODEL = "text-embedding-3-small"; // or text-embedding-3-large
   const CHAT_MODEL = "gpt-4o"; // or gpt-4o-mini, gpt-3.5-turbo
   ```

### Database Configuration

#### PostgreSQL (Primary Database)
```env
DATABASE_URL=postgresql://username:password@host:port/database_name

# For local development:
DATABASE_URL=postgresql://postgres:password@localhost:5432/infra_mind

# For production (example with Neon):
DATABASE_URL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### Alternative Database Support
The application supports multiple database types for data source connections:

**MongoDB:**
```javascript
{
  connectionString: "mongodb://username:password@host:port/database",
  database: "your_database_name",
  collections: "collection1,collection2"
}
```

**MySQL:**
```javascript
{
  host: "localhost",
  port: "3306",
  database: "your_database",
  username: "mysql_user",
  password: "mysql_password"
}
```

**Elasticsearch:**
```javascript
{
  url: "https://your-cluster.es.amazonaws.com:9200",
  username: "elastic_user", // optional
  password: "elastic_password", // optional
  indices: "logs-*,metrics-*"
}
```

**Redis:**
```javascript
{
  host: "localhost",
  port: "6379",
  password: "redis_password", // optional
  database: "0"
}
```

**Snowflake:**
```javascript
{
  account: "your-account.snowflakecomputing.com",
  username: "snowflake_user",
  password: "snowflake_password",
  warehouse: "COMPUTE_WH",
  database: "YOUR_DATABASE",
  schema: "PUBLIC"
}
```

### External Service Integration

#### GitHub
1. **Generate Personal Access Token**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` scope
   - Use in data source configuration

#### Confluence
1. **Create API Token**
   - Visit [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
   - Create new token
   - Use with your email as username

#### Jira
Same as Confluence - uses Atlassian API tokens.

#### Slack
1. **Create Slack App**
   - Visit [Slack API](https://api.slack.com/apps)
   - Create new app
   - Add Bot Token Scopes: `channels:read`, `channels:history`, `chat:write`
   - Install app to workspace
   - Use Bot User OAuth Token

## 📁 Project Structure

```
infra-mind/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── types/          # TypeScript type definitions
│   └── index.html
├── server/                 # Express backend
│   ├── services/           # Business logic services
│   │   ├── openai.ts       # OpenAI integration
│   │   ├── ingestion.ts    # Document processing
│   │   ├── rag.ts          # RAG implementation
│   │   └── vectorStore.ts  # Vector storage
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage layer
│   └── index.ts            # Server entry point
├── shared/
│   └── schema.ts           # Shared type definitions
├── package.json
├── drizzle.config.ts       # Database configuration
├── tailwind.config.ts      # Tailwind CSS config
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Documents
- `GET /api/documents` - List all documents
- `POST /api/documents/upload` - Upload files
- `GET /api/documents/search?q=query` - Search documents

### Chat
- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Create new conversation
- `POST /api/conversations/:id/messages` - Send message

### Data Sources
- `GET /api/sources` - List configured data sources
- `POST /api/sources` - Add new data source
- `POST /api/sources/sync` - Sync data source
- `PUT /api/sources/:id` - Update data source
- `DELETE /api/sources/:id` - Remove data source

### System
- `GET /api/status` - System health check
- `GET /api/jobs` - List ingestion jobs
- `GET /api/jobs/:id` - Get job status

## 🧪 Development

### Running Tests
```bash
npm test
```

### Code Formatting
```bash
npm run format
```

### Type Checking
```bash
npm run type-check
```

### Database Operations
```bash
# Push schema changes to database
npx drizzle-kit push

# Generate SQL migrations
npx drizzle-kit generate

# View database in Drizzle Studio
npx drizzle-kit studio
```

## 📦 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=postgresql://prod-user:password@prod-host:5432/prod_db
OPENAI_API_KEY=sk-prod-api-key
SESSION_SECRET=super-secure-production-secret
PORT=5000

# Optional: Enable SSL
FORCE_SSL=true

# Optional: Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Build and Deploy
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs and request features on [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: Additional docs available in the `/docs` folder
- **Community**: Join our discussion forum for questions and tips

## 🔮 Roadmap

- [ ] Advanced vector database integration (Pinecone, Weaviate)
- [ ] Real-time collaboration features
- [ ] Advanced analytics and reporting
- [ ] Mobile application
- [ ] Enterprise SSO integration
- [ ] Custom model fine-tuning
- [ ] Multi-tenant support

---

Built with ❤️ for engineering teams who need intelligent knowledge retrieval.