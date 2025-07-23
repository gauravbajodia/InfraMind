import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { ragService } from "./services/rag";
import { ingestionService } from "./services/ingestion";
import { querySchema, insertConversationSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoints
  app.post("/api/chat/query", async (req, res) => {
    try {
      const query = querySchema.parse(req.body);
      const response = await ragService.generateResponse(query);
      
      // Save to conversation if specified
      if (query.conversationId) {
        await storage.createMessage({
          conversationId: query.conversationId,
          role: "user",
          content: query.query
        });
        
        await storage.createMessage({
          conversationId: query.conversationId,
          role: "assistant",
          content: response.answer,
          sources: response.sources
        });
        
        // Update conversation timestamp
        await storage.updateConversation(query.conversationId, {
          updatedAt: new Date()
        });
      }
      
      res.json(response);
    } catch (error) {
      console.error("Query error:", error);
      res.status(500).json({ message: "Failed to process query" });
    }
  });

  app.post("/api/chat/stream", async (req, res) => {
    try {
      const query = querySchema.parse(req.body);
      
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      const stream = await ragService.streamResponse(query);
      
      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error("Streaming error:", error);
      res.status(500).json({ message: "Failed to stream response" });
    }
  });

  // Conversation management
  app.get("/api/conversations", async (req, res) => {
    try {
      // For now, return conversations for user ID 1 (would use auth in production)
      const conversations = await storage.getConversationsByUser(1);
      res.json(conversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ message: "Failed to get conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const data = insertConversationSchema.parse({
        ...req.body,
        userId: 1 // Would use authenticated user ID
      });
      const conversation = await storage.createConversation(data);
      res.json(conversation);
    } catch (error) {
      console.error("Create conversation error:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getMessagesByConversation(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  // Document management
  app.get("/api/documents", async (req, res) => {
    try {
      const { sourceType, limit } = req.query;
      const documents = await storage.getDocuments({
        sourceType: sourceType as string,
        limit: limit ? parseInt(limit as string) : undefined
      });
      res.json(documents);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  app.post("/api/documents/upload", upload.array('files'), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files provided" });
      }
      
      const jobId = await ingestionService.ingestMultipleFiles(files, 1); // Would use authenticated user ID
      res.json({ jobId, message: "Upload started" });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload documents" });
    }
  });

  // Data source management
  app.get("/api/sources", async (req, res) => {
    try {
      const sources = await storage.getDataSources();
      res.json(sources);
    } catch (error) {
      console.error("Get sources error:", error);
      res.status(500).json({ message: "Failed to get data sources" });
    }
  });

  app.post("/api/sources/sync", async (req, res) => {
    try {
      const { type, config } = req.body;
      
      let jobId: string;
      
      switch (type) {
        case "github":
          jobId = await ingestionService.syncGitHubRepository(config.repoUrl, config.accessToken);
          break;
        case "confluence":
          jobId = await ingestionService.syncConfluence(config.spaceKey, config.baseUrl, config.credentials);
          break;
        default:
          return res.status(400).json({ message: "Unsupported source type" });
      }
      
      // Update data source sync timestamp
      const sources = await storage.getDataSources();
      const source = sources.find(s => s.type === type);
      if (source) {
        await storage.updateDataSource(source.id, { lastSync: new Date() });
      }
      
      res.json({ jobId, message: "Sync started" });
    } catch (error) {
      console.error("Sync error:", error);
      res.status(500).json({ message: "Failed to sync data source" });
    }
  });

  // Ingestion job status
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = ingestionService.getJobStatus(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Get job error:", error);
      res.status(500).json({ message: "Failed to get job status" });
    }
  });

  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = ingestionService.getAllJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Get jobs error:", error);
      res.status(500).json({ message: "Failed to get jobs" });
    }
  });

  // System status
  app.get("/api/status", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      const sources = await storage.getDataSources();
      
      res.json({
        vectorDb: "healthy",
        openaiApi: "operational",
        searchIndex: {
          documentCount: documents.length,
          status: "healthy"
        },
        dataSources: sources.map(source => ({
          name: source.name,
          type: source.type,
          status: source.status,
          lastSync: source.lastSync
        }))
      });
    } catch (error) {
      console.error("Status error:", error);
      res.status(500).json({ message: "Failed to get system status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
