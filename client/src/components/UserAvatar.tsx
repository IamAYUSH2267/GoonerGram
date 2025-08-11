import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

interface UserAvatarProps {
  user?: {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackClassName?: string;
  "data-testid"?: string;
}

export default function UserAvatar({ user, size = "md", className = "", fallbackClassName = "", "data-testid": dataTestId, ...props }: UserAvatarProps) {
  const { user: currentUser } = useAuth();
  
  // Use current user data if this is the logged-in user to ensure real-time updates
  const displayUser = user?.id === currentUser?.id ? currentUser : user;
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const fallbackSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg", 
    xl: "text-2xl"
  };

  const getInitials = () => {
    if (displayUser?.firstName && displayUser?.lastName) {
      return `${displayUser.firstName[0]}${displayUser.lastName[0]}`;
    }
    if (displayUser?.username) {
      return displayUser.username[0].toUpperCase();
    }
    if (displayUser?.firstName) {
      return displayUser.firstName[0].toUpperCase();
    }
    return "U";
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`} data-testid={dataTestId} {...props}>
      <AvatarImage src={displayUser?.profileImageUrl || undefined} />
      <AvatarFallback className={`bg-purple-neon text-white ${fallbackSizeClasses[size]} ${fallbackClassName}`}>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}