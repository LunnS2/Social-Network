// social-network\src\app\friendship\page.tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

const Friendship = () => {
  const [userId, setUserId] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // for loading state
  const [statusMessage, setStatusMessage] = useState<string>(""); // for status message

  // Queries for users, friends, and pending requests
  const users = useQuery(api.users.getUsers);
  const friends = useQuery(api.friends.getFriends, { userId });
  const pendingRequests = useQuery(api.friends.getPendingRequests, { userId });

  // Mutations for friend actions
  const sendFriendRequest = useMutation(api.friends.sendFriendRequest);
  const acceptFriendRequest = useMutation(api.friends.acceptFriendRequest);
  const removeFriend = useMutation(api.friends.removeFriend);

  // Fetch current user's ID on mount (replace this with your actual logic)
  useEffect(() => {
    const currentUserId = "currentUserId"; // Replace with actual user ID fetching logic
    setUserId(currentUserId);
  }, []);

  // Filter users based on search input
  const filteredUsers = search
    ? (users || []).filter((user) =>
        user.name?.toLowerCase().includes(search.toLowerCase())
      )
    : users || [];

  // Helper function to handle actions (send, accept, remove)
  const handleAction = async (action: Function, friendId: string, actionType: string) => {
    try {
      setLoading(true);
      setStatusMessage(""); // Reset any previous status message
      await action({ userId, friendId });

      // Display success message based on action type
      if (actionType === "send") {
        setStatusMessage("Friend request sent!");
      } else if (actionType === "accept") {
        setStatusMessage("Friend request accepted!");
      } else if (actionType === "remove") {
        setStatusMessage("Friend removed!");
      }
    } catch (error) {
      setStatusMessage("An error occurred. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Component for rendering friend lists (Search Results, Pending Requests, Friends)
  const FriendList = ({ title, items, actionButtonText, onAction, actionType }: any) => (
    <div className="mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul>
        {items.map((item: any) => (
          <li key={item.friendId || item._id} className="flex justify-between mb-2">
            <div className="flex items-center">
              <img
                src={item.image}
                alt={item.name}
                className="w-10 h-10 rounded-full mr-4"
              />
              <span>{item.name || item.friendId}</span>
            </div>
            <button
              onClick={() => onAction(item.friendId || item._id)}
              disabled={loading} // Disable button while loading
              className={`p-2 text-white ${actionButtonText === "Accept" ? "bg-green-500" : "bg-red-500"}`}
            >
              {loading ? "Processing..." : actionButtonText}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Friendship</h1>

      {statusMessage && (
        <div className="mb-4 p-2 bg-green-100 text-green-700">
          {statusMessage}
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Search Users</h2>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name"
          className="border p-2 w-full"
        />
        <FriendList
          title="Search Results"
          items={filteredUsers}
          actionButtonText="Send Request"
          onAction={(friendId: string) => handleAction(sendFriendRequest, friendId, "send")}
          actionType="send"
        />
      </div>

      <FriendList
        title="Pending Requests"
        items={pendingRequests?.filter((request: any) => request.status === "pending") || []}
        actionButtonText="Accept"
        onAction={(friendId: string) => handleAction(acceptFriendRequest, friendId, "accept")}
        actionType="accept"
      />

      <FriendList
        title="Friends"
        items={friends || []}
        actionButtonText="Remove"
        onAction={(friendId: string) => handleAction(removeFriend, friendId, "remove")}
        actionType="remove"
      />
    </div>
  );
};

export default Friendship;
