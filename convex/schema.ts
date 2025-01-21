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
  }).index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_name", ["name"]),

  posts: defineTable({
    creator: v.id("users"),
    title: v.string(),
    content: v.optional(v.id("_storage")),
    contentUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_creator", ["creator"]),

  comments: defineTable({
    sender: v.id("users"),
    content: v.string(),
    createdAt:v.number(),
    postId: v.id("posts"),
  }),

  likes: defineTable({
    postId: v.string(),
    userId: v.string(),
  }).index("by_post_and_user", ["postId", "userId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("like"), v.literal("comment"), v.literal("wallOfFame"), v.literal("follow"), v.literal("unfollow")),
    postId: v.optional(v.id("posts")),
    actorId: v.optional(v.id("users")),
    createdAt: v.number(),
    isRead: v.boolean(),
  }).index("by_user_and_creation", ["userId", "createdAt"]),

  follows: defineTable({
    followerId: v.id("users"),
    followedId: v.id("users"),
  })
    .index("by_follower_and_followed", ["followerId", "followedId"])
    .index("by_followed", ["followedId"]),

  wallOfFame: defineTable({
    postId: v.id("posts"),
    title: v.string(),
    contentUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    likes: v.number(),
    createdAt: v.number(),
  }),
});
