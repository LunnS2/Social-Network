"use client";

import React from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Crown } from "lucide-react";
import Image from "next/image";

const WallOfFame = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const wallPost = useQuery(api.posts.getWallOfFame);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  if (!wallPost) {
    return (
      <div className="flex justify-center align-middle p-8">
        No post in Wall of Fame yet!
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-primary flex justify-center">
        <Crown className="w-8 h-8" />
      </div>
      <div className="p-4 border border-border rounded-md">
        <h2 className="text-xl font-semibold mb-2">{wallPost.title}</h2>
        <p className="text-muted-foreground mb-4">{wallPost.description}</p>
        {wallPost.contentUrl ? (
          <div className="relative w-full h-64">
            <Image
              src={wallPost.contentUrl}
              alt={wallPost.title}
              fill
              className="rounded-md object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No image available</p>
        )}
        <p className="text-sm text-muted-foreground mt-4">
          {wallPost.likes} Likes - Posted on{" "}
          {new Date(wallPost.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default WallOfFame;
