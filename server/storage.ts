import { 
  users, documents, conversations, messages, dataSources, vectorEmbeddings,
  type User, type InsertUser, type Document, type InsertDocument,
  type Conversation, type InsertConversation, type Message, type InsertMessage,
  type DataSource, type InsertDataSource, type VectorEmbedding
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Documents
  getDocument(id: number): Promise<Document | undefined>;
  getDocuments(filters?: { sourceType?: string; limit?: number }): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  searchDocuments(query: string): Promise<Document[]>;

  // Conversations
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByUser(userId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, updates: Partial<Conversation>): Promise<void>;

  // Messages
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Data Sources
  getDataSources(): Promise<DataSource[]>;
  getDataSource(id: number): Promise<DataSource | undefined>;
  createDataSource(dataSource: InsertDataSource): Promise<DataSource>;
  updateDataSource(id: number, updates: Partial<DataSource>): Promise<void>;

  // Vector embeddings
  createVectorEmbedding(embedding: Omit<VectorEmbedding, 'id'>): Promise<VectorEmbedding>;
  searchSimilarEmbeddings(embedding: number[], limit?: number): Promise<VectorEmbedding[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private dataSources: Map<number, DataSource>;
  private vectorEmbeddings: Map<number, VectorEmbedding>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.dataSources = new Map();
    this.vectorEmbeddings = new Map();
    this.currentId = 1;

    // Initialize with sample data sources
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleDataSources = [
      // Connected External Sources (Active/Configured)
      { 
        name: "Engineering Docs", 
        type: "github", 
        config: { 
          repositoryUrl: "https://github.com/company/engineering-docs",
          accessToken: "configured"
        }, 
        status: "active" as const, 
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      { 
        name: "Knowledge Base", 
        type: "confluence", 
        config: { 
          baseUrl: "https://company.atlassian.net",
          username: "configured",
          apiToken: "configured"
        }, 
        status: "active" as const, 
        lastSync: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      },
      { 
        name: "Support Tickets", 
        type: "jira", 
        config: { 
          baseUrl: "https://company.atlassian.net",
          username: "configured",
          apiToken: "configured"
        }, 
        status: "active" as const, 
        lastSync: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      },
      { 
        name: "Team Discussions", 
        type: "slack", 
        config: { 
          botToken: "configured",
          channels: "engineering,general,support"
        }, 
        status: "active" as const, 
        lastSync: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      },
      { 
        name: "User Database", 
        type: "postgresql", 
        config: { 
          host: "prod-db.company.com",
          database: "users",
          username: "configured"
        }, 
        status: "active" as const, 
        lastSync: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      },
      { 
        name: "Analytics Data", 
        type: "snowflake", 
        config: { 
          account: "company.snowflakecomputing.com",
          database: "ANALYTICS",
          warehouse: "COMPUTE_WH"
        }, 
        status: "active" as const, 
        lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      // More connected sources
      { 
        name: "Application Logs", 
        type: "elasticsearch", 
        config: { 
          url: "https://logs.company.com:9200",
          indices: "app-logs-*,error-logs-*"
        }, 
        status: "active" as const, 
        lastSync: new Date(Date.now() - 20 * 60 * 1000) // 20 minutes ago
      },
      { 
        name: "Confluence", 
        type: "confluence", 
        config: {
          baseUrl: "enter your confluence base url here",
          username: "enter your confluence username here", 
          apiToken: "enter your confluence api token here",
          spaceKey: "enter your confluence space key here"
        }, 
        status: "inactive" as const, 
        lastSync: null 
      },
      { 
        name: "Jira", 
        type: "jira", 
        config: {
          baseUrl: "enter your jira base url here",
          username: "enter your jira username here",
          apiToken: "enter your jira api token here",
          projectKey: "enter your jira project key here"
        }, 
        status: "inactive" as const, 
        lastSync: null 
      },
      { 
        name: "Slack", 
        type: "slack", 
        config: {
          botToken: "enter your slack bot token here",
          channels: "enter comma-separated channel names here"
        }, 
        status: "inactive" as const, 
        lastSync: null 
      },
      
      // Private Database Sources
      { 
        name: "MongoDB", 
        type: "mongodb", 
        config: {
          connectionString: "enter your mongodb connection string here",
          database: "enter your database name here",
          collections: "enter comma-separated collection names here"
        }, 
        status: "inactive" as const, 
        lastSync: null 
      },
      { 
        name: "PostgreSQL", 
        type: "postgresql", 
        config: {
          host: "enter your postgresql host here",
          port: "5432",
          database: "enter your database name here",
          username: "enter your postgresql username here",
          password: "enter your postgresql password here",
          schema: "public"
        }, 
        status: "inactive" as const, 
        lastSync: null 
      },
      { 
        name: "MySQL", 
        type: "mysql", 
        config: {
          host: "enter your mysql host here",
          port: "3306",
          database: "enter your database name here",
          username: "enter your mysql username here",
          password: "enter your mysql password here"
        }, 
        status: "inactive" as const, 
        lastSync: null 
      },
      { 
        name: "Elasticsearch", 
        type: "elasticsearch", 
        config: {
          host: "enter your elasticsearch host here",
          port: "9200",
          username: "enter your elasticsearch username here",
          password: "enter your elasticsearch password here",
          indices: "enter comma-separated index names here"
        }, 
        status: "inactive" as const, 
        lastSync: null 
      },
      { 
        name: "Redis", 
        type: "redis", 
        config: {
          host: "enter your redis host here",
          port: "6379",
          password: "enter your redis password here",
          database: "0"
        }, 
        status: "inactive" as const, 
        lastSync: null 
      },
      { 
        name: "Snowflake", 
        type: "snowflake", 
        config: {
          account: "enter your snowflake account here",
          username: "enter your snowflake username here",
          password: "enter your snowflake password here",
          warehouse: "enter your warehouse name here",
          database: "enter your database name here",
          schema: "enter your schema name here"
        }, 
        status: "inactive" as const, 
        lastSync: null 
      }
    ];

    sampleDataSources.forEach(ds => {
      const id = this.currentId++;
      this.dataSources.set(id, {
        id,
        ...ds,
        createdAt: new Date(),
      });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "developer",
      email: insertUser.email || null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocuments(filters?: { sourceType?: string; limit?: number }): Promise<Document[]> {
    let docs = Array.from(this.documents.values());
    
    if (filters?.sourceType) {
      docs = docs.filter(doc => doc.sourceType === filters.sourceType);
    }
    
    if (filters?.limit) {
      docs = docs.slice(0, filters.limit);
    }
    
    return docs.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentId++;
    const document: Document = { 
      ...insertDocument, 
      id, 
      metadata: insertDocument.metadata || null,
      sourceUrl: insertDocument.sourceUrl || null,
      uploadedBy: insertDocument.uploadedBy || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.documents.set(id, document);
    return document;
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.documents.values()).filter(doc => 
      doc.title.toLowerCase().includes(searchTerm) ||
      doc.content.toLowerCase().includes(searchTerm)
    );
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByUser(userId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => b.updatedAt!.getTime() - a.updatedAt!.getTime());
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentId++;
    const conversation: Conversation = { 
      ...insertConversation, 
      id, 
      userId: insertConversation.userId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: number, updates: Partial<Conversation>): Promise<void> {
    const conversation = this.conversations.get(id);
    if (conversation) {
      this.conversations.set(id, { ...conversation, ...updates, updatedAt: new Date() });
    }
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      conversationId: insertMessage.conversationId || null,
      sources: insertMessage.sources || null,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async getDataSources(): Promise<DataSource[]> {
    return Array.from(this.dataSources.values());
  }

  async getDataSource(id: number): Promise<DataSource | undefined> {
    return this.dataSources.get(id);
  }

  async createDataSource(insertDataSource: InsertDataSource): Promise<DataSource> {
    const id = this.currentId++;
    const dataSource: DataSource = { 
      ...insertDataSource, 
      id, 
      config: insertDataSource.config || null,
      status: insertDataSource.status || "active",
      lastSync: null,
      createdAt: new Date()
    };
    this.dataSources.set(id, dataSource);
    return dataSource;
  }

  async updateDataSource(id: number, updates: Partial<DataSource>): Promise<void> {
    const dataSource = this.dataSources.get(id);
    if (dataSource) {
      this.dataSources.set(id, { ...dataSource, ...updates });
    }
  }

  async createVectorEmbedding(embedding: Omit<VectorEmbedding, 'id'>): Promise<VectorEmbedding> {
    const id = this.currentId++;
    const vectorEmbedding: VectorEmbedding = { ...embedding, id };
    this.vectorEmbeddings.set(id, vectorEmbedding);
    return vectorEmbedding;
  }

  async searchSimilarEmbeddings(embedding: number[], limit = 10): Promise<VectorEmbedding[]> {
    // Simple cosine similarity search (in production, use proper vector DB)
    const embeddings = Array.from(this.vectorEmbeddings.values());
    const similarities = embeddings.map(ve => {
      const storedEmbedding = JSON.parse(ve.embedding);
      const similarity = this.cosineSimilarity(embedding, storedEmbedding);
      return { embedding: ve, similarity };
    });
    
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.embedding);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

export const storage = new MemStorage();
