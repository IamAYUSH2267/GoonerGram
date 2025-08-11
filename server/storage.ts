import {
  users,
  posts,
  stories,
  gooningPartners,
  chatRooms,
  chatRoomMembers,
  messages,
  globalMessages,
  postLikes,
  postComments,
  notifications,
  type User,
  type UpsertUser,
  type Post,
  type Story,
  type InsertPost,
  type InsertStory,
  type InsertMessage,
  type InsertGlobalMessage,
  type InsertNotification,
  type Message,
  type GlobalMessage,
  type GooningPartner,
  type ChatRoom,
  type Notification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile operations
  updateUserProfile(id: string, data: { username?: string; bio?: string; profileImageUrl?: string }): Promise<User>;
  checkUsernameAvailability(username: string, currentUserId?: string): Promise<boolean>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPosts(limit?: number): Promise<(Post & { user: User; isLiked?: boolean; likesCount: number; commentsCount: number })[]>;
  getPostsByUser(userId: string): Promise<Post[]>;
  deletePost(postId: string, userId: string): Promise<void>;
  likePost(postId: string, userId: string): Promise<void>;
  unlikePost(postId: string, userId: string): Promise<void>;
  
  // Story operations
  createStory(story: InsertStory): Promise<Story>;
  getActiveStories(): Promise<(Story & { user: User })[]>;
  
  // Partner operations
  sendPartnerRequest(userId: string, partnerId: string): Promise<void>;
  acceptPartnerRequest(userId: string, partnerId: string): Promise<void>;
  getPartners(userId: string): Promise<User[]>;
  getPendingRequests(userId: string): Promise<(GooningPartner & { user: User })[]>;
  
  // Chat operations
  getOrCreatePrivateChat(userId1: string, userId2: string): Promise<ChatRoom>;
  getChatRooms(userId: string): Promise<(ChatRoom & { otherUser?: User; lastMessage?: Message })[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  getMessages(chatRoomId: string, limit?: number): Promise<(Message & { sender: User })[]>;
  
  // Global chat operations
  sendGlobalMessage(message: InsertGlobalMessage): Promise<GlobalMessage>;
  getGlobalMessages(limit?: number): Promise<(GlobalMessage & { sender: User })[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string, limit?: number): Promise<(Notification & { fromUser?: User; post?: Post })[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, updates: { username?: string; bio?: string; profileImageUrl?: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserProfile(id: string, data: { username?: string; bio?: string; profileImageUrl?: string }): Promise<User> {
    const updateData: any = { ...data, updatedAt: new Date() };
    
    // If username is being changed, update username change tracking
    if (data.username) {
      updateData.usernameChangedAt = new Date();
      updateData.usernameChangeCount = sql`COALESCE(${users.usernameChangeCount}, 0) + 1`;
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async checkUsernameAvailability(username: string, currentUserId?: string): Promise<boolean> {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    if (existingUser.length === 0) return true;
    if (currentUserId && existingUser[0].id === currentUserId) return true;
    return false;
  }

  async canChangeUsername(userId: string): Promise<{ canChange: boolean; reason?: string; nextAllowedDate?: Date }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return { canChange: false, reason: "User not found" };

    const changeCount = user.usernameChangeCount || 0;
    const lastChange = user.usernameChangedAt;

    // Allow up to 2 changes in 24 days
    if (changeCount >= 2 && lastChange) {
      const daysSinceLastChange = Math.floor((Date.now() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastChange < 24) {
        const nextAllowedDate = new Date(lastChange.getTime() + (24 * 24 * 60 * 60 * 1000));
        return { 
          canChange: false, 
          reason: "You can only change your username twice in 24 days",
          nextAllowedDate 
        };
      }
      // Reset count if 24 days have passed
      await db.update(users).set({ 
        usernameChangeCount: 0,
        usernameChangedAt: null 
      }).where(eq(users.id, userId));
    }

    return { canChange: true };
  }

  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getPosts(limit = 20): Promise<(Post & { user: User; isLiked?: boolean; likesCount: number; commentsCount: number })[]> {
    const result = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        imageUrl: posts.imageUrl,
        videoUrl: posts.videoUrl,
        videoDuration: posts.videoDuration,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        user: users,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit);

    return result.map(row => ({
      ...row,
      likesCount: row.likesCount || 0,
      commentsCount: row.commentsCount || 0,
    }));
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    return await db.select().from(posts).where(eq(posts.userId, userId)).orderBy(desc(posts.createdAt));
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    await db.delete(posts).where(and(eq(posts.id, postId), eq(posts.userId, userId)));
  }

  async likePost(postId: string, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.insert(postLikes).values({ postId, userId });
      await tx.update(posts).set({ 
        likesCount: sql`${posts.likesCount} + 1` 
      }).where(eq(posts.id, postId));
      
      // Create notification for post owner
      const [post] = await tx.select().from(posts).where(eq(posts.id, postId));
      if (post && post.userId !== userId) {
        await tx.insert(notifications).values({
          userId: post.userId,
          fromUserId: userId,
          type: "like",
          postId: postId,
          message: "liked your post",
        });
      }
    });
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
      await tx.update(posts).set({ 
        likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)` 
      }).where(eq(posts.id, postId));
    });
  }

  // Story operations
  async createStory(story: InsertStory): Promise<Story> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const [newStory] = await db.insert(stories).values({
      ...story,
      expiresAt,
    }).returning();
    return newStory;
  }

  async getActiveStories(): Promise<(Story & { user: User })[]> {
    const now = new Date();
    const result = await db
      .select({
        id: stories.id,
        userId: stories.userId,
        content: stories.content,
        imageUrl: stories.imageUrl,
        videoUrl: stories.videoUrl,
        createdAt: stories.createdAt,
        expiresAt: stories.expiresAt,
        user: users,
      })
      .from(stories)
      .innerJoin(users, eq(stories.userId, users.id))
      .where(gte(stories.expiresAt, now))
      .orderBy(desc(stories.createdAt));

    return result;
  }

  // Partner operations
  async sendPartnerRequest(userId: string, partnerId: string): Promise<void> {
    await db.insert(gooningPartners).values({
      userId,
      partnerId,
      status: "pending",
    });
  }

  async acceptPartnerRequest(userId: string, partnerId: string): Promise<void> {
    await db.update(gooningPartners)
      .set({ status: "accepted" })
      .where(and(eq(gooningPartners.userId, partnerId), eq(gooningPartners.partnerId, userId)));
  }

  async getPartners(userId: string): Promise<User[]> {
    const result = await db
      .select({ user: users })
      .from(gooningPartners)
      .innerJoin(users, eq(gooningPartners.partnerId, users.id))
      .where(and(eq(gooningPartners.userId, userId), eq(gooningPartners.status, "accepted")));

    return result.map(row => row.user);
  }

  async getPendingRequests(userId: string): Promise<(GooningPartner & { user: User })[]> {
    const result = await db
      .select({
        id: gooningPartners.id,
        userId: gooningPartners.userId,
        partnerId: gooningPartners.partnerId,
        status: gooningPartners.status,
        createdAt: gooningPartners.createdAt,
        user: users,
      })
      .from(gooningPartners)
      .innerJoin(users, eq(gooningPartners.userId, users.id))
      .where(and(eq(gooningPartners.partnerId, userId), eq(gooningPartners.status, "pending")));

    return result;
  }

  // Chat operations
  async getOrCreatePrivateChat(userId1: string, userId2: string): Promise<ChatRoom> {
    // Check if chat already exists
    const existingChat = await db
      .select({ chatRoom: chatRooms })
      .from(chatRooms)
      .innerJoin(chatRoomMembers, eq(chatRooms.id, chatRoomMembers.chatRoomId))
      .where(and(
        eq(chatRooms.isGroup, false),
        eq(chatRoomMembers.userId, userId1)
      ));

    for (const chat of existingChat) {
      const members = await db
        .select()
        .from(chatRoomMembers)
        .where(eq(chatRoomMembers.chatRoomId, chat.chatRoom.id));
      
      if (members.length === 2 && members.some(m => m.userId === userId2)) {
        return chat.chatRoom;
      }
    }

    // Create new chat
    const [newChat] = await db.insert(chatRooms).values({
      isGroup: false,
      createdBy: userId1,
    }).returning();

    // Add both users as members
    await db.insert(chatRoomMembers).values([
      { chatRoomId: newChat.id, userId: userId1 },
      { chatRoomId: newChat.id, userId: userId2 },
    ]);

    return newChat;
  }

  async getChatRooms(userId: string): Promise<(ChatRoom & { otherUser?: User; lastMessage?: Message })[]> {
    const userChats = await db
      .select({ chatRoom: chatRooms })
      .from(chatRoomMembers)
      .innerJoin(chatRooms, eq(chatRoomMembers.chatRoomId, chatRooms.id))
      .where(eq(chatRoomMembers.userId, userId));

    const result = [];
    for (const { chatRoom } of userChats) {
      let otherUser: User | undefined;
      
      if (!chatRoom.isGroup) {
        const members = await db
          .select({ user: users })
          .from(chatRoomMembers)
          .innerJoin(users, eq(chatRoomMembers.userId, users.id))
          .where(eq(chatRoomMembers.chatRoomId, chatRoom.id));
        
        otherUser = members.find(m => m.user.id !== userId)?.user;
      }

      const [lastMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.chatRoomId, chatRoom.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      result.push({
        ...chatRoom,
        otherUser,
        lastMessage,
      });
    }

    return result;
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getMessages(chatRoomId: string, limit = 50): Promise<(Message & { sender: User })[]> {
    const result = await db
      .select({
        id: messages.id,
        chatRoomId: messages.chatRoomId,
        senderId: messages.senderId,
        content: messages.content,
        messageType: messages.messageType,
        imageUrl: messages.imageUrl,
        videoUrl: messages.videoUrl,
        createdAt: messages.createdAt,
        sender: users,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.chatRoomId, chatRoomId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);

    return result.reverse(); // Return in chronological order
  }

  // Global chat operations
  async sendGlobalMessage(message: InsertGlobalMessage): Promise<GlobalMessage> {
    const [newMessage] = await db.insert(globalMessages).values(message).returning();
    return newMessage;
  }

  async getGlobalMessages(limit = 100): Promise<(GlobalMessage & { sender: User })[]> {
    const result = await db
      .select({
        id: globalMessages.id,
        senderId: globalMessages.senderId,
        content: globalMessages.content,
        createdAt: globalMessages.createdAt,
        sender: users,
      })
      .from(globalMessages)
      .innerJoin(users, eq(globalMessages.senderId, users.id))
      .orderBy(desc(globalMessages.createdAt))
      .limit(limit);

    return result.reverse(); // Return in chronological order
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotifications(userId: string, limit = 50): Promise<(Notification & { fromUser?: User; post?: Post })[]> {
    const result = await db
      .select({
        id: notifications.id,
        userId: notifications.userId,
        fromUserId: notifications.fromUserId,
        type: notifications.type,
        postId: notifications.postId,
        message: notifications.message,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        fromUser: users,
        post: posts,
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.fromUserId, users.id))
      .leftJoin(posts, eq(notifications.postId, posts.id))
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    return result;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    
    return result[0]?.count || 0;
  }
}

export const storage = new DatabaseStorage();
