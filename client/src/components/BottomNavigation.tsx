import { useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, MessageSquare, Globe, User, Plus, Camera, PlusSquare } from "lucide-react";
import CreatePostModal from "./CreatePostModal";
import CreateStoryModal from "./CreateStoryModal";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/goonings", icon: Search, label: "Goonings" },
    { path: "/chat", icon: MessageSquare, label: "Chat" },
    { path: "/global", icon: Globe, label: "Global" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <>
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

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-50">
        {showCreateMenu && (
          <div className="absolute bottom-16 right-0 space-y-2 mb-2">
            <Button
              onClick={() => {
                setShowCreateStoryModal(true);
                setShowCreateMenu(false);
              }}
              className="floating-btn hover-glow flex items-center space-x-2 bg-purple-neon hover:bg-purple-neon/80"
              data-testid="button-add-story"
            >
              <Camera className="w-4 h-4" />
              <span>Add Story</span>
            </Button>
            <Button
              onClick={() => {
                setShowCreatePostModal(true);
                setShowCreateMenu(false);
              }}
              className="floating-btn hover-glow flex items-center space-x-2 bg-neon-green hover:bg-neon-green/80"
              data-testid="button-add-post"
            >
              <PlusSquare className="w-4 h-4" />
              <span>Create Post</span>
            </Button>
          </div>
        )}
        
        <Button
          onClick={() => setShowCreateMenu(!showCreateMenu)}
          className="w-14 h-14 rounded-full floating-btn hover-glow bg-gradient-to-r from-purple-neon to-neon-pink"
          data-testid="button-create-menu"
        >
          <Plus className={`w-6 h-6 transition-transform ${showCreateMenu ? 'rotate-45' : ''}`} />
        </Button>
      </div>

      {/* Modals */}
      <CreatePostModal 
        isOpen={showCreatePostModal} 
        onClose={() => setShowCreatePostModal(false)} 
      />
      <CreateStoryModal 
        isOpen={showCreateStoryModal} 
        onClose={() => setShowCreateStoryModal(false)} 
      />
    </>
  );
}
