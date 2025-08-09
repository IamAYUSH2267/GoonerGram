import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Search, MessageSquare, Globe, User } from "lucide-react";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/goonings", icon: Search, label: "Goonings" },
    { path: "/chat", icon: MessageSquare, label: "Chat" },
    { path: "/global", icon: Globe, label: "Global" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-glass-border z-50" data-testid="bottom-navigation">
      <div className="flex items-center justify-around py-3 px-4">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          
          return (
            <Button
              key={path}
              onClick={() => navigate(path)}
              className={`nav-pill px-4 py-2 rounded-full flex flex-col items-center space-y-1 ${
                isActive 
                  ? 'active text-white' 
                  : 'text-muted-foreground hover:text-foreground bg-transparent'
              }`}
              variant="ghost"
              data-testid={`nav-${label.toLowerCase()}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
              {path === "/chat" && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full"></div>
              )}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
