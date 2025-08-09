import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

interface ChatBubbleProps {
  message: Message;
  isFromCurrentUser: boolean;
  showAvatar?: boolean;
}

export default function ChatBubble({ message, isFromCurrentUser, showAvatar = true }: ChatBubbleProps) {
  return (
    <div
      className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
      data-testid={`chat-bubble-${message.id}`}
    >
      <div className={`flex items-end space-x-2 max-w-xs ${isFromCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {!isFromCurrentUser && showAvatar && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={message.sender.profileImageUrl || undefined} />
            <AvatarFallback className="bg-purple-neon text-white text-xs">
              {message.sender.firstName?.[0] || message.sender.username?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
        )}
        {!isFromCurrentUser && !showAvatar && (
          <div className="w-8 h-8"></div>
        )}
        
        <div className={`rounded-2xl px-4 py-2 ${
          isFromCurrentUser 
            ? 'chat-bubble-sent text-white' 
            : 'chat-bubble-received'
        }`}>
          {!isFromCurrentUser && showAvatar && (
            <p className="text-xs font-semibold mb-1 text-purple-neon">
              {message.sender.username || `${message.sender.firstName} ${message.sender.lastName}`}
            </p>
          )}
          <p className="text-sm" data-testid={`text-message-content-${message.id}`}>
            {message.content}
          </p>
          <p className={`text-xs mt-1 ${isFromCurrentUser ? 'opacity-75' : 'opacity-75'}`}>
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}
