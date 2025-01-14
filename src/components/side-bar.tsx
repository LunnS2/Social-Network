// social-network\src\components\side-bar.tsx

"use client";

import React from "react";
import NavLink from "./nav-link";
import { Bell, Crown, Handshake, House, NewspaperIcon, SquarePlus, User } from "lucide-react";
import AuthButton from "./auth-button";

const SideBar = () => {
  return (
    <aside className="fixed left-0 top-0 w-38 h-screen bg-card shadow-lg flex flex-col items-center py-6">
      {/* Navigation Links */}
      <nav className="flex flex-col space-y-8">
        <NavLink href="/" icon={<House/>} label="Welcome" />
        <NavLink href="feed" icon={<NewspaperIcon />} label="Feed" />
        <NavLink href="create-post" icon={<SquarePlus />} label="Post" />
        <NavLink href="friendship" icon={<Handshake />} label="Frienships" />
        <NavLink href="wall-of-fame" icon={<Crown />} label="Winner" />
        <NavLink href="user-profile" icon={<User />} label="Profile"/>
        <NavLink href="notifications" icon={<Bell />} label="Notifications" />
        {/* Add more links as needed */}
      </nav>

      {/* Pushes AuthButton to the bottom */}
      <div className="flex-1"></div>

      {/* Auth Button */}
      <div className="pb-4">
        <AuthButton />
      </div>
    </aside>
  );
};

export default SideBar;
