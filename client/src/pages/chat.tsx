import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import ChatInterface from "@/components/chat/ChatInterface";
import DocumentUploadModal from "@/components/modals/DocumentUploadModal";

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<number | undefined>();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleNewChat = () => {
    setSelectedConversationId(undefined);
  };

  const handleSelectConversation = (id: number) => {
    setSelectedConversationId(id);
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex h-screen pt-16">
        <Sidebar
          onNewChat={handleNewChat}
          onUploadClick={handleUploadClick}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
        />
        
        <ChatInterface
          conversationId={selectedConversationId}
          onUploadClick={handleUploadClick}
        />
        
        <RightPanel />
      </div>

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
