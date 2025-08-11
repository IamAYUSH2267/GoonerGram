import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare } from "lucide-react";
import NotificationsModal from "./NotificationsModal";

export default function Header() {
  const [location, navigate] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: unreadCount } = useQuery({
    queryKey: ["/api/notifications/unread-count"],
    refetchInterval: 10000, // Check every 10 seconds
  });

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect px-4 py-3" data-testid="header">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold gradient-text" data-testid="app-logo">
            GoonerGram
          </h1>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative" 
              onClick={() => setShowNotifications(true)}
              data-testid="button-notifications"
            >
              <Heart className="w-5 h-5" />
              {unreadCount?.count > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-neon-pink rounded-full text-xs flex items-center justify-center text-white">
                  {unreadCount.count > 9 ? '9+' : unreadCount.count}
                </span>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative" 
              onClick={() => navigate("/chat")}
              data-testid="button-messages"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full"></span>
            </Button>
          </div>
        </div>
      </header>

      <NotificationsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
