// social-network\src\app\layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/providers/convex-client-provider";
import SideBar from "@/components/side-bar";

export const metadata: Metadata = {
  title: "DiceFeed",
  description: "Your social-network of choice",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider dynamic>
      <html lang="en">
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>
              <div className="flex min-h-screen items-start">
                {/* Sidebar */}
                <SideBar />
                {/* Main Content */}
                <main className="flex-1 pt-8 md:pt-0">{children}</main>
              </div>
            </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
