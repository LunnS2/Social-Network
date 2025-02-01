// social-network\src\app\follows\page.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export default function FollowsPage() {
  // Get authentication status
  const { isAuthenticated, isLoading } = useConvexAuth();

  // If authentication is loading or user is not authenticated, return null
  if (isLoading || !isAuthenticated) {
    return null;
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
    return <div className="text-muted-foreground text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8 bg-background text-foreground">
      <h1 className="text-3xl font-bold text-primary">
        User Search and Follow Management
      </h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search for users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-muted rounded-md bg-muted text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus:ring focus:ring-accent"
        />
      </div>

      {searchQuery.trim() && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">
            Search Results
          </h2>
          {searchResults ? (
            searchResults.length > 0 ? (
              <ul className="space-y-4">
                {searchResults.map(
                  (user) =>
                    user &&
                    user._id !== userId && (
                      <li
                        key={user._id}
                        className="flex justify-between items-center p-4 rounded-md bg-muted hover:bg-accent"
                      >
                        <span className="font-medium text-foreground">
                          {user.name || "Unknown User"}
                        </span>
                        <button
                          onClick={() =>
                            handleFollowToggle(
                              user._id,
                              following?.some((f) => f?._id === user._id) ||
                                false
                            )
                          }
                          className={`px-4 py-2 rounded-md font-medium transition ${
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
              <p className="text-muted-foreground">No users found</p>
            )
          ) : (
            <p className="text-muted-foreground">Loading search results...</p>
          )}
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-primary">
          Users You're Following
        </h2>
        <ul className="space-y-4">
          {following?.map(
            (followedUser) =>
              followedUser && (
                <li
                  key={followedUser._id}
                  className="flex justify-between items-center p-4 rounded-md bg-muted hover:bg-accent"
                >
                  <span className="font-medium text-foreground">
                    {followedUser.name || "Unknown User"}
                  </span>
                  <button
                    onClick={() => handleFollowToggle(followedUser._id, true)}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition font-medium"
                  >
                    Unfollow
                  </button>
                </li>
              )
          )}
        </ul>
      </div>
    </div>
  );
}
