"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { Heart, HeartOff } from "lucide-react";

interface LikeButtonProps {
  postId: Id<"posts">;
  userId: Id<"users"> | null;
}

const LikeButton = ({ postId, userId }: LikeButtonProps) => {
  // Always call hooks unconditionally at the top
  const likesCount = useQuery(api.likes.getLikesCount, { postId }) ?? 0;
  const userLikeData =
    useQuery(api.likes.hasLikedPost, userId ? { postId, userId } : "skip") ??
    false;

  const toggleLike = useMutation(api.likes.toggleLike);
  const [liked, setLiked] = useState(false);
  const [isDisabled, setIsDisabled] = useState(!userId);

  useEffect(() => {
    setLiked(userLikeData);
    setIsDisabled(!userId);
  }, [userLikeData, userId]);

  const handleLike = async () => {
    if (!userId) return;

    try {
      setLiked(!liked);
      await toggleLike({ postId, userId });
    } catch (error) {
      console.error("Failed to toggle like:", error);
      setLiked(userLikeData);
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
