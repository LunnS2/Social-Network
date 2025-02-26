// social-network\src\components\post.tsx

import React, { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { X, MessageCircle, Trash2, UserPlus, UserMinus } from "lucide-react";
import LikeButton from "@/components/like-button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Image from "next/image";

interface PostProps {
  post: {
    _id: Id<"posts">;
    _creationTime: number;
    creator: Id<"users">;
    title: string;
    content?: Id<"_storage">;
    contentUrl?: string;
    description?: string;
    createdAt: number;
  };
  currentUser: any;
  allUsers: any[];
  onDelete: (postId: Id<"posts">) => void;
}

const Post: React.FC<PostProps> = ({
  post,
  currentUser,
  allUsers,
  onDelete,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const comments = useQuery(api.comments.getComments, { postId: post._id });
  const createComment = useMutation(api.comments.createComment);
  const deleteComment = useMutation(api.comments.deleteComment);

  // Add these lines for follow functionality
  const isFollowing = useQuery(api.follows.isFollowing, {
    followedId: post.creator,
  });
  const followUser = useMutation(api.follows.followUser);
  const unfollowUser = useMutation(api.follows.unfollowUser);

  const postCreator =
    post.creator === currentUser?._id
      ? currentUser
      : allUsers.find((user) => user._id === post.creator);

  const handleCreateComment = async () => {
    if (newComment.trim() && currentUser) {
      await createComment({
        sender: currentUser._id,
        content: newComment,
        postId: post._id,
      });
      setNewComment("");
    }
  };

  const handleDeleteComment = async (commentId: Id<"comments">) => {
    await deleteComment({ commentId });
  };

  // Add this function for follow/unfollow
  const handleFollowToggle = async () => {
    if (isFollowing) {
      await unfollowUser({ followedId: post.creator });
    } else {
      await followUser({ followedId: post.creator });
    }
  };

  return (
    <li className="p-4 border border-border rounded-md relative">
      <div className="flex items-center mb-4">
        <div className="relative group">
          <Image
            key={postCreator?.image}
            src={postCreator?.image || "/default-avatar.png"}
            alt={postCreator?.name || "User"}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full mr-3"
            unoptimized={!!postCreator?.image?.startsWith("http")}
          />
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            {postCreator?.name || "Unknown User"}
          </span>
        </div>
        <h2 className="text-xl font-semibold text-primary overflow-hidden text-ellipsis">{post.title}</h2>

        {/* Add follow/unfollow button */}
        {currentUser?._id !== post.creator && (
          <button
            onClick={handleFollowToggle}
            className="ml-4 text-primary hover:text-primary/80 p-2 rounded-full focus:outline-none"
          >
            {isFollowing ? (
              <UserMinus className="w-5 h-5" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {currentUser?._id === post.creator && (
        <button
          onClick={() => onDelete(post._id)}
          className="absolute top-2 right-2 text-primary hover:text-primary/80 p-2 rounded-full focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {post.description && (
        <p className="text-muted-foreground mb-4 overflow-hidden text-ellipsis">{post.description}</p>
      )}

      {post.contentUrl && (
        <div className="mb-4">
          <Image
            src={post.contentUrl}
            alt={post.title}
            width={500}
            height={300}
            className="w-full rounded-md"
            unoptimized={!!post.contentUrl.startsWith("http")}
          />
        </div>
      )}

      <div className="flex items-center space-x-4">
        <LikeButton postId={post._id} userId={currentUser?._id} />
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 text-primary hover:text-primary/80"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{comments?.length || 0}</span>
        </button>
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        Posted on {new Date(post.createdAt).toLocaleDateString()}
      </p>

      {/* Comments section */}
      {showComments && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Comments</h3>
          <ul className="space-y-2 mt-2">
            {comments?.map((comment) => {
              const commentSender =
                comment.sender === currentUser?._id
                  ? currentUser
                  : allUsers.find((user) => user._id === comment.sender);

              return (
                <li key={comment._id} className="flex items-start space-x-2">
                  <div className="relative group">
                    <Image
                      src={commentSender?.image || "/default-avatar.png"}
                      alt={commentSender?.name || "User"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                      unoptimized={!!commentSender?.image?.startsWith("http")}
                    />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      {commentSender?.name || "Unknown User"}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <p>{comment.content}</p>
                  </div>
                  {comment.sender === currentUser?._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mt-2 flex">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-grow border rounded-l-md px-2 py-1"
            />
            <button
              onClick={handleCreateComment}
              className="bg-primary text-white px-4 py-1 rounded-r-md"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

export default Post;
