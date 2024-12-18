// social-network\convex\posts.ts

import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const createPost = mutation({
  args: {
    creator:v.id("users"),
    title:v.string(),
    content:v.string(),
    createdAt: v.number(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to create a post.")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

      if (!user || user._id !== args.creator) {
        throw new ConvexError("Invalid creator ID.");
      }

      const createdAt = Date.now();

    await ctx.db.insert("posts", {
      creator: args.creator,
      title: args.title,
      content: args.content,
      createdAt: createdAt,
    });
  },
});

export const getUserPosts = query({
  args: {
    creator: v.id("users"),
  },

  handler: async (ctx, args) => {

    const userPosts = await ctx.db
      .query("posts")
      .withIndex("by_creator", (q) => q.eq("creator", args.creator))
      .collect();

    return userPosts;
  },
});


export const getAllPosts = query({
  handler: async (ctx) => {
    
    const allPosts = await ctx.db.query("posts").collect();

    // Posts sorted by creation date 
    return allPosts.sort((a, b) => b.createdAt - a.createdAt);
  },
});
