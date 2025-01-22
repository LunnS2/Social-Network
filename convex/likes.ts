// social-network\convex\likes.ts

import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";

// Mutation to toggle like on a post
export const toggleLike = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to like a post.");
    }

    // Check if the user already liked the post
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_post_and_user", (q) =>
        q.eq("postId", args.postId).eq("userId", args.userId)
      )
      .unique();

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new ConvexError("Post not found.");
    }

    if (existingLike) {
      // If the like exists, remove it (unlike)
      await ctx.db.delete(existingLike._id);
      console.log(`User ${args.userId} unliked post ${args.postId}`);

      // Remove the like notification if it exists
      const notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user_and_creation", (q) =>
          q.eq("userId", post.creator)
        )
        .filter((q) =>
          q.and(
            q.eq(q.field("type"), "like"),
            q.eq(q.field("postId"), args.postId),
            q.eq(q.field("actorId"), args.userId)
          )
        )
        .collect();

      if (notifications.length > 0) {
        await ctx.db.delete(notifications[0]._id);
      }
    } else {
      // If the like doesn't exist, add a new like
      await ctx.db.insert("likes", {
        postId: args.postId,
        userId: args.userId,
      });
      console.log(`User ${args.userId} liked post ${args.postId}`);

      // Create a notification for the post owner
      if (post.creator !== args.userId) {
        await ctx.runMutation(api.notifications.createNotification, {
          userId: post.creator,
          type: "like",
          postId: args.postId,
          actorId: args.userId,
        });
      }
    }
  },
});

// Query to get the number of likes for a post
export const getLikesCount = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post_and_user", (q) => q.eq("postId", args.postId))
      .collect();

    return likes.length;
  },
});

// Query to check if the user has liked a post
export const hasLikedPost = query({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const like = await ctx.db
      .query("likes")
      .withIndex("by_post_and_user", (q) =>
        q.eq("postId", args.postId).eq("userId", args.userId)
      )
      .unique();

    return !!like; // Returns true if the user has liked the post, false otherwise
  },
});

/* Note to self: !! is used to explicitly convert a value to a boolean (true or false), ensuring the result is always a strict boolean.
! negates the value and converts it to a boolean, but it doesn't strictly ensure that the result is true or false in the same way.
The second ! negates the result of the first negation, turning it back into the final strict boolean value.*/