import { storage } from "../storage";
import { openaiService } from "./openai";

export interface VectorSearchResult {
  documentId: number;
  chunkIndex: number;
  content: string;
  similarity: number;
  metadata?: any;
}

export class VectorStore {
  async addDocument(documentId: number, content: string, metadata?: any): Promise<void> {
    // Split content into chunks
    const chunks = this.chunkText(content);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        // Generate embedding for chunk
        const embedding = await openaiService.generateEmbedding(chunk);
        
        // Store embedding
        await storage.createVectorEmbedding({
          documentId,
          chunkIndex: i,
          chunkContent: chunk,
          embedding: JSON.stringify(embedding),
          metadata: { ...metadata, chunkIndex: i, totalChunks: chunks.length }
        });
      } catch (error) {
        console.error(`Failed to process chunk ${i} for document ${documentId}:`, error);
      }
    }
  }

  async searchSimilar(query: string, limit = 5): Promise<VectorSearchResult[]> {
    try {
      // Generate embedding for query
      const queryEmbedding = await openaiService.generateEmbedding(query);
      
      // Search for similar embeddings
      const similarEmbeddings = await storage.searchSimilarEmbeddings(queryEmbedding, limit);
      
      // Convert to search results
      return similarEmbeddings.map(embedding => {
        const storedEmbedding = JSON.parse(embedding.embedding);
        const similarity = this.cosineSimilarity(queryEmbedding, storedEmbedding);
        
        return {
          documentId: embedding.documentId!,
          chunkIndex: embedding.chunkIndex!,
          content: embedding.chunkContent!,
          similarity,
          metadata: embedding.metadata
        };
      });
    } catch (error) {
      console.error("Vector search error:", error);
      return [];
    }
  }

  private chunkText(text: string, maxChunkSize = 1000, overlap = 200): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = "";
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      
      if (currentChunk.length + trimmedSentence.length + 1 <= maxChunkSize) {
        currentChunk += (currentChunk ? ". " : "") + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + ".");
        }
        
        // Handle overlap
        if (chunks.length > 0 && overlap > 0) {
          const words = currentChunk.split(" ");
          const overlapWords = words.slice(-Math.floor(overlap / 10));
          currentChunk = overlapWords.join(" ") + ". " + trimmedSentence;
        } else {
          currentChunk = trimmedSentence;
        }
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk + ".");
    }
    
    return chunks;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

export const vectorStore = new VectorStore();
