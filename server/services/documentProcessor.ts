import { Document } from "@shared/schema";

export interface ProcessedDocument {
  title: string;
  content: string;
  metadata: {
    fileType: string;
    size: number;
    author?: string;
    tags?: string[];
    [key: string]: any;
  };
}

export class DocumentProcessor {
  async processDocument(file: any, sourceType: string, additionalMetadata?: any): Promise<ProcessedDocument> {
    const fileExtension = this.getFileExtension(file.originalname || file.name || "");
    
    switch (fileExtension.toLowerCase()) {
      case "md":
      case "markdown":
        return this.processMarkdown(file, additionalMetadata);
      case "txt":
        return this.processText(file, additionalMetadata);
      case "json":
        return this.processJSON(file, additionalMetadata);
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  }

  private async processMarkdown(file: any, metadata?: any): Promise<ProcessedDocument> {
    const content = file.buffer ? file.buffer.toString('utf-8') : file.content;
    
    // Extract title from first heading or filename
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : this.getFilenameWithoutExt(file.originalname || file.name || "document");
    
    return {
      title,
      content: this.cleanMarkdown(content),
      metadata: {
        fileType: "markdown",
        size: content.length,
        ...metadata
      }
    };
  }

  private async processText(file: any, metadata?: any): Promise<ProcessedDocument> {
    const content = file.buffer ? file.buffer.toString('utf-8') : file.content;
    const title = this.getFilenameWithoutExt(file.originalname || file.name || "document");
    
    return {
      title,
      content,
      metadata: {
        fileType: "text",
        size: content.length,
        ...metadata
      }
    };
  }

  private async processJSON(file: any, metadata?: any): Promise<ProcessedDocument> {
    const content = file.buffer ? file.buffer.toString('utf-8') : file.content;
    const jsonData = JSON.parse(content);
    
    // Handle different JSON structures (Jira exports, etc.)
    let processedContent: string;
    let title: string;
    
    if (jsonData.key && jsonData.fields) {
      // Jira issue format
      title = `${jsonData.key}: ${jsonData.fields.summary || "Jira Issue"}`;
      processedContent = this.processJiraIssue(jsonData);
    } else if (jsonData.issues && Array.isArray(jsonData.issues)) {
      // Jira export with multiple issues
      title = "Jira Issues Export";
      processedContent = jsonData.issues.map((issue: any) => this.processJiraIssue(issue)).join("\n\n");
    } else {
      // Generic JSON
      title = this.getFilenameWithoutExt(file.originalname || file.name || "json-document");
      processedContent = JSON.stringify(jsonData, null, 2);
    }
    
    return {
      title,
      content: processedContent,
      metadata: {
        fileType: "json",
        size: content.length,
        originalStructure: Array.isArray(jsonData) ? "array" : "object",
        ...metadata
      }
    };
  }

  private processJiraIssue(issue: any): string {
    const fields = issue.fields || {};
    let content = `Issue: ${issue.key}\n`;
    content += `Summary: ${fields.summary || "N/A"}\n`;
    content += `Status: ${fields.status?.name || "N/A"}\n`;
    content += `Priority: ${fields.priority?.name || "N/A"}\n`;
    content += `Issue Type: ${fields.issuetype?.name || "N/A"}\n`;
    
    if (fields.description) {
      content += `\nDescription:\n${fields.description}\n`;
    }
    
    if (fields.resolution) {
      content += `\nResolution: ${fields.resolution.name}\n`;
      if (fields.resolution.description) {
        content += `Resolution Description: ${fields.resolution.description}\n`;
      }
    }
    
    if (issue.changelog?.histories) {
      content += `\nHistory:\n`;
      issue.changelog.histories.forEach((history: any) => {
        content += `- ${history.created}: ${history.items?.map((item: any) => 
          `${item.field} changed from "${item.fromString}" to "${item.toString}"`
        ).join(", ")}\n`;
      });
    }
    
    return content;
  }

  private cleanMarkdown(content: string): string {
    // Remove markdown syntax for better text processing
    return content
      .replace(/^#{1,6}\s+/gm, "") // Remove headers
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italic
      .replace(/`{1,3}(.*?)`{1,3}/g, "$1") // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links, keep text
      .replace(/^\s*[-*+]\s+/gm, "") // Remove list markers
      .replace(/^\s*\d+\.\s+/gm, "") // Remove numbered list markers
      .trim();
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf(".");
    return lastDot > 0 ? filename.substring(lastDot + 1) : "";
  }

  private getFilenameWithoutExt(filename: string): string {
    const lastDot = filename.lastIndexOf(".");
    return lastDot > 0 ? filename.substring(0, lastDot) : filename;
  }

  // Process GitHub README content
  processGitHubContent(content: string, filename: string, repoName: string): ProcessedDocument {
    return {
      title: `${repoName}/${filename}`,
      content: this.cleanMarkdown(content),
      metadata: {
        fileType: "github",
        repository: repoName,
        filename,
        size: content.length
      }
    };
  }

  // Process Confluence page
  processConfluencePage(page: any): ProcessedDocument {
    return {
      title: page.title,
      content: this.stripHTML(page.body?.storage?.value || page.body?.view?.value || ""),
      metadata: {
        fileType: "confluence",
        pageId: page.id,
        spaceKey: page.space?.key,
        author: page.version?.by?.displayName,
        lastModified: page.version?.when,
        size: (page.body?.storage?.value || "").length
      }
    };
  }

  private stripHTML(html: string): string {
    return html
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
      .replace(/&amp;/g, "&") // Replace HTML entities
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }
}

export const documentProcessor = new DocumentProcessor();
