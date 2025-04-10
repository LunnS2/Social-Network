// social-network\src\components\side-bar.tsx

"use client";

import React, { useState } from "react";
import NavLink from "./nav-link";
import { Bell, Crown, Handshake, House, Menu, NewspaperIcon, SquarePlus, User, X } from "lucide-react";
import AuthButton from "./auth-button";
import NotificationCount from "./notification-count";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button (Always Visible) */}
      <button 
        className="fixed top-4 left-4 z-50 bg-card p-2 rounded-full shadow-lg" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`z-50 fixed left-0 top-0 w-60 h-screen bg-card shadow-lg flex flex-col items-center py-6 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Navigation Links */}
        <nav className="flex flex-col space-y-8">
          <NavLink href="/" icon={<House />} label="Welcome" onClick={() => setIsOpen(false)} />
          <NavLink href="feed" icon={<NewspaperIcon />} label="Feed" onClick={() => setIsOpen(false)} />
          <NavLink href="create-post" icon={<SquarePlus />} label="Post" onClick={() => setIsOpen(false)} />
          <NavLink href="follows" icon={<Handshake />} label="Follow" onClick={() => setIsOpen(false)} />
          <NavLink href="wall-of-fame" icon={<Crown />} label="Winner" onClick={() => setIsOpen(false)} />
          <NavLink href="user-profile" icon={<User />} label="Profile" onClick={() => setIsOpen(false)} />
          <NavLink href="notifications" icon={<Bell />} label="Notifications" badge={<NotificationCount />} onClick={() => setIsOpen(false)} />
        </nav>

        {/* Pushes AuthButton to the bottom */}
        <div className="flex-1"></div>

        {/* Auth Button */}
        <div className="pb-4">
          <AuthButton />
        </div>
      </aside>

      {/* Overlay for closing sidebar when clicked outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black bg-opacity-50" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default SideBar;