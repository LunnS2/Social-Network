import { ConvexError, v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    creator: v.id("users"),
    title: v.string(),
    content: v.optional(v.id("_storage")),
    contentUrl: v.optional(v.string()),  // Added contentUrl here
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
      contentUrl: args.contentUrl,  // Insert contentUrl into the database
      description: args.description || "",
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

    // Attach URLs to stored content
    return await Promise.all(
      userPosts.map(async (post) => {
        if (post.content) {
          const url = await ctx.storage.getUrl(post.content);
          return { ...post, contentUrl: url };  // Add contentUrl dynamically
        }
        return post;
      })
    );
  },
});

export const getAllPosts = query({
  handler: async (ctx) => {
    const allPosts = await ctx.db.query("posts").collect();

    // Attach URLs to stored content
    const postsWithUrls = await Promise.all(
      allPosts.map(async (post) => {
        if (post.content) {
          const url = await ctx.storage.getUrl(post.content);
          return { ...post, contentUrl: url };  // Add contentUrl dynamically
        }
        return post;
      })
    );

    // Posts sorted by creation date
    return postsWithUrls.sort((a, b) => b.createdAt - a.createdAt);
  },
});