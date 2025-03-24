"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { Heart, HeartOff } from "lucide-react";

interface LikeButtonProps {
  postId: Id<"posts">;
  userId: Id<"users"> | null; // Updated to accept null
}

const LikeButton = ({ postId, userId }: LikeButtonProps) => {
  const toggleLike = useMutation(api.likes.toggleLike);
  const likesCount = useQuery(api.likes.getLikesCount, { postId }) ?? 0;
  const hasLiked = userId
    ? (useQuery(api.likes.hasLikedPost, { postId, userId }) ?? false)
    : false;

  const [liked, setLiked] = useState(hasLiked);
  const [isDisabled, setIsDisabled] = useState(!userId);

  useEffect(() => {
    setLiked(hasLiked);
    setIsDisabled(!userId);
  }, [hasLiked, userId]);

  const handleLike = async () => {
    if (!userId) return;

    try {
      setLiked(!liked); // Optimistic update
      await toggleLike({ postId, userId });
    } catch (error) {
      console.error("Failed to toggle like:", error);
      setLiked(hasLiked); // Rollback on error
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleLike}
        disabled={isDisabled}
        className={`p-2 rounded-full transition ${
          isDisabled
            ? "opacity-50 cursor-not-allowed"
            : liked
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
        }`}
        aria-label={liked ? "Unlike post" : "Like post"}
      >
        {liked ? (
          <HeartOff className="w-5 h-5" />
        ) : (
          <Heart className="w-5 h-5" />
        )}
      </button>
      <span className="text-sm">
        {likesCount} {likesCount === 1 ? "Like" : "Likes"}
      </span>
    </div>
  );
};

export default LikeButton;
