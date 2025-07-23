import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sourcesApi } from "@/lib/api";
import Header from "@/components/layout/Header";
import { Settings, Database, Key, Shield, Bell, User, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  const { data: dataSources = [] } = useQuery({
    queryKey: ["/api/sources"],
    queryFn: () => sourcesApi.getDataSources(),
  });

  const syncMutation = useMutation({
    mutationFn: ({ id, config }: { id: number; config: any }) => 
      sourcesApi.syncSource("manual", config),
    onSuccess: () => {
      toast({
        title: "Configuration Updated",
        description: "Data source settings have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sources"] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update configuration",
        variant: "destructive",
      });
    },
  });

  const handleConfigUpdate = (sourceId: number, field: string, value: string) => {
    const source = dataSources.find(s => s.id === sourceId);
    if (source) {
      const updatedConfig = { ...source.config, [field]: value };
      syncMutation.mutate({ id: sourceId, config: updatedConfig });
    }
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

  const renderDataSourceConfig = (source: any) => {
    const config = source.config || {};
    
    switch (source.type) {
      case "github":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`github-repo-${source.id}`}>Repository URL</Label>
              <Input
                id={`github-repo-${source.id}`}
                placeholder="enter your github repository url here"
                defaultValue={config.repositoryUrl}
                onBlur={(e) => handleConfigUpdate(source.id, "repositoryUrl", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`github-token-${source.id}`}>Access Token</Label>
              <Input
                id={`github-token-${source.id}`}
                type="password"
                placeholder="enter your github access token here"
                defaultValue={config.accessToken}
                onBlur={(e) => handleConfigUpdate(source.id, "accessToken", e.target.value)}
              />
            </div>
          </div>
        );

      case "confluence":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`confluence-url-${source.id}`}>Base URL</Label>
              <Input
                id={`confluence-url-${source.id}`}
                placeholder="enter your confluence base url here"
                defaultValue={config.baseUrl}
                onBlur={(e) => handleConfigUpdate(source.id, "baseUrl", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`confluence-user-${source.id}`}>Username</Label>
              <Input
                id={`confluence-user-${source.id}`}
                placeholder="enter your confluence username here"
                defaultValue={config.username}
                onBlur={(e) => handleConfigUpdate(source.id, "username", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`confluence-token-${source.id}`}>API Token</Label>
              <Input
                id={`confluence-token-${source.id}`}
                type="password"
                placeholder="enter your confluence api token here"
                defaultValue={config.apiToken}
                onBlur={(e) => handleConfigUpdate(source.id, "apiToken", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`confluence-space-${source.id}`}>Space Key</Label>
              <Input
                id={`confluence-space-${source.id}`}
                placeholder="enter your confluence space key here"
                defaultValue={config.spaceKey}
                onBlur={(e) => handleConfigUpdate(source.id, "spaceKey", e.target.value)}
              />
            </div>
          </div>
        );

      case "mongodb":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`mongodb-conn-${source.id}`}>Connection String</Label>
              <Input
                id={`mongodb-conn-${source.id}`}
                placeholder="enter your mongodb connection string here"
                defaultValue={config.connectionString}
                onBlur={(e) => handleConfigUpdate(source.id, "connectionString", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`mongodb-db-${source.id}`}>Database</Label>
              <Input
                id={`mongodb-db-${source.id}`}
                placeholder="enter your database name here"
                defaultValue={config.database}
                onBlur={(e) => handleConfigUpdate(source.id, "database", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`mongodb-collections-${source.id}`}>Collections</Label>
              <Input
                id={`mongodb-collections-${source.id}`}
                placeholder="enter comma-separated collection names here"
                defaultValue={config.collections}
                onBlur={(e) => handleConfigUpdate(source.id, "collections", e.target.value)}
              />
            </div>
          </div>
        );

      case "postgresql":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`pg-host-${source.id}`}>Host</Label>
              <Input
                id={`pg-host-${source.id}`}
                placeholder="enter your postgresql host here"
                defaultValue={config.host}
                onBlur={(e) => handleConfigUpdate(source.id, "host", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`pg-port-${source.id}`}>Port</Label>
              <Input
                id={`pg-port-${source.id}`}
                placeholder="5432"
                defaultValue={config.port}
                onBlur={(e) => handleConfigUpdate(source.id, "port", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`pg-db-${source.id}`}>Database</Label>
              <Input
                id={`pg-db-${source.id}`}
                placeholder="enter your database name here"
                defaultValue={config.database}
                onBlur={(e) => handleConfigUpdate(source.id, "database", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`pg-user-${source.id}`}>Username</Label>
              <Input
                id={`pg-user-${source.id}`}
                placeholder="enter your postgresql username here"
                defaultValue={config.username}
                onBlur={(e) => handleConfigUpdate(source.id, "username", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`pg-pass-${source.id}`}>Password</Label>
              <Input
                id={`pg-pass-${source.id}`}
                type="password"
                placeholder="enter your postgresql password here"
                defaultValue={config.password}
                onBlur={(e) => handleConfigUpdate(source.id, "password", e.target.value)}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-gray-500 text-center py-4">
            Configuration options not available for this source type.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your data sources and system preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="datasources">Data Sources</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input id="display-name" placeholder="Your display name" defaultValue="Sarah Chen" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your.email@company.com" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="notifications" />
                  <Label htmlFor="notifications">Enable email notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="analytics" defaultChecked />
                  <Label htmlFor="analytics">Enable usage analytics</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="dark-mode" />
                  <Label htmlFor="dark-mode">Dark mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="auto-sync" defaultChecked />
                  <Label htmlFor="auto-sync">Auto-sync data sources</Label>
                </div>
                <div>
                  <Label htmlFor="sync-interval">Sync Interval (hours)</Label>
                  <Input id="sync-interval" type="number" defaultValue="24" min="1" max="168" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="datasources" className="space-y-6">
            <div className="grid gap-6">
              {dataSources.map((source) => (
                <Card key={source.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        {source.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(source.status)}`}></div>
                        <Badge variant={source.status === "active" ? "default" : "secondary"}>
                          {source.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Last sync: {source.lastSync 
                        ? formatDistanceToNow(new Date(source.lastSync), { addSuffix: true })
                        : "Never"
                      }
                    </p>
                  </CardHeader>
                  <CardContent>
                    {renderDataSourceConfig(source)}
                    <div className="flex justify-end mt-4">
                      <Button
                        variant="outline"
                        disabled={syncMutation.isPending}
                        onClick={() => syncMutation.mutate({ id: source.id, config: source.config })}
                      >
                        {syncMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Configuration
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="enter your openai api key here"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for AI-powered responses and document embeddings
                  </p>
                </div>
                <div>
                  <Label htmlFor="api-endpoint">API Endpoint</Label>
                  <Input
                    id="api-endpoint"
                    placeholder="https://api.openai.com/v1"
                    defaultValue="https://api.openai.com/v1"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Default Model</Label>
                  <Input
                    id="model"
                    placeholder="gpt-4o"
                    defaultValue="gpt-4o"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="require-auth" defaultChecked />
                  <Label htmlFor="require-auth">Require authentication</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="audit-logs" defaultChecked />
                  <Label htmlFor="audit-logs">Enable audit logging</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="data-encryption" defaultChecked />
                  <Label htmlFor="data-encryption">Encrypt stored data</Label>
                </div>
                <div>
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input id="session-timeout" type="number" defaultValue="60" min="15" max="480" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}