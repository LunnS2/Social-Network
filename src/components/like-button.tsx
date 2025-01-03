"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { Heart, HeartOff } from "lucide-react";

interface LikeButtonProps {
  postId: Id<"posts">;
  userId: Id<"users">;
}

const LikeButton = ({ postId, userId }: LikeButtonProps) => {
  const toggleLike = useMutation(api.likes.toggleLike);
  const likesCount = useQuery(api.likes.getLikesCount, { postId }) ?? 0;
  const hasLiked = useQuery(api.likes.hasLikedPost, { postId, userId }) ?? false;

  const [liked, setLiked] = useState(hasLiked);

  useEffect(() => {
    setLiked(hasLiked);
  }, [hasLiked]);

  const handleLike = async () => {
    try {
      await toggleLike({ postId, userId });
      setLiked(!liked); // Optimistic update
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleLike}
        className={`p-2 rounded-full transition ${
          liked ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"
        }`}
      >
        {liked ? <HeartOff /> : <Heart />}
      </button>
      <span className="text-sm">{likesCount} {likesCount === 1 ? "Like" : "Likes"}</span>
    </div>
  );
};

export default LikeButton;