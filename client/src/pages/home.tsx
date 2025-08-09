import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import StoriesSection from "@/components/StoriesSection";
import PostCard from "@/components/PostCard";
import FloatingActionButton from "@/components/FloatingActionButton";
import BottomNavigation from "@/components/BottomNavigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user } = useAuth();
  
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/posts"],
  });

  const { data: stories } = useQuery({
    queryKey: ["/api/stories"],
  });

  if (!user) return null;

  return (
    <div className="min-h-screen pb-20 bg-dark-navy">
      <Header />
      
      <div className="pt-20">
        <StoriesSection stories={stories || []} />
        
        <main className="px-4 space-y-6" data-testid="posts-feed">
          {isLoading ? (
            // Loading skeletons
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-6 w-6" />
                </div>
              </div>
            ))
          ) : posts && posts.length > 0 ? (
            posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet</p>
              <p className="text-sm text-muted-foreground mt-1">Start following gooning partners to see their content</p>
            </div>
          )}
        </main>
      </div>

      <FloatingActionButton />
      <BottomNavigation />
    </div>
  );
}
