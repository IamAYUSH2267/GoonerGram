import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Edit, Users, MessageSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const { data: userPosts } = useQuery({
    queryKey: ["/api/posts/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: partners } = useQuery({
    queryKey: ["/api/partners"],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { username?: string; bio?: string }) => {
      await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        description: "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !user) {
    return <div className="min-h-screen bg-dark-navy"></div>;
  }

  const handleEditProfile = () => {
    setUsername(user.username || "");
    setBio(user.bio || "");
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({ username, bio });
  };

  return (
    <div className="min-h-screen bg-dark-navy pb-20">
      <Header />
      
      <div className="pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="text-center mb-6">
            <Avatar className="w-24 h-24 mx-auto mb-4" data-testid="img-avatar">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback className="bg-purple-neon text-white text-2xl">
                {user.firstName?.[0] || user.username?.[0] || "G"}
              </AvatarFallback>
            </Avatar>
            
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="text-center bg-darker-navy border-glass-border"
                  data-testid="input-username"
                />
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Bio"
                  className="text-center bg-darker-navy border-glass-border resize-none"
                  rows={2}
                  data-testid="input-bio"
                />
                <div className="flex space-x-2 justify-center">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="floating-btn hover-glow"
                    data-testid="button-save-profile"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="border-glass-border"
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <h2 className="text-xl font-bold" data-testid="text-username">
                    {user.username || `${user.firstName} ${user.lastName}` || "User"}
                  </h2>
                  <Button
                    onClick={handleEditProfile}
                    size="sm"
                    variant="ghost"
                    className="p-1 h-auto"
                    data-testid="button-edit-profile"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground" data-testid="text-bio">
                  {user.bio || "Creative enthusiast & content creator"}
                </p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-neon" data-testid="text-posts-count">
                {userPosts?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-neon-green" data-testid="text-partners-count">
                {partners?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Partners</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-neon-pink" data-testid="text-following-count">
                0
              </p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-darker-navy">
              <TabsTrigger value="posts" className="data-[state=active]:bg-purple-neon">
                Posts
              </TabsTrigger>
              <TabsTrigger value="partners" className="data-[state=active]:bg-purple-neon">
                Partners
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-purple-neon">
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-6">
              {userPosts && userPosts.length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                  {userPosts.map((post: any) => (
                    <div
                      key={post.id}
                      className="aspect-square bg-darker-navy rounded-lg overflow-hidden"
                      data-testid={`card-post-${post.id}`}
                    >
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <MessageSquare className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No posts yet</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="partners" className="mt-6">
              {partners && partners.length > 0 ? (
                <div className="space-y-3">
                  {partners.map((partner: any) => (
                    <Card key={partner.id} className="glass-effect border-glass-border" data-testid={`card-partner-${partner.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={partner.profileImageUrl || undefined} />
                            <AvatarFallback className="bg-purple-neon text-white">
                              {partner.firstName?.[0] || partner.username?.[0] || "G"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold">{partner.username || `${partner.firstName} ${partner.lastName}`}</h3>
                            <p className="text-sm text-muted-foreground">{partner.bio}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-glass-border"
                            data-testid={`button-message-${partner.id}`}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No gooning partners yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Send partner requests to connect</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <div className="space-y-3">
                <Card className="glass-effect border-glass-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Settings className="w-5 h-5 text-purple-neon" />
                        <span>Settings & Privacy</span>
                      </div>
                      <Button variant="ghost" size="sm" data-testid="button-settings">
                        →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass-effect border-glass-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span>Help & Support</span>
                      <Button variant="ghost" size="sm" data-testid="button-help">
                        →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass-effect border-glass-border">
                  <CardContent className="p-4">
                    <Button
                      onClick={() => window.location.href = '/api/logout'}
                      variant="destructive"
                      className="w-full"
                      data-testid="button-logout"
                    >
                      Log Out
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
