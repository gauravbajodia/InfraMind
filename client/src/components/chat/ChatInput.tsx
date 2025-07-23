import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onAttachFile: () => void;
  isLoading?: boolean;
  sourceCount?: number;
}

export default function ChatInput({ 
  onSendMessage, 
  onAttachFile, 
  isLoading, 
  sourceCount = 0 
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (value: string) => {
    setMessage(value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  };

  return (
    <div className="p-6 border-t border-gray-200 bg-white">
      <div className="flex items-end space-x-4">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            placeholder="Ask me about documentation, past incidents, or technical issues..."
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent resize-none min-h-[3rem]"
            disabled={isLoading}
          />
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Press Ctrl+Enter to send</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{sourceCount.toLocaleString()} sources</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-400 hover:text-gray-600"
                onClick={onAttachFile}
                disabled={isLoading}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
