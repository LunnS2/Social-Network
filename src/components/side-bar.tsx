// social-network\src\components\side-bar.tsx

"use client";

import React, { useEffect, useState } from "react";
import NavLink from "./nav-link";
import { NewspaperIcon } from "lucide-react";

const SideBar = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <aside className="fixed left-0 top-0 w-20 h-screen bg-card shadow-lg flex flex-col items-center py-6 transition-all duration-300 ease-in-out transform hover:w-28 md:w-24 md:hover:w-28">
      <nav className="flex flex-col space-y-8">
        <NavLink href="feed" icon={<NewspaperIcon />} label="Feed" />
        {/* Add more links as needed */}
      </nav>
    </aside>
  );
};

export default SideBar;
