// social-network\src\app\feed\page.tsx

"use client";

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import React, { useState } from "react";
import { api } from "../../../convex/_generated/api";

const Feed = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  // Fetch user data
  const currentUser = useQuery(api.users.getMe);
  const createPost = useMutation(api.posts.createPost);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");

  const handleCreatePost = async () => {
    // Ensure user ID exists before proceeding
    if (!currentUser?._id) {
      console.error("User ID is undefined. Cannot create post.");
      return;
    }
  
    if (!title || !content || !description) return;
  
    try {
      await createPost({
        creator: currentUser._id,
        title,
        content,
        description,
        createdAt: Date.now(),
      });
      setShowModal(false);
      setTitle("");
      setContent("");
      setDescription("");
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };
  
  if (isLoading || !currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="feed-container">
      <button
        className="create-post-button"
        onClick={() => setShowModal(true)}
      >
        Create Post
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create a Post</h2>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={handleCreatePost}>Submit</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
