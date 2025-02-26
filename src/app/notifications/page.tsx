// social-network\src\app\notifications\page.tsx

"use client";

import React from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

function Notifications() {
  // Get authentication status
    const { isAuthenticated, isLoading } = useConvexAuth();
  
    // If authentication is loading or user is not authenticated, return null
    if (isLoading || !isAuthenticated) {
      return null;
    }
  const notificationData = useQuery(api.notifications.getUserNotifications);
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);

  if (notificationData === undefined) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { notifications } = notificationData;

  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    await markAsRead({ notificationId });
  };

  const getNotificationMessage = (notification: any) => {
    switch (notification.type) {
      case "like":
        return `${notification.actorName} liked your post "${notification.postTitle}"`;
      case "comment":
        return `${notification.actorName} commented on your post "${notification.postTitle}"`;
      case "follow":
        return `${notification.actorName} started following you`;
      case "unfollow":
        return `${notification.actorName} unfollowed you`;
      case "wallOfFame":
        return `Your post made it to the Wall of Fame! Go check it out`;
      default:
        return "You have a new notification";
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen p-8">
      {notifications.length === 0 ? (
        <p className="text-muted-foreground">No notifications yet.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li
              key={notification._id.toString()}
              className={`p-6 rounded-lg shadow-md ${notification.isRead ? "bg-muted" : "bg-card"}`}
            >
              <p className="text-card-foreground mb-2">
                {getNotificationMessage(notification)}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
              {!notification.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notification._id)}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;