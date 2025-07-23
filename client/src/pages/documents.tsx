import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { documentsApi } from "@/lib/api";
import Header from "@/components/layout/Header";
import { Search, Filter, Upload, FileText, ExternalLink, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DocumentUploadModal from "@/components/modals/DocumentUploadModal";
import { formatDistanceToNow } from "date-fns";

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["/api/documents", { sourceType: sourceFilter !== "all" ? sourceFilter : undefined }],
    queryFn: () => documentsApi.getDocuments(),
  });

  const filteredDocuments = documents.filter((doc: any) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSourceBadgeColor = (sourceType: string) => {
    const colors = {
      github: "bg-gray-900 text-white",
      confluence: "bg-blue-600 text-white",
      jira: "bg-blue-500 text-white",
      slack: "bg-purple-600 text-white",
      upload: "bg-green-600 text-white",
      mongodb: "bg-green-700 text-white",
      postgresql: "bg-blue-700 text-white",
      mysql: "bg-orange-600 text-white",
      elasticsearch: "bg-yellow-600 text-white",
      redis: "bg-red-600 text-white",
      snowflake: "bg-cyan-600 text-white",
    };
    return colors[sourceType as keyof typeof colors] || "bg-gray-500 text-white";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
              <p className="text-gray-600 mt-1">Manage and search your knowledge base</p>
            </div>
            <Button onClick={() => setIsUploadModalOpen(true)} className="bg-primary text-white">
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="confluence">Confluence</SelectItem>
                  <SelectItem value="jira">Jira</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="upload">Uploaded Files</SelectItem>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="p-8">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600">
                {searchQuery || sourceFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Upload documents or connect data sources to get started"
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredDocuments.map((document: any) => (
                <div key={document.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {document.title}
                        </h3>
                        <Badge className={`text-xs ${getSourceBadgeColor(document.sourceType)}`}>
                          {document.sourceType}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {document.content.substring(0, 200)}...
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {document.createdAt 
                            ? formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })
                            : "Unknown date"
                          }
                        </div>
                        {document.uploadedBy && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            User {document.uploadedBy}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex items-center gap-2">
                      {document.sourceUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={document.sourceUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}