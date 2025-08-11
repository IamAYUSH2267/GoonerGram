import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique().notNull(),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Posts table
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content"),
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  videoDuration: integer("video_duration"), // in seconds
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Stories table (24-hour content)
export const stories = pgTable("stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content"),
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Gooning partners (friends)
export const gooningPartners = pgTable("gooning_partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  partnerId: varchar("partner_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar("status").default("pending"), // pending, accepted, blocked
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat rooms (private and group)
export const chatRooms = pgTable("chat_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name"), // null for private chats
  isGroup: boolean("is_group").default(false),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat room members
export const chatRoomMembers = pgTable("chat_room_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatRoomId: varchar("chat_room_id").notNull().references(() => chatRooms.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatRoomId: varchar("chat_room_id").notNull().references(() => chatRooms.id, { onDelete: 'cascade' }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text"), // text, image, video
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Global chat messages
export const globalMessages = pgTable("global_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post likes
export const postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post comments
export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  fromUserId: varchar("from_user_id").references(() => users.id, { onDelete: 'cascade' }),
  type: varchar("type").notNull(), // like, comment, follow, unfollow
  postId: varchar("post_id").references(() => posts.id, { onDelete: 'cascade' }),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  stories: many(stories),
  sentPartnerRequests: many(gooningPartners, { relationName: "sentRequests" }),
  receivedPartnerRequests: many(gooningPartners, { relationName: "receivedRequests" }),
  chatRoomMemberships: many(chatRoomMembers),
  sentMessages: many(messages),
  globalMessages: many(globalMessages),
  postLikes: many(postLikes),
  postComments: many(postComments),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  likes: many(postLikes),
  comments: many(postComments),
}));

export const storiesRelations = relations(stories, ({ one }) => ({
  user: one(users, {
    fields: [stories.userId],
    references: [users.id],
  }),
}));

export const gooningPartnersRelations = relations(gooningPartners, ({ one }) => ({
  user: one(users, {
    fields: [gooningPartners.userId],
    references: [users.id],
    relationName: "sentRequests",
  }),
  partner: one(users, {
    fields: [gooningPartners.partnerId],
    references: [users.id],
    relationName: "receivedRequests",
  }),
}));

export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  creator: one(users, {
    fields: [chatRooms.createdBy],
    references: [users.id],
  }),
  members: many(chatRoomMembers),
  messages: many(messages),
}));

export const chatRoomMembersRelations = relations(chatRoomMembers, ({ one }) => ({
  chatRoom: one(chatRooms, {
    fields: [chatRoomMembers.chatRoomId],
    references: [chatRooms.id],
  }),
  user: one(users, {
    fields: [chatRoomMembers.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chatRoom: one(chatRooms, {
    fields: [messages.chatRoomId],
    references: [chatRooms.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const globalMessagesRelations = relations(globalMessages, ({ one }) => ({
  sender: one(users, {
    fields: [globalMessages.senderId],
    references: [users.id],
  }),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
}));

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  post: one(posts, {
    fields: [postComments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postComments.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  fromUser: one(users, {
    fields: [notifications.fromUserId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [notifications.postId],
    references: [posts.id],
  }),
}));

// Types and schemas
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Story = typeof stories.$inferSelect;
export type GooningPartner = typeof gooningPartners.$inferSelect;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type GlobalMessage = typeof globalMessages.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  likesCount: true,
  commentsCount: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
  expiresAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertGlobalMessageSchema = createInsertSchema(globalMessages).omit({
  id: true,
  createdAt: true,
});

export const insertPartnerRequestSchema = createInsertSchema(gooningPartners).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertGlobalMessage = z.infer<typeof insertGlobalMessageSchema>;
export type InsertPartnerRequest = z.infer<typeof insertPartnerRequestSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
