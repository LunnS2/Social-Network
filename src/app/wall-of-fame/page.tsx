// social-network\src\app\wall-of-fame

"use client"

import React from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Crown } from "lucide-react";

const WallOfFame = () => {
  // Get authentication status
  const { isAuthenticated, isLoading } = useConvexAuth();

  // If authentication is loading or user is not authenticated, return null
  if (isLoading || !isAuthenticated) {
    return null;
  }

  const wallPost = useQuery(api.posts.getWallOfFame);

  if (!wallPost) {
    return <div className="flex justify-center align-middle p-8">No post in Wall of Fame yet!</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-primary flex justify-center">
      <Crown />
      </div>
      <div className="p-4 border border-border rounded-md">
        <h2 className="text-xl font-semibold mb-2">{wallPost.title}</h2>
        <p className="text-muted-foreground mb-4">{wallPost.description}</p>
        {wallPost.contentUrl ? (
          <img
            src={wallPost.contentUrl}
            alt={wallPost.title}
            className="w-full rounded-md"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        ) : (
          <p className="text-sm text-muted-foreground">No image available</p>
        )}
        <p className="text-sm text-muted-foreground mt-4">
          {wallPost.likes} Likes - Posted on {new Date(wallPost.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default WallOfFame;
