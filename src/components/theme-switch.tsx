//social-network\src\components\theme-switch.tsx

"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

const ThemeSwitch = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const effectiveTheme = resolvedTheme === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : resolvedTheme;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="bg-transparent relative">
        <Button variant="outline" size="icon">
          <SunIcon
            className={`h-[1.2rem] w-[1.2rem] transition-all ${
              effectiveTheme === "dark" ? "rotate-0 scale-0" : "rotate-90 scale-100"
            }`}
          />
          <MoonIcon
            className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
              effectiveTheme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"
            }`}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="bg-card text-card-foreground">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitch;
