import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Play } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  videoDuration?: number;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  user: {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  isLiked?: boolean;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/posts/${post.id}/like`);
      } else {
        await apiRequest("POST", `/api/posts/${post.id}/like`);
      }
    },
    onMutate: () => {
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    },
    onError: (error) => {
      // Revert optimistic update
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      
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
        description: "Failed to update like.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const formatVideoDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <article className="post-card rounded-2xl overflow-hidden animate-fade-in" data-testid={`post-card-${post.id}`}>
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={post.user.profileImageUrl || undefined} />
            <AvatarFallback className="bg-purple-neon text-white">
              {post.user.firstName?.[0] || post.user.username?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm" data-testid={`text-username-${post.id}`}>
              {post.user.username || `${post.user.firstName} ${post.user.lastName}` || "User"}
            </h3>
            <p className="text-xs text-muted-foreground" data-testid={`text-time-${post.id}`}>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" data-testid={`button-menu-${post.id}`}>
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Post Content */}
      {(post.imageUrl || post.videoUrl) && (
        <div className="relative">
          {post.imageUrl && (
            <img 
              src={post.imageUrl} 
              alt="Post content" 
              className="w-full h-80 object-cover"
              data-testid={`img-post-${post.id}`}
            />
          )}
          {post.videoUrl && (
            <>
              <video 
                src={post.videoUrl} 
                className="w-full h-80 object-cover"
                poster={post.imageUrl}
                controls={false}
                data-testid={`video-post-${post.id}`}
              />
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-glass-bg text-white">
                  <Play className="w-3 h-3 mr-1" />
                  {post.videoDuration ? formatVideoDuration(post.videoDuration) : "0:00"}
                </Badge>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={`flex items-center space-x-2 ${isLiked ? 'text-neon-pink' : ''}`}
              data-testid={`button-like-${post.id}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likesCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2" data-testid={`button-comment-${post.id}`}>
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{post.commentsCount}</span>
            </Button>
            <Button variant="ghost" size="sm" data-testid={`button-share-${post.id}`}>
              <Share className="w-5 h-5" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" data-testid={`button-bookmark-${post.id}`}>
            <Bookmark className="w-5 h-5" />
          </Button>
        </div>
        
        {post.content && (
          <div className="text-sm" data-testid={`text-content-${post.id}`}>
            <span className="font-semibold">{post.user.username || post.user.firstName} </span>
            {post.content}
          </div>
        )}
        
        {post.commentsCount > 0 && (
          <Button variant="ghost" size="sm" className="text-muted-foreground p-0 h-auto mt-1" data-testid={`button-view-comments-${post.id}`}>
            View all {post.commentsCount} comments
          </Button>
        )}
      </div>
    </article>
  );
}
