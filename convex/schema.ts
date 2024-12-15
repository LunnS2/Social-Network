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
    creator:v.string(),
    title:v.string(),
    content:v.string(),
  })
});