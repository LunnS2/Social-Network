// social-network\src\app\user-profile\page.tsx
"use client";

import React from "react";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";

const UserProfile = () => {
  const currentUser = useQuery(api.users.getMe);
  const userPosts = useQuery(
    api.posts.getUserPosts,
    currentUser ? { creator: currentUser._id } : "skip"
  );
  const followers = useQuery(
    api.follows.getFollowers,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const following = useQuery(
    api.follows.getFollowing,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        Loading user profile...
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen gap-8 px-8 py-8 sm:py-20 sm:px-24 bg-background text-foreground font-sans">
      {/* Header */}
      <header className="flex justify-between items-center w-full max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          {currentUser.name}'s Profile
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center space-y-8 w-full max-w-3xl">
        <div className="w-full grid grid-cols-2 gap-4 bg-card text-card-foreground p-6 rounded-lg shadow-lg">
          <div className="text-center">
            <p className="text-lg font-semibold">Followers</p>
            <p className="text-xl font-bold">
              {followers ? followers.length : "Loading..."}
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">Following</p>
            <p className="text-xl font-bold">
              {following ? following.length : "Loading..."}
            </p>
          </div>
        </div>

        <section className="w-full space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Posts</h2>
          {userPosts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-secondary text-secondary-foreground p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  {post.contentUrl && (
                    <img
                      src={post.contentUrl}
                      alt={post.title}
                      className="w-full h-40 object-cover rounded-md mb-4"
                    />
                  )}
                  <p className="text-muted-foreground">{post.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Loading posts...</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default UserProfile;
