import { apiRequest } from "./queryClient";
import type { ChatQuery, Conversation, DataSource, SystemStatus, IngestionJob } from "../types/chat";

export const chatApi = {
  async sendQuery(query: ChatQuery) {
    const response = await apiRequest("POST", "/api/chat/query", query);
    return response.json();
  },

  async streamQuery(query: ChatQuery): Promise<EventSource> {
    const eventSource = new EventSource("/api/chat/stream");
    
    // Send the query via POST first
    await apiRequest("POST", "/api/chat/stream", query);
    
    return eventSource;
  },

  async getConversations(): Promise<Conversation[]> {
    const response = await apiRequest("GET", "/api/conversations");
    return response.json();
  },

  async createConversation(title: string): Promise<Conversation> {
    const response = await apiRequest("POST", "/api/conversations", { title });
    return response.json();
  },

  async getMessages(conversationId: number) {
    const response = await apiRequest("GET", `/api/conversations/${conversationId}/messages`);
    return response.json();
  },
};

export const documentsApi = {
  async getDocuments(filters?: { sourceType?: string; limit?: number }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.sourceType) params.set("sourceType", filters.sourceType);
    if (filters?.limit) params.set("limit", filters.limit.toString());
    
    const response = await apiRequest("GET", `/api/documents?${params}`);
    return response.json();
  },

  async uploadFiles(files: FileList): Promise<{ jobId: string }> {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append("files", file);
    });

    const response = await fetch("/api/documents/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  },
};

export const systemApi = {
  async getStatus(): Promise<SystemStatus> {
    const response = await apiRequest("GET", "/api/status");
    return response.json();
  },

  async getJob(jobId: string): Promise<IngestionJob> {
    const response = await apiRequest("GET", `/api/jobs/${jobId}`);
    return response.json();
  },

  async getAllJobs(): Promise<IngestionJob[]> {
    const response = await apiRequest("GET", "/api/jobs");
    return response.json();
  },
};

export const sourcesApi = {
  async getDataSources(): Promise<DataSource[]> {
    const response = await apiRequest("GET", "/api/sources");
    return response.json();
  },

  async syncSource(type: string, config: any): Promise<{ jobId: string }> {
    const response = await apiRequest("POST", "/api/sources/sync", { type, config });
    return response.json();
  },
};

// Remove this duplicate - systemApi is already defined above
