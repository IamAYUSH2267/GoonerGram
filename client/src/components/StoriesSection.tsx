import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Story {
  id: string;
  user: {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
}

interface StoriesSectionProps {
  stories: Story[];
}

export default function StoriesSection({ stories }: StoriesSectionProps) {
  return (
    <section className="px-4 mb-6" data-testid="stories-section">
      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {stories && stories.length > 0 ? (
          stories.map((story) => (
            <div key={story.id} className="flex-shrink-0 text-center" data-testid={`story-${story.id}`}>
              <div className="story-ring">
                <div className="story-inner">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={story.user.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-purple-neon text-white">
                      {story.user.firstName?.[0] || story.user.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <p className="text-xs mt-1 text-muted-foreground truncate w-16" data-testid={`story-username-${story.id}`}>
                {story.user.username || story.user.firstName || "User"}
              </p>
              <div className="w-2 h-2 online-indicator rounded-full mx-auto mt-1"></div>
            </div>
          ))
        ) : (
          <div className="flex-shrink-0 text-center opacity-50">
            <div className="w-16 h-16 border-2 border-dashed border-muted-foreground rounded-full flex items-center justify-center">
              <span className="text-xs">+</span>
            </div>
            <p className="text-xs mt-1 text-muted-foreground">Add Story</p>
          </div>
        )}
      </div>
    </section>
  );
}
