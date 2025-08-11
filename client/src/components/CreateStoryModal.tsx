import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Video, Type, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateStoryModal({ isOpen, onClose }: CreateStoryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const createStoryMutation = useMutation({
    mutationFn: async (data: { content?: string; imageUrl?: string; videoUrl?: string }) => {
      await apiRequest("POST", "/api/stories", data);
    },
    onSuccess: () => {
      toast({
        title: "Story posted",
        description: "Your 24-hour story has been posted successfully.",
      });
      handleClose();
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
        description: "Failed to post story.",
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
        description: "Please add some content or media to your story.",
        variant: "destructive",
      });
      return;
    }

    const storyData: { content?: string; imageUrl?: string; videoUrl?: string } = {};
    
    if (content.trim()) {
      storyData.content = content;
    }
    
    if (mediaFile && mediaPreview) {
      if (mediaType === "image") {
        storyData.imageUrl = mediaPreview;
      } else if (mediaType === "video") {
        storyData.videoUrl = mediaPreview;
      }
    }

    createStoryMutation.mutate(storyData);
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
      <DialogContent className="bg-darker-navy border-glass-border max-w-md" data-testid="modal-create-story" aria-describedby="create-story-description">
        <DialogHeader>
          <DialogTitle className="gradient-text text-center">Create Story</DialogTitle>
        </DialogHeader>
        <p id="create-story-description" className="sr-only">Create a 24-hour story with text, photos, or videos</p>
        
        <div className="space-y-4">
          {/* Media Preview */}
          {mediaPreview && (
            <div className="relative">
              {mediaType === "image" ? (
                <img
                  src={mediaPreview}
                  alt="Story preview"
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
            placeholder="Share what's happening in your day..."
            className="bg-darker-navy border-glass-border resize-none"
            rows={3}
            data-testid="input-story-content"
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
              data-testid="button-cancel-story"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createStoryMutation.isPending}
              className="floating-btn hover-glow"
              data-testid="button-post-story"
            >
              Post Story
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