import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImagePlus, Video, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [activeTab, setActiveTab] = useState("text");

  const createPostMutation = useMutation({
    mutationFn: async (data: { content?: string; imageUrl?: string; videoUrl?: string }) => {
      await apiRequest("POST", "/api/posts", data);
    },
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "Your post has been shared successfully.",
      });
      resetForm();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
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
        description: "Failed to create post.",
        variant: "destructive",
      });
    },
  });

  const createStoryMutation = useMutation({
    mutationFn: async (data: { content?: string; imageUrl?: string; videoUrl?: string }) => {
      await apiRequest("POST", "/api/stories", data);
    },
    onSuccess: () => {
      toast({
        title: "Story created",
        description: "Your story has been shared and will expire in 24 hours.",
      });
      resetForm();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
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
        description: "Failed to create story.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setContent("");
    setImageUrl("");
    setVideoUrl("");
    setActiveTab("text");
  };

  const handleCreatePost = () => {
    const postData: any = {};
    
    if (content.trim()) postData.content = content.trim();
    if (activeTab === "image" && imageUrl.trim()) postData.imageUrl = imageUrl.trim();
    if (activeTab === "video" && videoUrl.trim()) postData.videoUrl = videoUrl.trim();
    
    if (!postData.content && !postData.imageUrl && !postData.videoUrl) {
      toast({
        title: "Error",
        description: "Please add some content to your post.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate(postData);
  };

  const handleCreateStory = () => {
    const storyData: any = {};
    
    if (content.trim()) storyData.content = content.trim();
    if (activeTab === "image" && imageUrl.trim()) storyData.imageUrl = imageUrl.trim();
    if (activeTab === "video" && videoUrl.trim()) storyData.videoUrl = videoUrl.trim();
    
    if (!storyData.content && !storyData.imageUrl && !storyData.videoUrl) {
      toast({
        title: "Error",
        description: "Please add some content to your story.",
        variant: "destructive",
      });
      return;
    }

    createStoryMutation.mutate(storyData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-darker-navy border-glass-border max-w-md" data-testid="modal-create-post">
        <DialogHeader>
          <DialogTitle className="gradient-text text-center">Create Content</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-dark-navy">
            <TabsTrigger value="text" className="data-[state=active]:bg-purple-neon">
              <FileText className="w-4 h-4 mr-1" />
              Text
            </TabsTrigger>
            <TabsTrigger value="image" className="data-[state=active]:bg-purple-neon">
              <ImagePlus className="w-4 h-4 mr-1" />
              Photo
            </TabsTrigger>
            <TabsTrigger value="video" className="data-[state=active]:bg-purple-neon">
              <Video className="w-4 h-4 mr-1" />
              Video
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="content">Caption</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="bg-dark-navy border-glass-border mt-1"
                rows={3}
                data-testid="input-post-content"
              />
            </div>
            
            <TabsContent value="image" className="mt-4">
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-dark-navy border-glass-border mt-1"
                  data-testid="input-image-url"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="video" className="mt-4">
              <div>
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="bg-dark-navy border-glass-border mt-1"
                  data-testid="input-video-url"
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="flex space-x-2 mt-6">
          <Button
            onClick={handleCreatePost}
            disabled={createPostMutation.isPending}
            className="flex-1 floating-btn hover-glow"
            data-testid="button-create-post-submit"
          >
            Create Post
          </Button>
          <Button
            onClick={handleCreateStory}
            disabled={createStoryMutation.isPending}
            variant="outline"
            className="flex-1 border-glass-border"
            data-testid="button-create-story"
          >
            24h Story
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
