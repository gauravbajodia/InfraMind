import { Plus, Upload, RefreshCw, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import type { Conversation } from "@/types/chat";

interface SidebarProps {
  onNewChat: () => void;
  onUploadClick: () => void;
  selectedConversationId?: number;
  onSelectConversation: (id: number) => void;
}

export default function Sidebar({ 
  onNewChat, 
  onUploadClick, 
  selectedConversationId, 
  onSelectConversation 
}: SidebarProps) {
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: () => chatApi.getConversations(),
  });

  return (
    <aside className="w-80 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-900">Recent Conversations</h2>
          <Button variant="ghost" size="sm" className="p-1" onClick={onNewChat}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <Button 
          onClick={onNewChat}
          className="w-full bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conversation: Conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`p-3 rounded-lg cursor-pointer border transition-all ${
                  selectedConversationId === conversation.id
                    ? "bg-blue-50 border-blue-200"
                    : "hover:bg-gray-50 border-transparent hover:border-gray-200"
                }`}
              >
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {conversation.title}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Quick Actions
        </h3>
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            onClick={onUploadClick}
          >
            <Upload className="mr-3 h-4 w-4 text-gray-400" />
            Upload Documents
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            <RefreshCw className="mr-3 h-4 w-4 text-gray-400" />
            Sync Data Sources
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            <BarChart3 className="mr-3 h-4 w-4 text-gray-400" />
            View Analytics
          </Button>
        </div>
      </div>
    </aside>
  );
}
