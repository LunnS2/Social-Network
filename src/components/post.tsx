// social-network\src\components\post.tsx

import React, { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { X, MessageCircle, Trash2 } from "lucide-react";
import LikeButton from "@/components/like-button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

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

const Post: React.FC<PostProps> = ({ post, currentUser, allUsers, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const comments = useQuery(api.comments.getComments, { postId: post._id });
  const createComment = useMutation(api.comments.createComment);
  const deleteComment = useMutation(api.comments.deleteComment);

  // Ensure currentUser is considered in the lookup
  const postCreator =
    post.creator === currentUser?._id
      ? currentUser
      : allUsers.find((user) => user._id === post.creator);

  console.log("Post Creator:", postCreator);

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

  return (
    <li className="p-4 border border-border rounded-md relative">
      <div className="flex items-center mb-4">
        <div className="relative group">
          <img
            key={postCreator?.image} // Forces React to update when the image changes
            src={postCreator?.image || "/default-avatar.png"}
            alt={postCreator?.name || "User"}
            className="w-10 h-10 rounded-full mr-3"
          />
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            {postCreator?.name || "Unknown User"}
          </span>
        </div>
        <h2 className="text-xl font-semibold text-primary">{post.title}</h2>
      </div>

      {currentUser?._id === post.creator && (
        <button
          onClick={() => onDelete(post._id)}
          className="absolute top-2 right-2 text-primary hover:text-primary/80 p-2 rounded-full focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {post.description && <p className="text-muted-foreground mb-4">{post.description}</p>}
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
                    <img
                      src={commentSender?.image || "/default-avatar.png"}
                      alt={commentSender?.name || "User"}
                      className="w-8 h-8 rounded-full"
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
