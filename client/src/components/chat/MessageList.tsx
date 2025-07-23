import { Bot, User } from "lucide-react";
import { SiGithub, SiConfluence, SiJira, SiSlack } from "react-icons/si";
import { formatDistanceToNow } from "date-fns";
import type { ChatMessage, Source } from "@/types/chat";

const sourceIcons = {
  github: SiGithub,
  confluence: SiConfluence, 
  jira: SiJira,
  slack: SiSlack,
  upload: () => <span className="text-sm">📄</span>,
};

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

function SourceLink({ source }: { source: Source }) {
  const IconComponent = sourceIcons[source.type as keyof typeof sourceIcons] || sourceIcons.upload;
  
  return (
    <div className="flex items-center space-x-2 text-sm">
      <IconComponent className="h-4 w-4" />
      <a 
        href={source.url || "#"} 
        className="text-blue-600 hover:underline truncate"
        target="_blank"
        rel="noopener noreferrer"
      >
        {source.title}
      </a>
      <span className="text-gray-400">• {source.type}</span>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  
  return (
    <div className={`flex items-start space-x-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      
      <div className={`flex-1 ${isUser ? "max-w-3xl" : ""}`}>
        <div className={`rounded-lg p-4 ${
          isUser 
            ? "bg-primary text-white ml-12" 
            : "bg-gray-50 text-gray-900"
        }`}>
          <div className="whitespace-pre-wrap">{message.content}</div>
          
          {/* Sources Section */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Sources:</h4>
              <div className="space-y-2">
                {message.sources.map((source, index) => (
                  <SourceLink key={index} source={source} />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? "text-right" : ""}`}>
          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-gray-600" />
        </div>
      )}
    </div>
  );
}

function WelcomeMessage() {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-900 mb-3">
            👋 Welcome to InfraMind! I'm your AI assistant for engineering documentation and incident management.
          </p>
          <p className="text-gray-700 text-sm">I can help you with:</p>
          <ul className="text-sm text-gray-600 mt-2 space-y-1">
            <li>• Finding documentation and runbooks</li>
            <li>• Searching past incidents and solutions</li>
            <li>• Analyzing code repositories and issues</li>
            <li>• Retrieving Confluence and Jira information</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function LoadingMessage() {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="text-gray-600 text-sm">Searching knowledge base...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.length === 0 && <WelcomeMessage />}
      
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {isLoading && <LoadingMessage />}
    </div>
  );
}
