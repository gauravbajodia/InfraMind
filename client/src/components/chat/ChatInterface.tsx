import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi, systemApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import type { ChatMessage, ChatQuery } from "@/types/chat";

interface ChatInterfaceProps {
  conversationId?: number;
  onUploadClick: () => void;
}

export default function ChatInterface({ conversationId, onUploadClick }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get system status for source count
  const { data: systemStatus } = useQuery({
    queryKey: ["/api/status"],
    queryFn: () => systemApi.getStatus(),
  });

  // Load messages for conversation
  const { data: conversationMessages } = useQuery({
    queryKey: ["/api/conversations", conversationId, "messages"],
    queryFn: () => conversationId ? chatApi.getMessages(conversationId) : Promise.resolve([]),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (conversationMessages) {
      setMessages(conversationMessages);
    } else if (!conversationId) {
      setMessages([]);
    }
  }, [conversationMessages, conversationId]);

  const sendMessageMutation = useMutation({
    mutationFn: async (query: ChatQuery) => {
      const response = await chatApi.sendQuery(query);
      return response;
    },
    onSuccess: (response, variables) => {
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now(),
        role: "user",
        content: variables.query,
        createdAt: new Date().toISOString(),
      };

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.answer,
        sources: response.sources,
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);
      setIsLoading(false);

      // Invalidate conversations to update sidebar
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error) => {
      console.error("Send message error:", error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: (title: string) => chatApi.createConversation(title),
    onSuccess: (newConversation, variables) => {
      // Send the first message with the new conversation ID
      const query: ChatQuery = {
        query: variables,
        conversationId: newConversation.id,
      };
      sendMessageMutation.mutate(query);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    setIsLoading(true);

    if (conversationId) {
      // Send to existing conversation
      const query: ChatQuery = {
        query: messageText,
        conversationId,
      };
      sendMessageMutation.mutate(query);
    } else {
      // Create new conversation with message as title (truncated)
      const title = messageText.length > 50 
        ? messageText.slice(0, 47) + "..."
        : messageText;
      createConversationMutation.mutate(title);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <main className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
            <p className="text-sm text-gray-500">
              Ask me about documentation, incidents, or code repositories
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
              Connected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-gray-400 hover:text-gray-600"
              onClick={handleClearChat}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onAttachFile={onUploadClick}
        isLoading={isLoading}
        sourceCount={systemStatus?.searchIndex.documentCount || 0}
      />
    </main>
  );
}
