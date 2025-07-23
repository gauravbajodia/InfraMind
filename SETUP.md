# InfraMind Setup Guide

This guide will walk you through setting up InfraMind for development and production environments.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and **npm**
- **PostgreSQL 12+** (local or cloud instance)
- **Git** for version control

## Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repository-url>
cd infra-mind

# Install dependencies
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL

1. **Install PostgreSQL** (if not already installed):
   ```bash
   # macOS with Homebrew
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   
   # Windows
   # Download and install from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database and user
   CREATE DATABASE infra_mind;
   CREATE USER infra_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE infra_mind TO infra_user;
   \q
   ```

#### Option B: Cloud Database (Neon)

1. **Sign up for Neon** at [neon.tech](https://neon.tech)
2. **Create a new project** and database
3. **Copy the connection string** from the dashboard

### 3. Environment Configuration

1. **Copy the example environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your values**:
   ```env
   # Database (use your actual connection string)
   DATABASE_URL=postgresql://infra_user:your_password@localhost:5432/infra_mind
   
   # OpenAI API Key (required)
   OPENAI_API_KEY=sk-your-actual-openai-api-key
   
   # Session Secret (generate a secure random string)
   SESSION_SECRET=generate-a-random-secure-string-here
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

### 4. Get OpenAI API Key

1. **Visit OpenAI Platform**: Go to [platform.openai.com](https://platform.openai.com)
2. **Sign up/Sign in** to your account
3. **Navigate to API Keys**: Click on "API Keys" in the left sidebar
4. **Create New Key**: Click "Create new secret key"
5. **Copy the Key**: Save it immediately (you won't be able to see it again)
6. **Add to `.env`**: Paste it as the value for `OPENAI_API_KEY`

### 5. Initialize Database

```bash
# Push the database schema
npx drizzle-kit push
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Production Setup

### 1. Environment Variables

Create a production `.env` file with these required variables:

```env
# Production Database
DATABASE_URL=postgresql://user:pass@prod-host:5432/infra_mind

# OpenAI Configuration
OPENAI_API_KEY=sk-your-production-api-key

# Security
SESSION_SECRET=super-secure-production-secret-min-32-chars
NODE_ENV=production
FORCE_SSL=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS (adjust for your domain)
CORS_ORIGINS=https://yourdomain.com

# Monitoring
LOG_LEVEL=warn
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

### 2. Build and Deploy

```bash
# Install production dependencies
npm ci --only=production

# Build the application
npm run build

# Start production server
npm start
```

### 3. Database Migration

In production, always run database migrations:

```bash
# Generate migration files
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit push
```

## Data Source Configuration

Once the application is running, you can configure data sources through the UI:

### 1. Access Data Sources

1. **Login** to the application
2. **Navigate** to Documents tab
3. **Click** "Upload Documents & Connect Data Sources"
4. **Select** "Data Sources" tab
5. **Click** "Add Data Source"

### 2. Configure External Services

#### GitHub
- **Repository URL**: `https://github.com/your-org/your-repo`
- **Access Token**: Generate from GitHub Settings → Developer settings → Personal access tokens

#### Confluence
- **Base URL**: `https://your-company.atlassian.net`
- **Username**: Your email address
- **API Token**: Generate from Atlassian Account Settings → Security → API tokens

#### Slack
- **Bot Token**: Create a Slack app and install to workspace
- **Channels**: Comma-separated list of channel names

#### Databases
Configure connection strings and credentials for:
- PostgreSQL
- MongoDB
- MySQL
- Elasticsearch
- Redis
- Snowflake

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection
psql "postgresql://user:pass@host:port/database"
```

#### 2. OpenAI API Errors
- Verify API key is correct
- Check account has available credits
- Ensure proper model access permissions

#### 3. Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3000 npm run dev
```

#### 4. Module Not Found Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Performance Optimization

#### 1. Database Indexing
```sql
-- Add indexes for better performance
CREATE INDEX idx_documents_source_type ON documents(source_type);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_embeddings_document_id ON vector_embeddings(document_id);
```

#### 2. Caching
Consider adding Redis for caching:
```env
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
```

#### 3. File Upload Limits
Adjust for your needs:
```env
MAX_FILE_SIZE=52428800  # 50MB
MAX_FILES_PER_UPLOAD=10
```

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` files to version control
- Use different secrets for each environment
- Rotate API keys regularly

### 2. Database Security
- Use connection pooling
- Enable SSL in production
- Implement proper backup strategies

### 3. API Security
- Enable rate limiting
- Use HTTPS in production
- Implement proper authentication

### 4. File Uploads
- Validate file types and sizes
- Scan uploads for malware
- Store files outside web root

## Monitoring and Logging

### 1. Health Checks
Monitor these endpoints:
- `GET /api/status` - System health
- `GET /api/jobs` - Processing jobs

### 2. Logging
Configure structured logging:
```env
LOG_LEVEL=info
LOG_FORMAT=json
```

### 3. Error Tracking
Integrate with Sentry:
```env
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production
```

## Support

If you encounter issues:

1. **Check the logs** for error messages
2. **Search GitHub Issues** for similar problems
3. **Create a new issue** with detailed information
4. **Include environment details** and error logs

For additional help, refer to:
- [API Documentation](docs/api.md)
- [Architecture Guide](docs/architecture.md)
- [Contributing Guidelines](CONTRIBUTING.md)