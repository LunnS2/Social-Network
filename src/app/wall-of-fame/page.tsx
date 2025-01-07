// social-network\src\app\wall-of-fame

"use client"

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const WallOfFame = () => {
  const wallPost = useQuery(api.posts.getWallOfFame);

  if (!wallPost) {
    return <div className="p-8">No post in Wall of Fame yet!</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-4">Wall of Fame</h1>
      <div className="p-4 border border-border rounded-md">
        <h2 className="text-xl font-semibold mb-2">{wallPost.title}</h2>
        <p className="text-muted-foreground mb-4">{wallPost.description}</p>
        {wallPost.contentUrl && (
          <img
            src={wallPost.contentUrl}
            alt={wallPost.title}
            className="w-full rounded-md"
          />
        )}
        <p className="text-sm text-muted-foreground mt-4">
          {wallPost.likes} Likes - Posted on {new Date(wallPost.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default WallOfFame;
