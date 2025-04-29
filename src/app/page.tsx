// social-network\src\app\page.tsx

import { SignInButton } from "@clerk/nextjs";
import ThemeSwitch from "@/components/theme-switch";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen items-center justify-items-center gap-8 p-8 sm:p-20 bg-background text-foreground font-sans">
      {/* Theme Switcher */}
      <header className="flex justify-between w-full max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          DiceFeed
        </h1>
        <ThemeSwitch />
      </header>

      {/* Hero Section */}
      <main className="text-center space-y-6 max-w-2xl">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
          Creativity Meets Competition
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Welcome to <span className="text-primary font-bold">DiceFeed</span>, a
          dynamic social network where you can share, explore, and compete with
          unique posts. Each week brings new excitement and fresh starts, where
          only one post can make it to the wall of fame. Good luck!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <SignInButton mode="redirect">
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-accent hover:text-accent-foreground transition">
              Join Now
            </button>
          </SignInButton>
          <a
            href="/wall-of-fame"
            className="bg-secondary text-secondary-foreground px-6 py-3 rounded-md font-medium hover:bg-muted hover:text-muted-foreground transition"
          >
            Wall of Fame
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-sm text-muted-foreground text-center">
        © {new Date().getFullYear()} DiceFeed. All Rights Reserved.
      </footer>
    </div>
  );
}
