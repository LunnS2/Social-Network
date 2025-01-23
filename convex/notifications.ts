// social-network\convex\notifications.ts

import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a notification
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("like"), v.literal("comment"), v.literal("wallOfFame"), v.literal("follow"), v.literal("unfollow")),
    postId: v.optional(v.id("posts")),
    actorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const createdAt = Date.now();
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      postId: args.postId,
      actorId: args.actorId,
      createdAt,
      isRead: false,
    });
  },
});

// Get notifications for a user
export const getUserNotifications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_creation", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const notificationCount = notifications.length;

    const detailedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const post = notification.postId ? await ctx.db.get(notification.postId) : null;
        const actor = notification.actorId ? await ctx.db.get(notification.actorId) : null;
        return {
          ...notification,
          postTitle: post?.title || null,
          actorName: actor?.name || "Unknown User",
        };
      })
    );

    return {
      notifications: detailedNotifications,
      count: notificationCount
    };
  },
});

// Mark a notification as read
export const markNotificationAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new ConvexError("Notification not found");
    }

    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});