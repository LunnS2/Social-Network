// social-network\convex\posts.ts

import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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

    // Delete associated comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    console.log(`Post ${args.postId}, associated likes, and comments deleted.`);
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
          const url = await ctx.storage.getUrl(post.content as Id<"_storage">);
          return { ...post, contentUrl: url }; 
        }
        return post;
      })
    );
  },
});

export const getAllPosts = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!currentUser) {
      throw new ConvexError("User not found");
    }

    // Get followed users
    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_followed", (q) => q.eq("followerId", currentUser._id))
      .collect();

    const followedUserIds = new Set(following.map((follow) => follow.followedId));

    // Fetch all posts
    const allPosts = await ctx.db.query("posts").collect();

    // Sort: posts from followed users first, then by createdAt
    const sortedPosts = allPosts.sort((a, b) => {
      const aIsFollowed = followedUserIds.has(a.creator);
      const bIsFollowed = followedUserIds.has(b.creator);

      if (aIsFollowed && !bIsFollowed) return -1;
      if (!aIsFollowed && bIsFollowed) return 1;

      return b.createdAt - a.createdAt;
    });

    // Add content URLs
    const postsWithUrls = await Promise.all(
      sortedPosts.map(async (post) => {
        if (post.content) {
          const url = await ctx.storage.getUrl(post.content);
          return { ...post, contentUrl: url || undefined };
        }
        return post;
      })
    );

    return postsWithUrls;
  },
});


export const getWallOfFame = query(async (ctx) => {
  const wallPost = await ctx.db
    .query("wallOfFame")
    .order("desc")
    .first(); // Fetch latest entry
  return wallPost || null;
});

export const wallOfFamePickingProcess = mutation(async (ctx) => {
  // Fetch all posts
  const allPosts = await ctx.db.query("posts").collect();
  let mostLikedPost = null;
  let maxLikes = 0;

  // Find the post with the most likes
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

  // NOTE: KEEPING THE STEPS IN THIS ORDER IS CRUCIAL TO AVOID UNWANTED BEHAVIOR

  // Exit early if no posts exist
  if (!mostLikedPost) {
    console.log("No posts exist. Skipping Wall of Fame update.");
    return;
  }

  // 1: delete all notifications
  const allNotifications = await ctx.db.query("notifications").collect();
  for (const notification of allNotifications) {
    await ctx.db.delete(notification._id);
  }

  // 2: delete previous wall of fame entries
  const existingWallOfFameEntries = await ctx.db.query("wallOfFame").collect();
  for (const entry of existingWallOfFameEntries) {
    await ctx.db.delete(entry._id);
  }

  // 3: announce the winner
  let contentUrl: string | undefined = mostLikedPost.contentUrl || undefined;
  if (mostLikedPost.content) {
    contentUrl = await ctx.storage.getUrl(mostLikedPost.content) || undefined;
  }

  const wallOfFameEntry = await ctx.db.insert("wallOfFame", {
    postId: mostLikedPost._id,
    title: mostLikedPost.title,
    contentUrl,
    description: mostLikedPost.description,
    likes: maxLikes,
    createdAt: mostLikedPost.createdAt,
  });

  // 4: create winner notification
  await ctx.runMutation(api.notifications.createNotification, {
    userId: mostLikedPost.creator,
    type: "wallOfFame",
    postId: mostLikedPost._id,
  });

  // 5: delete all posts, associated likes, and comments
  for (const post of allPosts) {
    // Delete the post
    await ctx.db.delete(post._id);

    // Delete associated likes
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post_and_user", (q) => q.eq("postId", post._id))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    // Delete associated comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_postId", (q) => q.eq("postId", post._id))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }
  }

  console.log("All posts, associated likes, and comments deleted.");
});

