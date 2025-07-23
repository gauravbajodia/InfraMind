import { useQuery } from "@tanstack/react-query";
import { sourcesApi, systemApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SiGithub, SiConfluence, SiJira, SiSlack, SiMongodb, SiPostgresql, SiMysql, SiElasticsearch, SiRedis, SiSnowflake } from "react-icons/si";
import { Database } from "lucide-react";

const sourceIcons = {
  github: SiGithub,
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

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
    case "healthy":
    case "operational":
      return "bg-green-500";
    case "warning":
    case "syncing":
      return "bg-yellow-500";
    case "error":
    case "failed":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export default function RightPanel() {
  const { data: dataSources = [] } = useQuery({
    queryKey: ["/api/sources"],
    queryFn: () => sourcesApi.getDataSources(),
  });

  const { data: systemStatus } = useQuery({
    queryKey: ["/api/status"],
    queryFn: () => systemApi.getStatus(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <aside className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
      {/* Connected Data Sources */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Connected Sources</h3>
        <div className="space-y-3">
          {dataSources.length === 0 ? (
            <div className="text-center py-4">
              <Database className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500 mb-1">No sources connected</p>
              <p className="text-xs text-gray-400">Connect sources in Documents tab</p>
            </div>
          ) : (
            dataSources
              .filter(source => source.status !== 'inactive')
              .map((source) => {
                const IconComponent = sourceIcons[source.type as keyof typeof sourceIcons] || Database;
                return (
                  <div key={source.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                      <span className="text-sm font-medium">{source.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(source.status)}`}></div>
                      <span className="text-xs text-gray-500">
                        {source.lastSync 
                          ? formatDistanceToNow(new Date(source.lastSync), { addSuffix: true })
                          : "Never"
                        }
                      </span>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-gray-900">New incident report ingested</p>
              <p className="text-xs text-gray-500">Database outage - 15 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-gray-900">Documentation updated</p>
              <p className="text-xs text-gray-500">API rate limiting guide - 1 hour ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-gray-900">New repository indexed</p>
              <p className="text-xs text-gray-500">auth-service - 2 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Filters */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Search Filters</h3>
        <div className="space-y-3">
          <div>
            <Label className="block text-xs font-medium text-gray-700 mb-1">Date Range</Label>
            <Select defaultValue="all">
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="week">Last week</SelectItem>
                <SelectItem value="month">Last month</SelectItem>
                <SelectItem value="quarter">Last quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-xs font-medium text-gray-700 mb-1">Source Type</Label>
            <div className="space-y-1">
              {[
                { id: "docs", label: "Documentation", checked: true },
                { id: "incidents", label: "Incidents", checked: true },
                { id: "code", label: "Code", checked: true },
                { id: "discussions", label: "Discussions", checked: false },
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox id={item.id} defaultChecked={item.checked} />
                  <Label htmlFor={item.id} className="text-sm text-gray-700">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label className="block text-xs font-medium text-gray-700 mb-1">Teams</Label>
            <Select defaultValue="all">
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All teams</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
                <SelectItem value="qa">QA</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="flex-1 p-4 bg-white">
        <h3 className="text-sm font-medium text-gray-900 mb-3">System Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Vector DB</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus?.vectorDb || "unknown")}`}></div>
              <span className="text-gray-500">
                {systemStatus?.vectorDb === "healthy" ? "Healthy" : "Unknown"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">OpenAI API</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus?.openaiApi || "unknown")}`}></div>
              <span className="text-gray-500">
                {systemStatus?.openaiApi === "operational" ? "Operational" : "Unknown"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Search Index</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus?.searchIndex.status || "unknown")}`}></div>
              <span className="text-gray-500">
                {systemStatus?.searchIndex.documentCount 
                  ? `${systemStatus.searchIndex.documentCount.toLocaleString()} docs`
                  : "0 docs"
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
