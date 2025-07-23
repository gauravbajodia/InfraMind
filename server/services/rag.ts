import { storage } from "../storage";
import { openaiService, ChatMessage } from "./openai";
import { vectorStore, VectorSearchResult } from "./vectorStore";
import { Query, Document } from "@shared/schema";

export interface RAGResponse {
  answer: string;
  sources: Array<{
    title: string;
    url?: string;
    type: string;
    relevance: number;
    snippet: string;
  }>;
  confidence: number;
}

export class RAGService {
  async generateResponse(query: Query): Promise<RAGResponse> {
    try {
      // 1. Analyze the query
      const queryAnalysis = await openaiService.analyzeQuery(query.query);
      
      // 2. Search for relevant documents
      const searchResults = await this.searchRelevantDocuments(query);
      
      // 3. Build context from search results
      const context = await this.buildContext(searchResults);
      
      // 4. Generate response using OpenAI
      const messages = this.buildChatMessages(query.query, context, queryAnalysis);
      const response = await openaiService.generateResponse(messages);
      
      // 5. Extract sources and format response
      const sources = await this.formatSources(searchResults);
      
      return {
        answer: response.content,
        sources,
        confidence: this.calculateConfidence(searchResults, queryAnalysis)
      };
    } catch (error) {
      console.error("RAG generation error:", error);
      throw new Error("Failed to generate response");
    }
  }

  async streamResponse(query: Query): Promise<AsyncIterable<{ type: "content" | "sources", data: any }>> {
    const searchResults = await this.searchRelevantDocuments(query);
    const context = await this.buildContext(searchResults);
    const queryAnalysis = await openaiService.analyzeQuery(query.query);
    
    const messages = this.buildChatMessages(query.query, context, queryAnalysis);
    const sources = await this.formatSources(searchResults);
    
    return this.processStreamWithSources(
      await openaiService.streamResponse(messages),
      sources
    );
  }

  private async searchRelevantDocuments(query: Query): Promise<VectorSearchResult[]> {
    // First, try vector search
    const vectorResults = await vectorStore.searchSimilar(query.query, 10);
    
    // Filter by user preferences if provided
    if (query.filters) {
      // Apply date range filter
      if (query.filters.dateRange) {
        // This would filter based on document creation dates
        // Implementation depends on how dates are stored in metadata
      }
      
      // Apply source type filter
      if (query.filters.sourceTypes?.length) {
        // This would filter based on document source types
        // Implementation depends on how this is tracked in metadata
      }
    }
    
    return vectorResults.filter(result => result.similarity > 0.7); // Only high-confidence matches
  }

  private async buildContext(searchResults: VectorSearchResult[]): Promise<string> {
    if (searchResults.length === 0) {
      return "No relevant documentation found.";
    }
    
    let context = "Relevant documentation and information:\n\n";
    
    for (const result of searchResults.slice(0, 5)) { // Limit context size
      const document = await storage.getDocument(result.documentId);
      if (document) {
        context += `Source: ${document.title} (${document.sourceType})\n`;
        context += `Content: ${result.content}\n`;
        if (document.sourceUrl) {
          context += `URL: ${document.sourceUrl}\n`;
        }
        context += `Relevance: ${(result.similarity * 100).toFixed(1)}%\n\n`;
      }
    }
    
    return context;
  }

  private buildChatMessages(query: string, context: string, analysis: any): ChatMessage[] {
    const systemPrompt = `You are InfraMind, an AI assistant for engineering teams. You help developers find documentation, analyze past incidents, and provide technical guidance.

Your knowledge base includes:
- Internal documentation and runbooks
- Past incident reports and solutions  
- Code repositories and issues
- Confluence pages and Jira tickets
- Slack conversations and discussions

Guidelines:
1. Always base your answers on the provided context
2. Be specific and actionable in your responses
3. Include relevant code examples or commands when helpful
4. Mention the sources you're referencing
5. If you don't have enough information, say so clearly
6. For incident-related queries, focus on past solutions and prevention
7. For documentation queries, provide clear steps and procedures

Context from knowledge base:
${context}

Query analysis:
- Intent: ${analysis.intent}
- Key entities: ${analysis.entities.join(", ")}
- Confidence: ${(analysis.confidence * 100).toFixed(1)}%`;

    return [
      { role: "system", content: systemPrompt },
      { role: "user", content: query }
    ];
  }

  private async formatSources(searchResults: VectorSearchResult[]): Promise<Array<{
    title: string;
    url?: string;
    type: string;
    relevance: number;
    snippet: string;
  }>> {
    const sources = [];
    
    for (const result of searchResults.slice(0, 5)) {
      const document = await storage.getDocument(result.documentId);
      if (document) {
        sources.push({
          title: document.title,
          url: document.sourceUrl || undefined,
          type: document.sourceType,
          relevance: result.similarity,
          snippet: result.content.slice(0, 200) + (result.content.length > 200 ? "..." : "")
        });
      }
    }
    
    return sources;
  }

  private calculateConfidence(searchResults: VectorSearchResult[], analysis: any): number {
    if (searchResults.length === 0) return 0.1;
    
    const avgSimilarity = searchResults.reduce((sum, result) => sum + result.similarity, 0) / searchResults.length;
    const analysisConfidence = analysis.confidence || 0.5;
    
    // Combine search confidence with query analysis confidence
    return Math.min(0.95, (avgSimilarity * 0.7) + (analysisConfidence * 0.3));
  }

  private async* processStreamWithSources(
    contentStream: AsyncIterable<string>,
    sources: any[]
  ): AsyncIterable<{ type: "content" | "sources", data: any }> {
    // First yield sources
    yield { type: "sources", data: sources };
    
    // Then stream content
    for await (const chunk of contentStream) {
      yield { type: "content", data: chunk };
    }
  }
}

export const ragService = new RAGService();
