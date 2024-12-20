// social-network\src\components\side-bar.tsx

"use client";

import React from "react";
import NavLink from "./nav-link";
import { NewspaperIcon, SmileIcon } from "lucide-react";
import AuthButton from "./auth-button";

const SideBar = () => {
  return (
    <aside className="fixed left-0 top-0 w-20 h-screen bg-card shadow-lg flex flex-col items-center py-6 transition-all duration-300 ease-in-out transform hover:w-28 md:w-24 md:hover:w-28">
      {/* Navigation Links */}
      <nav className="flex flex-col space-y-8">
        <NavLink href="/" icon={<SmileIcon />} label="Welcome" />
        <NavLink href="feed" icon={<NewspaperIcon />} label="Feed" />
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


