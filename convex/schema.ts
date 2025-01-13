// social-network\convex\schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    image: v.string(),
    tokenIdentifier: v.string(),
    isOnline: v.boolean(),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),
  
  posts: defineTable({
    creator: v.string(),
    title: v.string(),
    content: v.optional(v.id("_storage")),
    contentUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_creator", ["creator"]),

  likes: defineTable({
    postId: v.string(),
    userId: v.string(),
  }).index("by_post_and_user", ["postId", "userId"]),

  friends: defineTable({
    userId: v.string(),
    friendId: v.string(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("blocked")),
  }).index("by_user_friend", ["userId", "friendId"]).index("by_friend_user", ["friendId", "userId"]),
  
  wallOfFame: defineTable({
    postId: v.id("posts"),
    title: v.string(),
    contentUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    likes: v.number(),
    createdAt: v.number(),
  }),
});
