// social-network\src\app\feed\page.tsx

"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const Feed = () => {
  const posts = useQuery(api.posts.getAllPosts);

  if (!posts) {
    return <div className="flex justify-center items-center min-h-screen text-foreground">Loading...</div>;
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
            <li key={post._id} className="p-4 border border-border rounded-md">
              <h2 className="text-xl font-semibold text-primary mb-2">{post.title}</h2>
              <p className="text-muted-foreground mb-4">{post.description}</p>
              {post.contentUrl && (
                <div className="mb-4">
                  {post.contentUrl.endsWith(".mp4") ? (
                    <video controls className="w-full rounded-md">
                      <source src={post.contentUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <img src={post.contentUrl} alt={post.title} className="w-full rounded-md" />
                  )}
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-4">
                Posted on {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Feed;