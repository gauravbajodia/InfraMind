import { storage } from "../storage";
import { documentProcessor } from "./documentProcessor";
import { vectorStore } from "./vectorStore";
import { InsertDocument } from "@shared/schema";

export interface IngestionJob {
  id: string;
  type: "upload" | "github" | "confluence" | "jira" | "slack";
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  totalItems: number;
  processedItems: number;
  errors: string[];
}

export class IngestionService {
  private activeJobs: Map<string, IngestionJob> = new Map();

  async ingestFile(file: any, userId: number, sourceType = "upload"): Promise<string> {
    const jobId = this.generateJobId();
    
    const job: IngestionJob = {
      id: jobId,
      type: "upload",
      status: "processing",
      progress: 0,
      totalItems: 1,
      processedItems: 0,
      errors: []
    };
    
    this.activeJobs.set(jobId, job);
    
    try {
      // Process the document
      const processed = await documentProcessor.processDocument(file, sourceType);
      
      // Create document record
      const document = await storage.createDocument({
        title: processed.title,
        content: processed.content,
        sourceType,
        uploadedBy: userId,
        metadata: processed.metadata
      });
      
      // Add to vector store
      await vectorStore.addDocument(document.id, processed.content, processed.metadata);
      
      job.status = "completed";
      job.progress = 100;
      job.processedItems = 1;
      
      return jobId;
    } catch (error) {
      job.status = "failed";
      job.errors.push(error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  }

  async ingestMultipleFiles(files: any[], userId: number, sourceType = "upload"): Promise<string> {
    const jobId = this.generateJobId();
    
    const job: IngestionJob = {
      id: jobId,
      type: "upload",
      status: "processing",
      progress: 0,
      totalItems: files.length,
      processedItems: 0,
      errors: []
    };
    
    this.activeJobs.set(jobId, job);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          const processed = await documentProcessor.processDocument(file, sourceType);
          
          const document = await storage.createDocument({
            title: processed.title,
            content: processed.content,
            sourceType,
            uploadedBy: userId,
            metadata: processed.metadata
          });
          
          await vectorStore.addDocument(document.id, processed.content, processed.metadata);
          
          job.processedItems++;
          job.progress = Math.round((job.processedItems / job.totalItems) * 100);
        } catch (error) {
          job.errors.push(`File ${file.originalname || file.name}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      
      job.status = job.errors.length === 0 ? "completed" : "failed";
      return jobId;
    } catch (error) {
      job.status = "failed";
      job.errors.push(error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  }

  async syncGitHubRepository(repoUrl: string, accessToken?: string): Promise<string> {
    const jobId = this.generateJobId();
    
    const job: IngestionJob = {
      id: jobId,
      type: "github",
      status: "processing",
      progress: 0,
      totalItems: 0,
      processedItems: 0,
      errors: []
    };
    
    this.activeJobs.set(jobId, job);
    
    try {
      // This would integrate with GitHub API
      // For now, we'll simulate the process
      const repoName = this.extractRepoName(repoUrl);
      
      // Simulate fetching README and other documentation files
      const files = [
        { name: "README.md", content: `# ${repoName}\n\nMain repository documentation...` },
        { name: "CONTRIBUTING.md", content: "Contributing guidelines..." },
        { name: "docs/api.md", content: "API documentation..." }
      ];
      
      job.totalItems = files.length;
      
      for (const file of files) {
        const processed = documentProcessor.processGitHubContent(file.content, file.name, repoName);
        
        const document = await storage.createDocument({
          title: processed.title,
          content: processed.content,
          sourceType: "github",
          sourceUrl: `${repoUrl}/blob/main/${file.name}`,
          metadata: { ...processed.metadata, repository: repoName }
        });
        
        await vectorStore.addDocument(document.id, processed.content, processed.metadata);
        
        job.processedItems++;
        job.progress = Math.round((job.processedItems / job.totalItems) * 100);
      }
      
      job.status = "completed";
      return jobId;
    } catch (error) {
      job.status = "failed";
      job.errors.push(error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  }

  async syncConfluence(spaceKey: string, baseUrl: string, credentials: any): Promise<string> {
    const jobId = this.generateJobId();
    
    const job: IngestionJob = {
      id: jobId,
      type: "confluence",
      status: "processing",
      progress: 0,
      totalItems: 0,
      processedItems: 0,
      errors: []
    };
    
    this.activeJobs.set(jobId, job);
    
    try {
      // This would integrate with Confluence API
      // For now, simulate the process
      const pages = [
        { id: "123", title: "Database Connection Pooling Guide", body: { storage: { value: "<p>Guide content...</p>" } } },
        { id: "456", title: "API Rate Limiting Best Practices", body: { storage: { value: "<p>Best practices...</p>" } } }
      ];
      
      job.totalItems = pages.length;
      
      for (const page of pages) {
        const processed = documentProcessor.processConfluencePage(page);
        
        const document = await storage.createDocument({
          title: processed.title,
          content: processed.content,
          sourceType: "confluence",
          sourceUrl: `${baseUrl}/pages/viewpage.action?pageId=${page.id}`,
          metadata: processed.metadata
        });
        
        await vectorStore.addDocument(document.id, processed.content, processed.metadata);
        
        job.processedItems++;
        job.progress = Math.round((job.processedItems / job.totalItems) * 100);
      }
      
      job.status = "completed";
      return jobId;
    } catch (error) {
      job.status = "failed";
      job.errors.push(error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  }

  getJobStatus(jobId: string): IngestionJob | undefined {
    return this.activeJobs.get(jobId);
  }

  getAllJobs(): IngestionJob[] {
    return Array.from(this.activeJobs.values());
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractRepoName(repoUrl: string): string {
    if (!repoUrl || typeof repoUrl !== 'string') {
      return "unknown-repo";
    }
    const match = repoUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : "unknown-repo";
  }
}

export const ingestionService = new IngestionService();
