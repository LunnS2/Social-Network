// social-network/src/components/notification-count.tsx

"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useConvexAuth } from "convex/react";

function NotificationCount() {
  // Get authentication status
  const { isAuthenticated, isLoading } = useConvexAuth();

  // If authentication is loading or user is not authenticated, return null
  if (isLoading || !isAuthenticated) {
    return null;
  }

  // Fetch notifications only when the user is authenticated
  const notificationData = useQuery(api.notifications.getUserNotifications);

  if (notificationData === undefined) {
    return null;
  }

  const { notifications } = notificationData;
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  if (unreadCount === 0) {
    return null;
  }

  return (
    <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-primary rounded-full">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}

export default NotificationCount;
