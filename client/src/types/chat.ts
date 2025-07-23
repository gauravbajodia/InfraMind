export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  createdAt: string;
}

export interface Source {
  title: string;
  url?: string;
  type: string;
  relevance: number;
  snippet: string;
}

export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataSource {
  id: number;
  name: string;
  type: string;
  status: string;
  lastSync?: string;
}

export interface SystemStatus {
  vectorDb: string;
  openaiApi: string;
  searchIndex: {
    documentCount: number;
    status: string;
  };
  dataSources: Array<{
    name: string;
    type: string;
    status: string;
    lastSync?: string;
  }>;
}

export interface QueryFilters {
  dateRange?: string;
  sourceTypes?: string[];
  teams?: string[];
}

export interface ChatQuery {
  query: string;
  conversationId?: number;
  filters?: QueryFilters;
}

export interface IngestionJob {
  id: string;
  type: string;
  status: string;
  progress: number;
  totalItems: number;
  processedItems: number;
  errors: string[];
}
