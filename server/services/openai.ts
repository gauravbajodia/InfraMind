import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "enter your openai api key here"
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIService {
  async generateResponse(messages: ChatMessage[]): Promise<ChatResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      return {
        content: response.choices[0].message.content || "",
        usage: response.usage ? {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate response from OpenAI");
    }
  }

  async streamResponse(messages: ChatMessage[]): Promise<AsyncIterable<string>> {
    try {
      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      });

      return this.processStream(stream);
    } catch (error) {
      console.error("OpenAI streaming error:", error);
      throw new Error("Failed to stream response from OpenAI");
    }
  }

  private async* processStream(stream: any): AsyncIterable<string> {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error("OpenAI embedding error:", error);
      throw new Error("Failed to generate embedding");
    }
  }

  async analyzeQuery(query: string): Promise<{
    intent: string;
    entities: string[];
    confidence: number;
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a query analyzer for an engineering documentation system. Analyze the user's query and extract:
            1. Intent: What is the user trying to do? (search_docs, find_incident, get_code, troubleshoot, etc.)
            2. Entities: Important technical terms, service names, error types, etc.
            3. Confidence: How confident are you in this analysis (0-1)
            
            Respond with JSON in this format: { "intent": "string", "entities": ["string"], "confidence": number }`
          },
          {
            role: "user",
            content: query
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Query analysis error:", error);
      return {
        intent: "search_docs",
        entities: [],
        confidence: 0.5
      };
    }
  }
}

export const openaiService = new OpenAIService();
