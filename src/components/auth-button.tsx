// social-network\src\components\auth-button.tsx

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import React from "react";

const AuthButton = () => {
  return (
    <header className="absolute top-0 right-0 p-2">
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
};

export default AuthButton;
