import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, UserPlus, UserMinus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatDistanceToNow } from "date-fns";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: isOpen,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
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
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-neon-pink" />;
      case "comment":
        return <MessageSquare className="w-4 h-4 text-purple-neon" />;
      case "follow":
        return <UserPlus className="w-4 h-4 text-neon-green" />;
      case "unfollow":
        return <UserMinus className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Heart className="w-4 h-4 text-purple-neon" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-darker-navy border-glass-border max-w-md max-h-[80vh] overflow-hidden" data-testid="modal-notifications" aria-describedby="notifications-description">
        <DialogHeader>
          <DialogTitle className="gradient-text text-center">Notifications</DialogTitle>
        </DialogHeader>
        <p id="notifications-description" className="sr-only">View and manage your notifications</p>
        
        <div className="max-h-96 overflow-y-auto space-y-3 pr-2" data-testid="notifications-list">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-pulse">Loading notifications...</div>
            </div>
          ) : notifications && notifications.length > 0 ? (
            notifications.map((notification: any) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-dark-navy ${
                  !notification.isRead ? 'bg-glass-bg border border-glass-border' : ''
                }`}
                data-testid={`notification-${notification.id}`}
              >
                <div className="flex-shrink-0">
                  {notification.fromUser ? (
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={notification.fromUser.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-purple-neon text-white text-xs">
                          {notification.fromUser.firstName?.[0] || notification.fromUser.username?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-dark-navy rounded-full flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-purple-neon rounded-full flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm" data-testid={`notification-message-${notification.id}`}>
                    {notification.fromUser && (
                      <span className="font-semibold text-purple-neon">
                        {notification.fromUser.username || `${notification.fromUser.firstName} ${notification.fromUser.lastName}`}
                      </span>
                    )}{" "}
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>

                {!notification.isRead && (
                  <Badge variant="secondary" className="bg-neon-green text-dark-navy text-xs">
                    New
                  </Badge>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                You'll see likes, comments, and follows here
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}