// social-network\src\app\feed\page.tsx

"use client";

import React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Post from "@/components/post";

const Feed = () => {
  const posts = useQuery(api.posts.getAllPosts);
  const currentUser = useQuery(api.users.getMe);
  const allUsers = useQuery(api.users.getUsers);
  const deletePost = useMutation(api.posts.deletePost);

  const handleDelete = async (postId: Id<"posts">) => {
    if (!currentUser) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (confirmed) {
      await deletePost({ postId, userId: currentUser._id });
    }
  };

  if (!posts || !currentUser || !allUsers) {
    return (
      <div className="flex justify-center items-center min-h-screen text-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Feed</h1>
      </header>

      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground">No posts available.</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <Post
              key={post._id}
              post={post}
              currentUser={currentUser}
              allUsers={allUsers}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Feed;
