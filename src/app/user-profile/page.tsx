// social-network\src\app\user-profile\page.tsx

"use client"

import React from 'react'
import { api } from '../../../convex/_generated/api'
import { useQuery } from 'convex/react'

const UserProfile = () => {
  const currentUser = useQuery(api.users.getMe)
  const userPosts = useQuery(api.posts.getUserPosts, currentUser ? { creator: currentUser._id } : 'skip')

  if (!currentUser) {
    return <div>Loading user profile...</div>
  }

  return (
    <div>
      <h1>{currentUser.name}'s Profile</h1>
      <h2>Posts:</h2>
      {userPosts ? (
        userPosts.map((post) => (
          <div key={post._id}>
            <h3>{post.title}</h3>
            {post.contentUrl && <img src={post.contentUrl} alt={post.title} />}
            <p>{post.description}</p>
          </div>
        ))
      ) : (
        <p>Loading posts...</p>
      )}
    </div>
  )
}

export default UserProfile