// social-network\convex\follows.ts

import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const followUser = mutation({
  args: { followedId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const follower = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!follower) {
      throw new ConvexError("Follower not found");
    }

    const followed = await ctx.db.get(args.followedId);
    if (!followed) {
      throw new ConvexError("User to follow not found");
    }

    // Check if already following
    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_followed", (q) =>
        q.eq("followerId", follower._id).eq("followedId", followed._id)
      )
      .unique();

    if (existingFollow) {
      throw new ConvexError("Already following this user");
    }

    await ctx.db.insert("follows", {
      followerId: follower._id,
      followedId: followed._id,
    });

    // Create a notification for the followed user
    await ctx.runMutation(api.notifications.createNotification, {
      userId: followed._id,
      type: "follow",
      actorId: follower._id,
    });
  },
});

export const unfollowUser = mutation({
  args: { followedId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const follower = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!follower) {
      throw new ConvexError("Follower not found");
    }

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_followed", (q) =>
        q.eq("followerId", follower._id).eq("followedId", args.followedId)
      )
      .unique();

    if (!follow) {
      throw new ConvexError("Not following this user");
    }

    await ctx.db.delete(follow._id);

    // Create a notification for the unfollowed user
    await ctx.runMutation(api.notifications.createNotification, {
      userId: args.followedId,
      type: "unfollow",
      actorId: follower._id,
    });
  },
});

export const getFollowers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_followed", (q) => q.eq("followedId", args.userId))
      .collect();

    return Promise.all(
      followers.map(async (follow) => {
        const user = await ctx.db.get(follow.followerId);
        return user;
      })
    );
  },
});

export const getFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_followed", (q) => q.eq("followerId", args.userId))
      .collect();

    return Promise.all(
      following.map(async (follow) => {
        const user = await ctx.db.get(follow.followedId);
        return user;
      })
    );
  },
});

export const isFollowing = query({
  args: { followedId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const follower = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!follower) {
      return false;
    }

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower_and_followed", (q) =>
        q.eq("followerId", follower._id).eq("followedId", args.followedId)
      )
      .unique();

    return !!follow;
  },
});