"use client";

import React, { useMemo } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Post from "@/components/post";

const Feed = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const posts = useQuery(api.posts.getAllPosts);
  const currentUser = useQuery(api.users.getMe);
  const allUsers = useQuery(api.users.getUsers);
  const deletePost = useMutation(api.posts.deletePost);

  // Ensure currentUser is included in allUsers
  const allUsersList = useMemo(() => {
    if (!allUsers || !currentUser) return [];
    return [...allUsers, currentUser].filter(
      (user, index, self) => self.findIndex((u) => u._id === user._id) === index
    );
  }, [allUsers, currentUser]);

  // Get authentication status
  if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleDelete = async (postId: Id<"posts">) => {
    if (!currentUser) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (confirmed) {
      await deletePost({ postId, userId: currentUser._id });
    }
  };

  // Show loading state while fetching data
  if (!posts || !currentUser || !allUsers) {
    return (
      <div className="flex justify-center items-center min-h-screen text-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <p className="mb-8 flex justify-center text-muted-foreground">
        users you follow display at the top
      </p>
      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground">No posts available.</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <Post
              key={post._id}
              post={post}
              currentUser={currentUser}
              allUsers={allUsersList}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Feed;
