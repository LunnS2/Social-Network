// social-network\src\app\follows\page.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export default function FollowsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const me = useQuery(api.users.getMe);
  const following = useQuery(
    api.follows.getFollowing,
    userId ? { userId } : "skip"
  );
  const searchResults = useQuery(
    api.users.searchUsers,
    searchQuery.trim() ? { query: searchQuery.trim() } : "skip"
  );
  const followUser = useMutation(api.follows.followUser);
  const unfollowUser = useMutation(api.follows.unfollowUser);

  useEffect(() => {
    if (me) {
      setUserId(me._id);
    }
  }, [me]);

  const handleFollowToggle = async (
    targetUserId: Id<"users">,
    isFollowing: boolean
  ) => {
    if (isFollowing) {
      await unfollowUser({ followedId: targetUserId });
    } else {
      await followUser({ followedId: targetUserId });
    }
  };

  if (!me || !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-extrabold text-primary text-center mb-8">
        Follow Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Search Functionality */}
        <div className="space-y-4">
        <h2 className="text-xl text-center font-semibold text-primary">Search</h2>
          <input
            type="text"
            placeholder="Search for users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-muted rounded-lg bg-muted text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
          />

          {searchQuery.trim() && (
            <div>
              {searchResults ? (
                searchResults.length > 0 ? (
                  <ul className="space-y-4">
                    {searchResults.map(
                      (user) =>
                        user &&
                        user._id !== userId && (
                          <li
                            key={user._id}
                            className="flex justify-between items-center p-4 rounded-lg bg-muted transition"
                          >
                            <div className="flex items-center space-x-3">
                              <img
                                src={user.image || "/default-avatar.png"}
                                alt={user.name || "User"}
                                className="w-10 h-10 rounded-full"
                              />
                              <span className="font-medium text-foreground">
                                {user.name || "Unknown User"}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                handleFollowToggle(
                                  user._id,
                                  following?.some((f) => f?._id === user._id) || false
                                )
                              }
                              className={`px-4 py-2 rounded-lg font-medium transition active:scale-95 ${
                                following?.some((f) => f?._id === user._id)
                                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  : "bg-primary text-primary-foreground hover:bg-primary/90"
                              }`}
                            >
                              {following?.some((f) => f?._id === user._id)
                                ? "Unfollow"
                                : "Follow"}
                            </button>
                          </li>
                        )
                    )}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center">No users found</p>
                )
              ) : (
                <p className="text-muted-foreground text-center">Searching...</p>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Users Already Followed */}
        <div className="space-y-4">
          <h2 className="text-xl text-center font-semibold text-primary">Following</h2>
          <ul className="space-y-4">
            {following?.map(
              (followedUser) =>
                followedUser && (
                  <li
                    key={followedUser._id}
                    className="flex justify-between items-center p-4 rounded-lg bg-muted transition"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={followedUser.image || "/default-avatar.png"}
                        alt={followedUser.name || "User"}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="font-medium text-foreground">
                        {followedUser.name || "Unknown User"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleFollowToggle(followedUser._id, true)}
                      className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition active:scale-95 font-medium"
                    >
                      Unfollow
                    </button>
                  </li>
                )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
