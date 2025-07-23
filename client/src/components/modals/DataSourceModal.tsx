import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sourcesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Github, Database, FileText, MessageSquare, Search, BarChart, HardDrive, Snowflake } from "lucide-react";

interface DataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const dataSourceTypes = [
  { value: "github", label: "GitHub", icon: Github, description: "Connect your GitHub repositories" },
  { value: "confluence", label: "Confluence", icon: FileText, description: "Import Confluence documentation" },
  { value: "jira", label: "Jira", icon: BarChart, description: "Access Jira issues and projects" },
  { value: "slack", label: "Slack", icon: MessageSquare, description: "Index Slack conversations" },
  { value: "mongodb", label: "MongoDB", icon: Database, description: "Connect to MongoDB database" },
  { value: "postgresql", label: "PostgreSQL", icon: Database, description: "Connect to PostgreSQL database" },
  { value: "mysql", label: "MySQL", icon: Database, description: "Connect to MySQL database" },
  { value: "elasticsearch", label: "Elasticsearch", icon: Search, description: "Connect to Elasticsearch cluster" },
  { value: "redis", label: "Redis", icon: HardDrive, description: "Connect to Redis instance" },
  { value: "snowflake", label: "Snowflake", icon: Snowflake, description: "Connect to Snowflake data warehouse" },
];

