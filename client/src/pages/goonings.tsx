import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import BottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";

export default function Goonings() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/posts"],
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
                placeholder="Search goonings..."
                className="pl-10 bg-darker-navy border-glass-border"
                data-testid="input-search-goonings"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-darker-navy mb-6">
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-neon">
                All
              </TabsTrigger>
              <TabsTrigger value="trending" className="data-[state=active]:bg-purple-neon">
                <TrendingUp className="w-4 h-4 mr-1" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="following" className="data-[state=active]:bg-purple-neon">
                Following
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6" data-testid="goonings-all">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="post-card rounded-2xl p-4 space-y-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="w-full h-80 rounded-lg" />
                  </div>
                ))
              ) : posts && posts.length > 0 ? (
                posts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No content available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="trending" className="space-y-6" data-testid="goonings-trending">
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Trending content coming soon</p>
              </div>
            </TabsContent>
            
            <TabsContent value="following" className="space-y-6" data-testid="goonings-following">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Follow gooning partners to see their content here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
