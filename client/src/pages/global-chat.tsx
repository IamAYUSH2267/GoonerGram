import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import BottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import { formatDistanceToNow } from "date-fns";

export default function GlobalChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/global/messages"],
    refetchInterval: 3000, // Refetch every 3 seconds for real-time feel
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/global/messages", { content });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/global/messages"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate(message.trim());
  };

  return (
    <div className="min-h-screen bg-dark-navy pb-20 flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col pt-20">
        {/* Chat Header */}
        <div className="px-4 py-3 glass-effect border-b border-glass-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-neon to-neon-green rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold" data-testid="text-global-chat-title">Global Chat</h2>
              <p className="text-xs text-neon-green" data-testid="status-online">
                All users • No restrictions
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" data-testid="messages-container">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse">Loading messages...</div>
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg: any, index: number) => {
              const isFromCurrentUser = msg.sender.id === user?.id;
              const showAvatar = index === 0 || messages[index - 1]?.sender.id !== msg.sender.id;
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${msg.id}`}
                >
                  <div className={`flex items-end space-x-2 max-w-xs ${isFromCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!isFromCurrentUser && showAvatar && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={msg.sender.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-purple-neon text-white text-xs">
                          {msg.sender.firstName?.[0] || msg.sender.username?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {!isFromCurrentUser && !showAvatar && (
                      <div className="w-8 h-8"></div>
                    )}
                    
                    <div className={`rounded-2xl px-4 py-2 ${
                      isFromCurrentUser 
                        ? 'chat-bubble-sent text-white' 
                        : 'chat-bubble-received'
                    }`}>
                      {!isFromCurrentUser && showAvatar && (
                        <p className="text-xs font-semibold mb-1 text-purple-neon">
                          {msg.sender.username || `${msg.sender.firstName} ${msg.sender.lastName}`}
                        </p>
                      )}
                      <p className="text-sm" data-testid={`text-message-content-${msg.id}`}>
                        {msg.content}
                      </p>
                      <p className={`text-xs mt-1 ${isFromCurrentUser ? 'opacity-75' : 'opacity-75'}`}>
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Welcome to the global chat!</p>
              <p className="text-sm text-muted-foreground mt-1">Start the conversation</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 glass-effect border-t border-glass-border">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="bg-darker-navy border-glass-border pr-12"
                disabled={sendMessageMutation.isPending}
                data-testid="input-global-message"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto floating-btn"
                data-testid="button-send-global-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
