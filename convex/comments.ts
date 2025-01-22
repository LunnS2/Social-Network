// social-network\convex\comments.ts

import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";

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
    });

    // Fetch the post to get the creator's ID
    const post = await ctx.db.get(args.postId);
    if (post && post.creator !== args.sender) {
      // Create a notification for the post owner
      await ctx.runMutation(api.notifications.createNotification, {
        userId: post.creator,
        type: "comment",
        postId: args.postId,
        actorId: args.sender,
      });
    }
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
    
    const commentsWithUserInfo = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.sender);
        return {
          ...comment,
          senderName: user?.name || "Unknown User",
          senderImage: user?.image || "",
        };
      })
    );
    
    return commentsWithUserInfo;
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