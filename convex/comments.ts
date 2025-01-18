// social-network\convex\comments.ts

import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const createComment = mutation({
  args: {
    sender: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
    postId: v.id("posts"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to create a comment.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user || user._id !== args.sender) {
      throw new ConvexError("Invalid creator ID.");
    }

    const createdAt = Date.now();

    await ctx.db.insert("comments", {
      sender: args.sender,
      content: args.content,
      createdAt: createdAt,
      postId: args.postId,
    })
  }, 
});

