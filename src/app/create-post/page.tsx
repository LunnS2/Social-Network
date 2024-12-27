// social-network\src\app\create-post\page.tsx

"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import React, { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const CreatePost = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  // Fetch user data
  const currentUser = useQuery(api.users.getMe);
  const createPost = useMutation(api.posts.createPost);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCreatePost = async () => {
    if (!currentUser?._id || !title || !file) {
      console.error("Missing required fields.");
      return;
    }

    try {
      setUploading(true);
      // Upload media file
      const url = await generateUploadUrl();
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Failed to upload media.");
      }

      const { storageId } = await response.json();
      const contentUrl = `${url}/${storageId}`;

      // Create post with uploaded media
      await createPost({
        creator: currentUser._id,
        title,
        content: storageId,
        contentUrl,
        description,
        createdAt: Date.now(),
      });

      setTitle("");
      setDescription("");
      setFile(null);
      setShowModal(false);
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setUploading(false);
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen text-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-accent hover:text-accent-foreground transition"
          onClick={() => setShowModal(true)}
        >
          Create Post
        </button>
      </header>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create a Post</h2>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 mb-4 border border-border rounded-md"
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 mb-4 border border-border rounded-md"
            />
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full p-2 mb-4 border border-border rounded-md"
            />
            <div className="flex justify-end space-x-4">
              <button
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition"
                onClick={handleCreatePost}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Submit"}
              </button>
              <button
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-muted hover:text-muted-foreground transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;

