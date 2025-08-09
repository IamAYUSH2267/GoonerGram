import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare } from "lucide-react";
import BottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import { formatDistanceToNow } from "date-fns";

export default function Chat() {
  const { data: chats, isLoading } = useQuery({
    queryKey: ["/api/chats"],
  });

  return (
    <div className="min-h-screen bg-dark-navy pb-20">
      <Header />
      
      <div className="pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search chats..."
                className="pl-10 bg-darker-navy border-glass-border"
                data-testid="input-search-chats"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="space-y-3" data-testid="chat-list">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-pulse">Loading chats...</div>
              </div>
            ) : chats && chats.length > 0 ? (
              chats.map((chat: any) => (
                <Card
                  key={chat.id}
                  className="glass-effect border-glass-border hover-glow cursor-pointer transition-all"
                  data-testid={`card-chat-${chat.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={chat.otherUser?.profileImageUrl || undefined} />
                          <AvatarFallback className="bg-purple-neon text-white">
                            {chat.isGroup 
                              ? "G" 
                              : chat.otherUser?.firstName?.[0] || chat.otherUser?.username?.[0] || "U"
                            }
                          </AvatarFallback>
                        </Avatar>
                        {!chat.isGroup && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 online-indicator rounded-full border-2 border-dark-navy"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate" data-testid={`text-chat-name-${chat.id}`}>
                            {chat.isGroup 
                              ? chat.name 
                              : chat.otherUser?.username || `${chat.otherUser?.firstName} ${chat.otherUser?.lastName}` || "User"
                            }
                          </h3>
                          <div className="flex items-center space-x-2">
                            {chat.lastMessage && (
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true })}
                              </span>
                            )}
                            <Badge variant="secondary" className="bg-neon-green text-dark-navy">
                              2
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground truncate" data-testid={`text-last-message-${chat.id}`}>
                          {chat.lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No chats yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start a conversation with your gooning partners</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
