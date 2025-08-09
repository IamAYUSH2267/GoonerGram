import { Button } from "@/components/ui/button";
import { Heart, Send } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect px-4 py-3" data-testid="header">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold gradient-text" data-testid="app-logo">
          Gooners
        </h1>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
            <Heart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-pink rounded-full"></span>
          </Button>
          <Button variant="ghost" size="sm" className="relative" data-testid="button-messages">
            <Send className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  );
}
