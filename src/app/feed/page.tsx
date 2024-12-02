import { useConvexAuth } from "convex/react";
import React from "react";

const Feed = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  
  return <div>Feed</div>;
};

export default Feed;
