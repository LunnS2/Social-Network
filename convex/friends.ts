// social-network\convex\friends.ts

import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query to get friends by user ID
export const getFriends = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("friends")
      .withIndex("by_user_friend", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq("status", "accepted"))
      .collect();
  },
});

// Mutation to send a friend request
export const sendFriendRequest = mutation({
  args: { userId: v.string(), friendId: v.string() },
  handler: async (ctx, args) => {
    if (args.userId === args.friendId) {
      throw new ConvexError("You cannot send a friend request to yourself.");
    }

    // Check if there's an existing friendship or pending request
    const existingRequest = await ctx.db
      .query("friends")
      .withIndex("by_user_friend", (q) => 
        q.eq("userId", args.userId).eq("friendId", args.friendId)
      )
      .first();

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        throw new ConvexError("Friend request already sent.");
      }
      if (existingRequest.status === "accepted") {
        throw new ConvexError("You are already friends.");
      }
      if (existingRequest.status === "blocked") {
        throw new ConvexError("You have blocked this user.");
      }
    }

    // Insert the new friend request as "pending"
    await ctx.db.insert("friends", {
      userId: args.userId,
      friendId: args.friendId,
      status: "pending",
    });
  },
});

// Mutation to accept a friend request
export const acceptFriendRequest = mutation({
  args: { userId: v.string(), friendId: v.string() },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("friends")
      .withIndex("by_user_friend", (q) => q.eq("userId", args.friendId).eq("friendId", args.userId))
      .first();

    if (!request || request.status !== "pending") {
      throw new ConvexError("Friend request not found.");
    }

    // Accept the friend request
    await ctx.db.patch(request._id, { status: "accepted" });

    // Add reverse entry for symmetry (confirm friendship in both directions)
    await ctx.db.insert("friends", {
      userId: args.userId,
      friendId: args.friendId,
      status: "accepted",
    });
  },
});

// Mutation to remove a friend
export const removeFriend = mutation({
  args: { userId: v.string(), friendId: v.string() },
  handler: async (ctx, args) => {
    const friendships = await ctx.db
      .query("friends")
      .withIndex("by_user_friend", (q) => q.eq("userId", args.userId).eq("friendId", args.friendId))
      .collect();

    for (const friendship of friendships) {
      await ctx.db.delete(friendship._id);
    }

    const reverseFriendships = await ctx.db
      .query("friends")
      .withIndex("by_user_friend", (q) => q.eq("userId", args.friendId).eq("friendId", args.userId))
      .collect();

    for (const reverse of reverseFriendships) {
      await ctx.db.delete(reverse._id);
    }
  },
});

// Query to get pending friend requests
export const getPendingRequests = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("friends")
      .withIndex("by_user_friend", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq("status", "pending"))
      .collect();
  },
});

// New query to check friendship status
export const getFriendshipStatus = query({
  args: { userId: v.string(), friendId: v.string() },
  handler: async (ctx, args) => {
    const friendship = await ctx.db
      .query("friends")
      .withIndex("by_user_friend", (q) => 
        q.eq("userId", args.userId).eq("friendId", args.friendId)
      )
      .first();
    
    return friendship ? friendship.status : "not_friends";
  },
});
