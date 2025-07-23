import { Bell, ChevronDown, LogOut, User, Brain } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navigationItems = [
    { path: "/", label: "Chat", current: location === "/" },
    { path: "/documents", label: "Documents", current: location === "/documents" },
    { path: "/analytics", label: "Analytics", current: location === "/analytics" },
    { path: "/settings", label: "Settings", current: location === "/settings" },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">InfraMind</h1>
              </div>
            </Link>
            <span className="text-sm text-gray-500">Internal AI Assistant</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span className={`cursor-pointer transition-colors ${
                  item.current 
                    ? "text-primary font-medium" 
                    : "text-gray-600 hover:text-gray-900"
                }`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600">
              <Bell className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-300">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.username || "User"}
                  </span>
                  <ChevronDown className="text-gray-400 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
