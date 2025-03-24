"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Image from "next/image";

export default function FollowsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
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

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

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
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen gap-8 px-8 py-8 sm:py-20 sm:px-24 bg-background text-foreground font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Search Functionality */}
        <div className="space-y-6">
          <input
            type="text"
            placeholder="Search for users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-3 border border-muted rounded-lg bg-muted text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
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
                            className="flex justify-between items-center p-4 rounded-lg bg-muted transition duration-300 hover:bg-muted/80"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="relative w-12 h-12">
                                <Image
                                  src={user.image || "/default-avatar.png"}
                                  alt={user.name || "User"}
                                  fill
                                  className="rounded-full object-cover"
                                />
                              </div>
                              <span className="font-medium text-foreground">
                                {user.name || "Unknown User"}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                handleFollowToggle(
                                  user._id,
                                  following?.some((f) => f?._id === user._id) ||
                                    false
                                )
                              }
                              className={`px-6 py-2 rounded-lg font-medium transition active:scale-95 ${
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
                  <p className="text-muted-foreground text-center">
                    No users found
                  </p>
                )
              ) : (
                <p className="text-muted-foreground text-center">
                  Searching...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Users Already Followed */}
        <div className="space-y-6">
          {following?.length === 0 ? (
            <p className="text-muted-foreground text-center">
              You don&apos;follow anyone yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {following?.map(
                (followedUser) =>
                  followedUser && (
                    <li
                      key={followedUser._id}
                      className="flex justify-between items-center p-4 rounded-lg bg-muted transition duration-300 hover:bg-muted/80"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-12">
                          <Image
                            src={followedUser.image || "/default-avatar.png"}
                            alt={followedUser.name || "User"}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-foreground">
                          {followedUser.name || "Unknown User"}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleFollowToggle(followedUser._id, true)
                        }
                        className="px-6 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition active:scale-95 font-medium"
                      >
                        Unfollow
                      </button>
                    </li>
                  )
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
