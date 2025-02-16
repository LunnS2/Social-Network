// social-network\src\app\create-post\page.tsx

"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import React, { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Plus } from "lucide-react";

const CreatePost = () => {
  // Get authentication status
  const { isAuthenticated, isLoading } = useConvexAuth();
  
  // If authentication is loading or user is not authenticated, return null
  if (isLoading || !isAuthenticated) {
    return null;
  }
  // Fetch user data
  const currentUser = useQuery(api.users.getMe);
  const createPost = useMutation(api.posts.createPost);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleCreatePost = async () => {
    if (!currentUser?._id || !title || !file) {
      setError("Please fill in all required fields and select a file.");
      return;
    }
  
    try {
      setUploading(true);
      setError(null);
  
      const uploadUrl = await generateUploadUrl();
  
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
  
      if (!response.ok) throw new Error("Failed to upload media.");
  
      const { storageId } = (await response.json()) as { storageId: Id<"_storage"> };
  
      await createPost({
        creator: currentUser._id,
        title,
        content: storageId,
        contentUrl: "", // This will be populated in the backend
        description,
        createdAt: Date.now(),
      });
  
      handleCloseModal();
    } catch (error) {
      console.error("Failed to create post:", error);
      setError("Failed to create post. Please try again.");
    } finally {
      setUploading(false);
    }
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setTitle("");
    setDescription("");
    setFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto relative">
      <button
        className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition"
        onClick={() => setShowModal(true)}
        aria-label="Create Post"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create a Post</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
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
            {previewUrl &&
              (file?.type.startsWith("image/") ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-auto rounded-md mb-4"
                />
              ) : file?.type.startsWith("video/") ? (
                <video controls className="w-full h-auto rounded-md mb-4">
                  <source src={previewUrl} type={file.type} />
                  Your browser does not support the video tag.
                </video>
              ) : null)}
            <div className="flex justify-end space-x-4">
              <button
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition"
                onClick={handleCreatePost}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Submit"}
              </button>
              <button
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-muted hover:text-muted-foreground transition"
                onClick={handleCloseModal}
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