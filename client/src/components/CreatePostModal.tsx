import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Video, X } from "lucide-react";
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
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const createPostMutation = useMutation({
    mutationFn: async (data: { content?: string; imageUrl?: string; videoUrl?: string }) => {
      await apiRequest("POST", "/api/posts", data);
    },
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "Your post has been created successfully.",
      });
      handleClose();
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/user"] });
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

  const handleClose = () => {
    setContent("");
    setMediaFile(null);
    setMediaPreview("");
    setMediaType(null);
    setIsUploading(false);
    onClose();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setMediaFile(file);
      setMediaPreview(previewUrl);
      setMediaType(type);
      
      toast({
        title: "Media selected",
        description: `${type === "image" ? "Photo" : "Video"} ready to post.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to process media. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!content.trim() && !mediaFile) {
      toast({
        title: "Content required",
        description: "Please add some content or media to your post.",
        variant: "destructive",
      });
      return;
    }

    const postData: { content?: string; imageUrl?: string; videoUrl?: string } = {};
    
    if (content.trim()) {
      postData.content = content;
    }
    
    if (mediaFile && mediaPreview) {
      if (mediaType === "image") {
        postData.imageUrl = mediaPreview;
      } else if (mediaType === "video") {
        postData.videoUrl = mediaPreview;
      }
    }

    createPostMutation.mutate(postData);
  };

  const removeMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview("");
    setMediaType(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-darker-navy border-glass-border max-w-md" data-testid="modal-create-post" aria-describedby="create-post-description">
        <DialogHeader>
          <DialogTitle className="gradient-text text-center">Create Post</DialogTitle>
        </DialogHeader>
        <p id="create-post-description" className="sr-only">Create a new post with text, photos, or videos</p>
        
        <div className="space-y-4">
          {/* Media Preview */}
          {mediaPreview && (
            <div className="relative">
              {mediaType === "image" ? (
                <img
                  src={mediaPreview}
                  alt="Post preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <video
                  src={mediaPreview}
                  className="w-full h-48 object-cover rounded-lg"
                  controls
                />
              )}
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 w-6 h-6 p-0"
                onClick={removeMedia}
                data-testid="button-remove-media"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Content Input */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="bg-darker-navy border-glass-border resize-none"
            rows={4}
            data-testid="input-post-content"
          />

          {/* Media Buttons */}
          <div className="flex space-x-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !!mediaFile}
              className="border-glass-border"
              data-testid="button-add-photo"
            >
              <Camera className="w-4 h-4 mr-2" />
              Photo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => videoInputRef.current?.click()}
              disabled={isUploading || !!mediaFile}
              className="border-glass-border"
              data-testid="button-add-video"
            >
              <Video className="w-4 h-4 mr-2" />
              Video
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-glass-border"
              data-testid="button-cancel-post"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createPostMutation.isPending}
              className="floating-btn hover-glow"
              data-testid="button-create-post"
            >
              Post
            </Button>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, "image")}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, "video")}
        />
      </DialogContent>
    </Dialog>
  );
}