import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPostSchema, insertStorySchema, insertMessageSchema, insertGlobalMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { username, bio } = req.body;
      const user = await storage.updateUserProfile(userId, { username, bio });
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Post routes
  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertPostSchema.parse({ ...req.body, userId });
      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const posts = await storage.getPosts(limit);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get('/api/posts/user/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const posts = await storage.getPostsByUser(userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  app.post('/api/posts/:postId/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      await storage.likePost(postId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete('/api/posts/:postId/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      await storage.unlikePost(postId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  // Story routes
  app.post('/api/stories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storyData = insertStorySchema.parse({ ...req.body, userId });
      const story = await storage.createStory(storyData);
      res.json(story);
    } catch (error) {
      console.error("Error creating story:", error);
      res.status(500).json({ message: "Failed to create story" });
    }
  });

  app.get('/api/stories', isAuthenticated, async (req: any, res) => {
    try {
      const stories = await storage.getActiveStories();
      res.json(stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  // Partner routes
  app.post('/api/partners/request', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { partnerId } = req.body;
      await storage.sendPartnerRequest(userId, partnerId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending partner request:", error);
      res.status(500).json({ message: "Failed to send partner request" });
    }
  });

  app.post('/api/partners/accept', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { partnerId } = req.body;
      await storage.acceptPartnerRequest(userId, partnerId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error accepting partner request:", error);
      res.status(500).json({ message: "Failed to accept partner request" });
    }
  });

  app.get('/api/partners', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const partners = await storage.getPartners(userId);
      res.json(partners);
    } catch (error) {
      console.error("Error fetching partners:", error);
      res.status(500).json({ message: "Failed to fetch partners" });
    }
  });

  app.get('/api/partners/requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getPendingRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching partner requests:", error);
      res.status(500).json({ message: "Failed to fetch partner requests" });
    }
  });

  // Chat routes
  app.get('/api/chats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chats = await storage.getChatRooms(userId);
      res.json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  app.post('/api/chats/private', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { partnerId } = req.body;
      const chat = await storage.getOrCreatePrivateChat(userId, partnerId);
      res.json(chat);
    } catch (error) {
      console.error("Error creating private chat:", error);
      res.status(500).json({ message: "Failed to create private chat" });
    }
  });

  app.get('/api/chats/:chatId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { chatId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const messages = await storage.getMessages(chatId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/chats/:chatId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { chatId } = req.params;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        chatRoomId: chatId,
        senderId: userId,
      });
      const message = await storage.sendMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Global chat routes
  app.get('/api/global/messages', isAuthenticated, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const messages = await storage.getGlobalMessages(limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching global messages:", error);
      res.status(500).json({ message: "Failed to fetch global messages" });
    }
  });

  app.post('/api/global/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertGlobalMessageSchema.parse({
        ...req.body,
        senderId: userId,
      });
      const message = await storage.sendGlobalMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending global message:", error);
      res.status(500).json({ message: "Failed to send global message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
