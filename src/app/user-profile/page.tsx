"use client";

import React from "react";
import { api } from "../../../convex/_generated/api";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import Post from "@/components/post";
import { Id } from "../../../convex/_generated/dataModel";

const UserProfile = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.getMe);
  const userId = currentUser?._id;
  const userPosts = useQuery(
    api.posts.getUserPosts,
    userId ? { creator: userId } : "skip"
  );
  const followers = useQuery(
    api.follows.getFollowers,
    userId ? { userId } : "skip"
  );
  const following = useQuery(
    api.follows.getFollowing,
    userId ? { userId } : "skip"
  );
  const allUsers = useQuery(api.users.getUsers);
  const deletePost = useMutation(api.posts.deletePost);

  if (isLoading || !isAuthenticated) return null;

  const handleDelete = async (postId: Id<"posts">) => {
    if (!currentUser) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (confirmed) {
      await deletePost({ postId, userId: currentUser._id });
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        Loading user profile...
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen gap-8 px-8 py-8 sm:py-20 sm:px-24 bg-background text-foreground font-sans">
      {/* Stats */}
      <div className="w-full grid grid-cols-2 gap-4 bg-card text-card-foreground p-6 rounded-lg shadow-lg">
        <div className="text-center">
          <p className="text-lg font-semibold">Followers</p>
          <p className="text-xl font-bold">
            {followers ? followers.length : "Loading..."}
          </p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Following</p>
          <p className="text-xl font-bold">
            {following ? following.length : "Loading..."}
          </p>
        </div>
      </div>

      {/* Posts Section */}
      <section className="max-w-4xl w-full mx-auto">
        {userPosts && userPosts.length > 0 ? (
          <ul className="space-y-4">
            {userPosts.map((post) => (
              <Post
                key={post._id}
                post={{ ...post, contentUrl: post.contentUrl ?? undefined }}
                currentUser={currentUser}
                allUsers={allUsers || []}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        ) : (
          <p className="flex justify-center text-muted-foreground">
            No posts available.
          </p>
        )}
      </section>
    </div>
  );
};

export default UserProfile;