export default function DataSourceModal({ isOpen, onClose }: DataSourceModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [sourceName, setSourceName] = useState<string>("");

  const addSourceMutation = useMutation({
    mutationFn: async (data: { name: string; type: string; config: Record<string, string> }) => {
      return sourcesApi.syncSource(data.type, { ...data.config, name: data.name });
    },
    onSuccess: () => {
      toast({
        title: "Data Source Added",
        description: "Your data source has been successfully connected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sources"] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect data source",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setSelectedType("");
    setFormData({});
    setSourceName("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !sourceName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    addSourceMutation.mutate({
      name: sourceName,
      type: selectedType,
      config: formData,
    });
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderConfigFields = () => {
    switch (selectedType) {
      case "github":
        return (
          <>
            <div>
              <Label htmlFor="repository-url">Repository URL</Label>
              <Input
                id="repository-url"
                placeholder="https://github.com/username/repository"
                value={formData.repositoryUrl || ""}
                onChange={(e) => updateFormData("repositoryUrl", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="access-token">GitHub Access Token</Label>
              <Input
                id="access-token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={formData.accessToken || ""}
                onChange={(e) => updateFormData("accessToken", e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Generate a personal access token in GitHub Settings → Developer settings → Personal access tokens
              </p>
            </div>
          </>
        );

      case "confluence":
        return (
          <>
            <div>
              <Label htmlFor="base-url">Confluence Base URL</Label>
              <Input
                id="base-url"
                placeholder="https://yourcompany.atlassian.net"
                value={formData.baseUrl || ""}
                onChange={(e) => updateFormData("baseUrl", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="your.email@company.com"
                value={formData.username || ""}
                onChange={(e) => updateFormData("username", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="api-token">API Token</Label>
              <Input
                id="api-token"
                type="password"
                placeholder="ATATT3xFfGF0T4..."
                value={formData.apiToken || ""}
                onChange={(e) => updateFormData("apiToken", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="space-key">Space Key (optional)</Label>
              <Input
                id="space-key"
                placeholder="PROJ"
                value={formData.spaceKey || ""}
                onChange={(e) => updateFormData("spaceKey", e.target.value)}
              />
            </div>
          </>
        );

      case "jira":
        return (
          <>
            <div>
              <Label htmlFor="jira-url">Jira URL</Label>
              <Input
                id="jira-url"
                placeholder="https://yourcompany.atlassian.net"
                value={formData.baseUrl || ""}
                onChange={(e) => updateFormData("baseUrl", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="jira-username">Username</Label>
              <Input
                id="jira-username"
                placeholder="your.email@company.com"
                value={formData.username || ""}
                onChange={(e) => updateFormData("username", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="jira-token">API Token</Label>
              <Input
                id="jira-token"
                type="password"
                placeholder="ATATT3xFfGF0T4..."
                value={formData.apiToken || ""}
                onChange={(e) => updateFormData("apiToken", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="project-key">Project Key (optional)</Label>
              <Input
                id="project-key"
                placeholder="PROJ"
                value={formData.projectKey || ""}
                onChange={(e) => updateFormData("projectKey", e.target.value)}
              />
            </div>
          </>
        );

      case "slack":
        return (
          <>
            <div>
              <Label htmlFor="bot-token">Bot User OAuth Token</Label>
              <Input
                id="bot-token"
                type="password"
                placeholder="xoxb-..."
                value={formData.botToken || ""}
                onChange={(e) => updateFormData("botToken", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="channels">Channels (comma-separated)</Label>
              <Input
                id="channels"
                placeholder="general,engineering,support"
                value={formData.channels || ""}
                onChange={(e) => updateFormData("channels", e.target.value)}
              />
            </div>
          </>
        );

      case "mongodb":
        return (
          <>
            <div>
              <Label htmlFor="connection-string">Connection String</Label>
              <Input
                id="connection-string"
                type="password"
                placeholder="mongodb://username:password@host:port/database"
                value={formData.connectionString || ""}
                onChange={(e) => updateFormData("connectionString", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="database">Database</Label>
              <Input
                id="database"
                placeholder="mydatabase"
                value={formData.database || ""}
                onChange={(e) => updateFormData("database", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="collections">Collections (comma-separated)</Label>
              <Input
                id="collections"
                placeholder="users,orders,products"
                value={formData.collections || ""}
                onChange={(e) => updateFormData("collections", e.target.value)}
              />
            </div>
          </>
        );

      case "postgresql":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  placeholder="localhost"
                  value={formData.host || ""}
                  onChange={(e) => updateFormData("host", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  placeholder="5432"
                  value={formData.port || ""}
                  onChange={(e) => updateFormData("port", e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="pg-database">Database</Label>
              <Input
                id="pg-database"
                placeholder="mydb"
                value={formData.database || ""}
                onChange={(e) => updateFormData("database", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="pg-username">Username</Label>
              <Input
                id="pg-username"
                placeholder="postgres"
                value={formData.username || ""}
                onChange={(e) => updateFormData("username", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="pg-password">Password</Label>
              <Input
                id="pg-password"
                type="password"
                placeholder="password"
                value={formData.password || ""}
                onChange={(e) => updateFormData("password", e.target.value)}
                required
              />
            </div>
          </>
        );

      case "mysql":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mysql-host">Host</Label>
                <Input
                  id="mysql-host"
                  placeholder="localhost"
                  value={formData.host || ""}
                  onChange={(e) => updateFormData("host", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mysql-port">Port</Label>
                <Input
                  id="mysql-port"
                  placeholder="3306"
                  value={formData.port || ""}
                  onChange={(e) => updateFormData("port", e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="mysql-database">Database</Label>
              <Input
                id="mysql-database"
                placeholder="mydb"
                value={formData.database || ""}
                onChange={(e) => updateFormData("database", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="mysql-username">Username</Label>
              <Input
                id="mysql-username"
                placeholder="root"
                value={formData.username || ""}
                onChange={(e) => updateFormData("username", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="mysql-password">Password</Label>
              <Input
                id="mysql-password"
                type="password"
                placeholder="password"
                value={formData.password || ""}
                onChange={(e) => updateFormData("password", e.target.value)}
                required
              />
            </div>
          </>
        );

      case "elasticsearch":
        return (
          <>
            <div>
              <Label htmlFor="es-url">Elasticsearch URL</Label>
              <Input
                id="es-url"
                placeholder="https://localhost:9200"
                value={formData.url || ""}
                onChange={(e) => updateFormData("url", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="es-username">Username (optional)</Label>
              <Input
                id="es-username"
                placeholder="elastic"
                value={formData.username || ""}
                onChange={(e) => updateFormData("username", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="es-password">Password (optional)</Label>
              <Input
                id="es-password"
                type="password"
                placeholder="password"
                value={formData.password || ""}
                onChange={(e) => updateFormData("password", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="indices">Indices (comma-separated)</Label>
              <Input
                id="indices"
                placeholder="logs-*,metrics-*"
                value={formData.indices || ""}
                onChange={(e) => updateFormData("indices", e.target.value)}
              />
            </div>
          </>
        );

      case "redis":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="redis-host">Host</Label>
                <Input
                  id="redis-host"
                  placeholder="localhost"
                  value={formData.host || ""}
                  onChange={(e) => updateFormData("host", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="redis-port">Port</Label>
                <Input
                  id="redis-port"
                  placeholder="6379"
                  value={formData.port || ""}
                  onChange={(e) => updateFormData("port", e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="redis-password">Password (optional)</Label>
              <Input
                id="redis-password"
                type="password"
                placeholder="password"
                value={formData.password || ""}
                onChange={(e) => updateFormData("password", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="redis-db">Database Number</Label>
              <Input
                id="redis-db"
                placeholder="0"
                value={formData.database || ""}
                onChange={(e) => updateFormData("database", e.target.value)}
              />
            </div>
          </>
        );

      case "snowflake":
        return (
          <>
            <div>
              <Label htmlFor="account">Account</Label>
              <Input
                id="account"
                placeholder="your-account.snowflakecomputing.com"
                value={formData.account || ""}
                onChange={(e) => updateFormData("account", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="sf-username">Username</Label>
              <Input
                id="sf-username"
                placeholder="username"
                value={formData.username || ""}
                onChange={(e) => updateFormData("username", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="sf-password">Password</Label>
              <Input
                id="sf-password"
                type="password"
                placeholder="password"
                value={formData.password || ""}
                onChange={(e) => updateFormData("password", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="warehouse">Warehouse</Label>
              <Input
                id="warehouse"
                placeholder="COMPUTE_WH"
                value={formData.warehouse || ""}
                onChange={(e) => updateFormData("warehouse", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="sf-database">Database</Label>
              <Input
                id="sf-database"
                placeholder="MYDB"
                value={formData.database || ""}
                onChange={(e) => updateFormData("database", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="schema">Schema</Label>
              <Input
                id="schema"
                placeholder="PUBLIC"
                value={formData.schema || ""}
                onChange={(e) => updateFormData("schema", e.target.value)}
                required
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Data Source</DialogTitle>
          <DialogDescription>
            Connect a new data source to your knowledge base. Your credentials are securely stored and encrypted.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="source-name">Source Name</Label>
            <Input
              id="source-name"
              placeholder="Give this data source a name"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="source-type">Data Source Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a data source type" />
              </SelectTrigger>
              <SelectContent>
                {dataSourceTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedType && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuration</h3>
              {renderConfigFields()}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedType || !sourceName || addSourceMutation.isPending}
            >
              {addSourceMutation.isPending ? "Connecting..." : "Add Data Source"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}