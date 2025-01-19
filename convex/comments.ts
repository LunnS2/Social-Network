// social-network\convex\comments.ts

import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const createComment = mutation({
  args: {
    sender: v.id("users"),
    content: v.string(),
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

export const getComments = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("postId"), args.postId))
      .order("desc")
      .collect();
    
    return comments;
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to delete a comment.");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new ConvexError("Comment not found.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user || user._id !== comment.sender) {
      throw new ConvexError("You don't have permission to delete this comment.");
    }

    await ctx.db.delete(args.commentId);
  },
});