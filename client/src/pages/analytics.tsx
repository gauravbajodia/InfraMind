import { useQuery } from "@tanstack/react-query";
import { systemApi, documentsApi, chatApi } from "@/lib/api";
import Header from "@/components/layout/Header";
import { BarChart3, FileText, MessageSquare, Database, TrendingUp, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: string;
}

function MetricCard({ title, value, icon, description, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center text-xs text-green-600 mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { data: systemStatus } = useQuery({
    queryKey: ["/api/status"],
    queryFn: () => systemApi.getStatus(),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["/api/documents"],
    queryFn: () => documentsApi.getDocuments(),
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: () => chatApi.getConversations(),
  });

  // Calculate analytics data
  const totalDocuments = documents.length;
  const totalConversations = conversations.length;
  
  const sourceBreakdown = documents.reduce((acc: any, doc: any) => {
    acc[doc.sourceType] = (acc[doc.sourceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentDocuments = documents
    .sort((a: any, b: any) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5);

  const recentConversations = conversations
    .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())
    .slice(0, 5);

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
    };
    return colors[sourceType as keyof typeof colors] || "bg-gray-500 text-white";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Monitor system performance and usage statistics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Documents"
            value={totalDocuments}
            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            description="Indexed in knowledge base"
            trend="+12% from last month"
          />
          
          <MetricCard
            title="Conversations"
            value={totalConversations}
            icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
            description="Chat sessions"
            trend="+8% from last week"
          />
          
          <MetricCard
            title="Data Sources"
            value={Object.keys(sourceBreakdown).length}
            icon={<Database className="h-4 w-4 text-muted-foreground" />}
            description="Connected integrations"
          />
          
          <MetricCard
            title="System Status"
            value={systemStatus?.vectorDb === "healthy" ? "Healthy" : "Issues"}
            icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
            description="All systems operational"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Source Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Document Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(sourceBreakdown).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getSourceBadgeColor(source)}`}>
                        {source}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{count} documents</span>
                  </div>
                ))}
                {Object.keys(sourceBreakdown).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No documents yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Vector Database</span>
                  <Badge variant={systemStatus?.vectorDb === "healthy" ? "default" : "destructive"}>
                    {systemStatus?.vectorDb || "Unknown"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">OpenAI API</span>
                  <Badge variant={systemStatus?.openaiApi === "operational" ? "default" : "destructive"}>
                    {systemStatus?.openaiApi || "Unknown"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Document Processing</span>
                  <Badge variant="default">
                    Operational
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDocuments.length > 0 ? (
                  recentDocuments.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${getSourceBadgeColor(doc.sourceType)}`}>
                            {doc.sourceType}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(doc.createdAt!), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No documents yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Conversations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentConversations.length > 0 ? (
                  recentConversations.map((conv) => (
                    <div key={conv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{conv.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conv.updatedAt!), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No conversations yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}