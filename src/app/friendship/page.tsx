// social-network/src/app/friendship/page.tsx
"use client"

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

const FriendsPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const me = useQuery(api.users.getMe);
  const allUsers = useQuery(api.users.getUsers);
  const friends = useQuery(api.friends.getFriends, me?._id ? { userId: me._id } : "skip");
  const pendingRequests = useQuery(api.friends.getPendingRequests, me?._id ? { userId: me._id } : "skip");
  const sendFriendRequest = useMutation(api.friends.sendFriendRequest);
  const acceptFriendRequest = useMutation(api.friends.acceptFriendRequest);
  const removeFriend = useMutation(api.friends.removeFriend);

  const filteredUsers = allUsers?.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSendRequest = async (friendId: Id<"users">) => {
    if (!me?._id) return;
    try {
      await sendFriendRequest({ userId: me._id, friendId });
      alert('Friend request sent!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleAcceptRequest = async (friendId: Id<"users">) => {
    if (!me?._id) return;
    try {
      await acceptFriendRequest({ userId: me._id, friendId });
      alert('Friend request accepted!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleRemoveFriend = async (friendId: Id<"users">) => {
    if (!me?._id) return;
    try {
      await removeFriend({ userId: me._id, friendId });
      alert('Friend removed!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Friends Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Search Users</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for users"
          className="border p-2 rounded mr-2 w-full"
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div key={user._id} className="border p-4 rounded flex items-center justify-between">
              <div className="flex items-center">
                <img src={user.image} alt={user.name || 'User'} className="w-10 h-10 rounded-full mr-2" />
                <span>{user.name || 'Unnamed User'}</span>
              </div>
              <button 
                onClick={() => handleSendRequest(user._id)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Send Request
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Your Friends</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends?.map((friend) => {
            const friendUser = allUsers?.find(user => user._id === friend.friendId);
            return friendUser ? (
              <div key={friend._id} className="border p-4 rounded flex items-center justify-between">
                <div className="flex items-center">
                  <img src={friendUser.image} alt={friendUser.name || 'Friend'} className="w-10 h-10 rounded-full mr-2" />
                  <span>{friendUser.name || 'Unnamed Friend'}</span>
                </div>
                <button 
                  onClick={() => handleRemoveFriend(friendUser._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ) : null;
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Pending Friend Requests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingRequests?.map((request) => {
            const requestUser = allUsers?.find(user => user._id === request.friendId);
            return requestUser ? (
              <div key={request._id} className="border p-4 rounded flex items-center justify-between">
                <div className="flex items-center">
                  <img src={requestUser.image} alt={requestUser.name || 'User'} className="w-10 h-10 rounded-full mr-2" />
                  <span>{requestUser.name || 'Unnamed User'}</span>
                </div>
                <button 
                  onClick={() => handleAcceptRequest(requestUser._id)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Accept
                </button>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;