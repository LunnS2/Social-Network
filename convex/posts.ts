// social-network\convex\posts.ts

import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    creator: v.id("users"),
    title: v.string(),
    content: v.optional(v.id("_storage")),
    contentUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    createdAt: v.number(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to create a post.");
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
      content: args.content !== undefined ? args.content : undefined,
      contentUrl: args.contentUrl,
      description: args.description || "",
      createdAt: createdAt,
    });
  },
});

export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Fetch the post
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new ConvexError("Post not found.");
    }

    // Ensure the user is the creator of the post
    if (post.creator !== args.userId) {
      throw new ConvexError("You are not authorized to delete this post.");
    }

    // Delete the post
    await ctx.db.delete(args.postId);

    // Delete associated likes
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post_and_user", (q) => q.eq("postId", args.postId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    console.log(`Post ${args.postId} and associated likes deleted.`);
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

    return await Promise.all(
      userPosts.map(async (post) => {
        if (post.content) {
          const url = await ctx.storage.getUrl(post.content);
          return { ...post, contentUrl: url }; 
        }
        return post;
      })
    );
  },
});

export const getAllPosts = query({
  handler: async (ctx) => {
    const allPosts = await ctx.db.query("posts").collect();

    const postsWithUrls = await Promise.all(
      allPosts.map(async (post) => {
        if (post.content) {
          const url = await ctx.storage.getUrl(post.content);
          return { ...post, contentUrl: url || undefined };
        }
        return post;
      })
    );

    return postsWithUrls.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getMostLikedPost = mutation(async (ctx) => {
  const allPosts = await ctx.db.query("posts").collect();
  let mostLikedPost = null;
  let maxLikes = 0;

  for (const post of allPosts) {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post_and_user", (q) => q.eq("postId", post._id))
      .collect();

    if (likes.length > maxLikes) {
      mostLikedPost = post;
      maxLikes = likes.length;
    }
  }

  const existingWallOfFameEntries = await ctx.db.query("wallOfFame").collect();
  for (const entry of existingWallOfFameEntries) {
    await ctx.db.delete(entry._id);
  }

  if (mostLikedPost) {
    const wallOfFameEntry = await ctx.db.insert("wallOfFame", {
      postId: mostLikedPost._id,
      title: mostLikedPost.title,
      contentUrl: mostLikedPost.contentUrl,
      description: mostLikedPost.description,
      likes: maxLikes,
      createdAt: mostLikedPost.createdAt,
    });

    // Create a notification for the Wall of Fame winner
    await ctx.runMutation(api.notifications.createNotification, {
      userId: mostLikedPost.creator,
      type: "wallOfFame",
      postId: mostLikedPost._id,
    });
  }

  // Delete all posts and likes after determining the winner
  for (const post of allPosts) {
    await ctx.db.delete(post._id);
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post_and_user", (q) => q.eq("postId", post._id))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }
  }
});

export const getWallOfFame = query(async (ctx) => {
  const wallPost = await ctx.db.query("wallOfFame").first();
  return wallPost || null;
});