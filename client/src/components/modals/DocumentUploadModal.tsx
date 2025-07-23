import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, CloudUpload, FileText, Github, FileCode, MessageSquare, Upload, Database, Plus, RefreshCw } from "lucide-react";
import { SiConfluence, SiJira, SiSlack, SiMongodb, SiPostgresql, SiMysql, SiElasticsearch, SiRedis, SiSnowflake } from "react-icons/si";
import { documentsApi, sourcesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataSourceModal from "./DataSourceModal";
import { formatDistanceToNow } from "date-fns";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sourceIcons = {
  github: Github,
  confluence: SiConfluence,
  jira: SiJira,
  slack: SiSlack,
  mongodb: SiMongodb,
  postgresql: SiPostgresql,
  mysql: SiMysql,
  elasticsearch: SiElasticsearch,
  redis: SiRedis,
  snowflake: SiSnowflake,
};

export default function DocumentUploadModal({ isOpen, onClose }: DocumentUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isDataSourceModalOpen, setIsDataSourceModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch configured data sources
  const { data: dataSources = [], isLoading: isLoadingDataSources } = useQuery({
    queryKey: ["/api/sources"],
    queryFn: () => sourcesApi.getDataSources(),
    enabled: isOpen,
  });

  const uploadMutation = useMutation({
    mutationFn: (files: FileList) => documentsApi.uploadFiles(files),
    onSuccess: (data) => {
      toast({
        title: "Upload Started",
        description: `Files are being processed. Job ID: ${data.jobId}`,
      });
      setSelectedFiles(null);
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/status"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const syncMutation = useMutation({
    mutationFn: ({ type, config }: { type: string; config: any }) => 
      sourcesApi.syncSource(type, config),
    onSuccess: (data) => {
      toast({
        title: "Sync Started",
        description: `Data source sync initiated. Job ID: ${data.jobId}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sources"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync data source",
        variant: "destructive",
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = () => {
    if (selectedFiles) {
      uploadMutation.mutate(selectedFiles);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleSourceSync = (sourceId: number) => {
    const source = dataSources.find(s => s.id === sourceId);
    if (source) {
      syncMutation.mutate({ type: source.type, config: {} });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Documents & Connect Data Sources</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
              <TabsTrigger value="sources">Data Sources</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6 mt-6">
              {/* File Upload */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-gray-400"
                } ${uploadMutation.isPending ? "opacity-50" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Upload your documents</h4>
                <p className="text-gray-600 mb-4">Drag and drop files here, or click to browse</p>
                <p className="text-sm text-gray-500 mb-4">Supports: PDF, Markdown, TXT, JSON</p>
                
                <Button onClick={handleBrowseClick} disabled={uploadMutation.isPending}>
                  Choose Files
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.md,.txt,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Selected Files */}
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Selected Files:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {Array.from(selectedFiles).map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4" />
                        <span className="flex-1 truncate">{file.name}</span>
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {uploadMutation.isPending && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-gray-500 text-center">Uploading files...</p>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleUpload} 
                    disabled={uploadMutation.isPending}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadMutation.isPending ? "Uploading..." : "Upload Files"}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sources" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Connected Data Sources</h3>
                  <p className="text-sm text-gray-600">Manage your external data connections</p>
                </div>
                <Button onClick={() => setIsDataSourceModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Data Source
                </Button>
              </div>

              {isLoadingDataSources ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : dataSources.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No data sources connected</h3>
                  <p className="text-gray-600 mb-4">Connect your first data source to start indexing content</p>
                  <Button onClick={() => setIsDataSourceModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Data Source
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {dataSources.map((source: any) => {
                    const IconComponent = sourceIcons[source.type as keyof typeof sourceIcons] || Database;
                    return (
                      <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          {IconComponent && <IconComponent className="h-6 w-6" />}
                          <div>
                            <h4 className="font-medium">{source.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(source.status)}`}></div>
                              <span className="text-sm text-gray-500">
                                {source.status} • Last sync: {
                                  source.lastSync 
                                    ? formatDistanceToNow(new Date(source.lastSync), { addSuffix: true })
                                    : "Never"
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSourceSync(source.id)}
                            disabled={syncMutation.isPending}
                          >
                            {syncMutation.isPending ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Sync
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <DataSourceModal
        isOpen={isDataSourceModalOpen}
        onClose={() => setIsDataSourceModalOpen(false)}
      />
    </>
  );
}